///<reference path="typings\express\express.d.ts"/>
///<reference path="typings\express-session\express-session.d.ts"/>
///<reference path="typings\passport\passport.d.ts"/>
///<reference path="typings\body-parser\body-parser.d.ts"/>
///<reference path="typings\cookie-parser\cookie-parser.d.ts"/>
var config = require('config');
var _ = require('underscore');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var passport = require('passport');
var literki = require('./scripts/literki');
var literki_server = require('./scripts/literki_server');
var db = require('./scripts/db');
var util = require('./scripts/util');
var app = express();
app.use(cookieParser());
app.use(session({ secret: '1234567890qwerty' }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(lessMiddleware(__dirname, {
    dest: __dirname + '/../Public'
}));
app.use(express.static(__dirname + '/../Public'));
app.set('view engine', 'jade');
app.locals.pretty = true;
var uri = config.MongoDb.uri;
var repo = new db.GameRepository();
repo.open(uri);
var strategy = config.Passport.strategy;
switch (strategy) {
    case 'Google': {
        var GoogleStrategy = require('passport-google-openidconnect').Strategy;
        passport.use(new GoogleStrategy({
            clientID: config.GoogleAuthorization.clientID,
            clientSecret: config.GoogleAuthorization.clientSecret,
            callbackURL: config.GoogleAuthorization.callbackURL
        }, function (iss, sub, profile, accessToken, refreshToken, done) {
            repo.loadOrCreateUser(profile.id, profile.displayName, function (err, user) {
                return done(err, user);
            });
        }));
        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });
        passport.deserializeUser(function (id, done) {
            repo.loadUser(id, function (err, user) { return done(err, user); });
        });
        app.get('/auth/google', passport.authenticate('google-openidconnect'));
        app.get('/auth/google/return', passport.authenticate('google-openidconnect', {
            successRedirect: '/main.html',
            failureRedirect: '/login.html'
        }));
        app.get('/auth/google/signout', function (req, res) {
            req.logout();
            res.redirect('/login.html');
        });
        break;
    }
    case 'Http': {
        var users = new Array();
        var HttpStrategy = require('passport-http').BasicStrategy;
        passport.use(new HttpStrategy({}, function (userName, password, done) {
            //hack for mocha tests, never use Http strategy in the production
            var id = password;
            users.push({
                id: id,
                userName: userName
            });
            var user = _.last(users);
            done(null, user);
        }));
        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });
        passport.deserializeUser(function (id, done) {
            var user = _.find(users, function (user) { return user.id == id; });
            done(null, user);
        });
        app.get('/auth/http', passport.authenticate('basic'), function (req, res) {
            res.end('Authentifaction successfull');
        });
        break;
    }
    default: {
        throw new Error("Unknown passport strategy: " + strategy);
    }
}
var auth = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.json({ errorMessage: "Błąd uwierzytelnienia użytkownika." });
};
app.get('/login.html', function (req, res) {
    res.render('login', { title: 'login' });
});
app.get('/:pageName.html', auth, function (req, res) {
    res.render(req.params.pageName, { title: req.params.pageName });
});
app.get('/game/new', auth, function (req, res) {
    var player = new literki.GamePlayer();
    player.userId = req.user.id;
    player.playerName = "Irenka";
    player.remainingTime = 15 * 60;
    var players = new Array();
    players.push(player);
    var game = new literki_server.GameRun_Server(req.user.googleId);
    game.newGame(players);
    var state = game.state;
    repo.newState(state, function (err, gameId) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        repo.loadState(gameId, function (err, state) {
            if (err != null) {
                errorMessages = errorMessages.concat(util.formatError(err));
            }
            res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
        });
    });
});
app.get('/game/list', auth, function (req, res) {
    repo.allGames(function (err, games) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ games: games, errorMessage: errorMessages });
    });
});
app.get('/game/get', auth, function (req, res) {
    var gameId = req.query.gameId;
    repo.loadState(gameId, function (err, state) {
        var errorMessages;
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
    });
});
app.get('/game/join', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req, call) { return call(game.join()); }); });
app.get('/game/start', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req, call) { return call(game.start()); }); });
app.get('/game/pause', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req, call) { return call(game.pause()); }); });
app.get('/game/fold', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req, call) { return call(game.fold()); }); });
app.get('/game/exchange', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req, call) { return call(game.exchange(req.query.exchangeLetters)); }); });
app.post('/game/approve', auth, function (req, res) {
    var approve = req.body.approve;
    simpleGameMethodCall(req, res, function (game, req, call) {
        game.renderMove();
        repo.existWords(game.getNewWords().map(function (w) { return w.word; }), function (err, exists) {
            call(game.approveMove(approve, exists));
        });
    }, req.body.gameId);
});
app.post('/game/move', auth, function (req, res) {
    var move = req.body;
    simpleGameMethodCall(req, res, function (game, req, call) { return call(game.makeMove(move)); }, move.gameId);
});
app.post('/player/alive', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req, call) {
    var forceRefresh = game.getCurrentPlayer().userId != req.body.currentPlayerId ||
        game.state.playState != req.body.playState ||
        game.getPlayers().length != req.body.playersCount;
    var result = game.alive();
    result.forceRefresh = forceRefresh;
    return call(result);
}, req.body.gameId); });
app.get('/server/alive', auth, function (req, res) {
    res.json({ errorMessage: undefined });
});
function simpleGameMethodCall(req, res, call, gameId) {
    if (gameId === void 0) { gameId = req.query.gameId; }
    repo.loadState(gameId, function (err, state) {
        var errorMessages;
        if (err != null || !state) {
            if (err) {
                errorMessages = util.formatError(err);
            }
            res.json({ state: state, errorMessage: errorMessages });
        }
        else {
            var game = new literki_server.GameRun_Server(req.user.id);
            state = literki.GameState.fromJSON(state);
            game.runState(state);
            call(game, req, function (result) {
                var errMsg = result.errorMessage;
                if (errMsg != null) {
                    res.json({ state: state, errorMessage: errMsg });
                }
                else {
                    state = game.state;
                    repo.saveState(state, function (err) {
                        if (err != null) {
                            errorMessages = errorMessages.concat(util.formatError(err));
                        }
                        res.json({ state: state, userId: req.user.id, forceRefresh: result.forceRefresh, errorMessage: errorMessages });
                    });
                }
            });
        }
    });
}
var server;
function start() {
    var port = process.env.port || 1337;
    console.log('Literki start');
    console.log('Literki port: ' + port);
    server = app.listen(port, '0.0.0.0');
}
exports.start = start;
function stop() {
    if (server) {
        console.log('Literki shutdown');
        server.close();
    }
}
exports.stop = stop;
function getGameRepository() {
    return repo;
}
exports.getGameRepository = getGameRepository;
//# sourceMappingURL=server.js.map