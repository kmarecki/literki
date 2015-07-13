///<reference path="typings\express\express.d.ts"/>
///<reference path="typings\express-session\express-session.d.ts"/>
///<reference path="typings\passport\passport.d.ts"/>
///<reference path="typings\body-parser\body-parser.d.ts"/>
///<reference path="typings\cookie-parser\cookie-parser.d.ts"/>
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
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
app.use(express.static(__dirname + '/../public'));
var port = process.env.port || 1337;
app.listen(port);
var repo = new db.GameRepository();
repo.open();
passport.use(new GoogleStrategy({
    clientID: '699211361113-6b5hmrk8169iipecd81tpq9it0s0aim4.apps.googleusercontent.com',
    clientSecret: 'Lc6wOH0NjHGYRw5KgJfxftQr',
    callbackURL: 'http://localhost:1337/auth/google/return',
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
    var game = new literki_server.GameRun_Server();
    game.newGame(players);
    var state = game.getState();
    repo.newState(state, function (err, gameId) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        repo.loadState(gameId, function (err, state) {
            if (err != null) {
                errorMessages = errorMessages.concat(util.formatError(err));
            }
            res.json({ state: state, errorMessage: errorMessages });
        });
    });
});
app.get('/game/join', auth, function (req, res) {
    var gameId = req.query.gameId;
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ errorMessage: errorMessages });
        }
        else if (state != null) {
            var game = new literki_server.GameRun_Server();
            game.runState(state);
            var player = new literki.GamePlayer();
            player.userId = req.user.id;
            player.playerName = "Krzyś";
            player.remainingTime = 15 * 60;
            if (game.addPlayer(player)) {
                state = game.getState();
                repo.saveState(state, function (err) {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ state: state, errorMessage: errorMessages });
                });
            }
            else {
                res.json({ state: state, errorMessage: "Player not added" });
            }
        }
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
        res.json({ state: state, errorMessage: errorMessages });
    });
});
app.get('/game/start', auth, function (req, res) {
    var gameId = req.query.gameId;
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        if (state.runState == 0 /* Created */ || 2 /* Paused */) {
            state.runState = 1 /* Running */;
            repo.saveState(state, function (err) {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        }
        else {
            res.json({ state: state, errorMessage: errorMessages });
        }
    });
});
app.get('/game/pause', auth, function (req, res) {
    var gameId = req.query.gameId;
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        if (state.runState == 1 /* Running */) {
            state.runState = 2 /* Paused */;
            repo.saveState(state, function (err) {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        }
        else {
            res.json({ state: state, errorMessage: errorMessages });
        }
    });
});
app.post('/game/move', auth, function (req, res) {
    var move = req.body;
    repo.loadState(move.gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ errorMessage: errorMessages });
        }
        else {
            var game = new literki_server.GameRun_Server();
            game.runState(state);
            game.makeMove(move);
            state = game.getState();
            repo.saveState(state, function (err) {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        }
    });
});
app.post('/game/alive', auth, function (req, res) {
    var gameId = req.body.gameId;
    var playerName = req.body.playerName;
    var game = new literki_server.GameRun_Server();
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        }
        else {
            var remainingTime = state.players[state.currentPlayerIndex].remainingTime;
            if (state.runState == 1 /* Running */) {
                if (remainingTime > 0) {
                    remainingTime--;
                    state.players[state.currentPlayerIndex].remainingTime = remainingTime;
                }
                repo.saveState(state, function (err) {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ remainingTime: remainingTime, errorMessage: errorMessages });
                });
            }
            else {
                res.json({ remainingTime: remainingTime, errorMessage: errorMessages });
            }
        }
    });
});
//# sourceMappingURL=server.js.map