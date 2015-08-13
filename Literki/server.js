///<reference path="typings\express\express.d.ts"/>
///<reference path="typings\express-session\express-session.d.ts"/>
///<reference path="typings\passport\passport.d.ts"/>
///<reference path="typings\body-parser\body-parser.d.ts"/>
///<reference path="typings\cookie-parser\cookie-parser.d.ts"/>
var config = require('config');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var passport = require('passport');
var GoogleStrategy = require('passport-google-openidconnect').Strategy;
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
var port = process.env.port || 1337;
console.log('Literki port: ' + port);
app.listen(port, '0.0.0.0');
var repo = new db.GameRepository();
repo.open();
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
app.get('/:pageName.html', function (req, res) {
    res.render(req.params.pageName, { title: req.params.pageName });
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
var auth = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.json({ errorMessage: "Not authenticated" });
};
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
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
    });
});
app.get('/game/join', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) { return game.join(); }); });
app.get('/game/start', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) { return game.start(); }); });
app.get('/game/pause', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) { return game.pause(); }); });
app.get('/game/fold', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) { return game.fold(); }); });
app.get('/game/exchange', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) { return game.exchange(req.query.exchangeLetters); }); });
app.get('/game/approve', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) { return game.approveMove(req.query.approve); }); });
app.post('/game/move', auth, function (req, res) {
    var move = req.body;
    simpleGameMethodCall(req, res, function (game, req) { return game.makeMove(move); }, move.gameId);
});
app.post('/player/alive', auth, function (req, res) { return simpleGameMethodCall(req, res, function (game, req) {
    var gameId = req.body.gameId;
    var currentPlayerId = req.body.currentPlayerId;
    var playState = req.body.playState;
    var result = game.alive();
    result.forceRefresh = game.getCurrentPlayer().userId != currentPlayerId || game.state.playState != playState;
    return result;
}, req.body.gameId); });
function simpleGameMethodCall(req, res, call, gameId) {
    if (gameId === void 0) { gameId = req.query.gameId; }
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        }
        else {
            var game = new literki_server.GameRun_Server(req.user.id);
            game.runState(state);
            var result = call(game, req);
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
        }
    });
}
//# sourceMappingURL=server.js.map