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
app.use(express.static(__dirname + '/../public'));
app.use(session({ secret: '1234567890qwerty' }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
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
// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
//     /auth/google/return
app.get('/auth/google', passport.authenticate('google-openidconnect'));
// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
app.get('/auth/google/return', passport.authenticate('google-openidconnect', {
    successRedirect: '/main.html',
    failureRedirect: '/login.html'
}), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/main.html');
});
app.get('/auth/google/signout', function (req, res) {
    req.logout();
    res.redirect('/login.html');
});
app.get('/games/new', function (req, res) {
    var player1 = new literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 18 * 60 + 35;
    var player2 = new literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 20 * 60;
    var player3 = new literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 20 * 60;
    var players = new Array();
    players.push(player1);
    players.push(player2);
    players.push(player3);
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
app.get('/games/list', function (req, res) {
    repo.allGames(function (err, games) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ games: games, errorMessage: errorMessages });
    });
});
app.get('/game/get', function (req, res) {
    var gameId = req.query.gameId;
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, errorMessage: errorMessages });
    });
});
app.post('/game/move', function (req, res) {
    var move = req.body;
    var game = new literki_server.GameRun_Server();
    repo.loadState(move.gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        }
        else {
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
app.post('/game/alive', function (req, res) {
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
    });
});
//# sourceMappingURL=server.js.map