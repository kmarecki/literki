///<reference path="typings\express\express.d.ts"/>
///<reference path="typings\express-session\express-session.d.ts"/>
///<reference path="typings\passport\passport.d.ts"/>
///<reference path="typings\body-parser\body-parser.d.ts"/>
///<reference path="typings\cookie-parser\cookie-parser.d.ts"/>

import express = require('express');
import session = require('express-session');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');

import passport = require('passport');
var GoogleStrategy = require('passport-google-openidconnect').Strategy;

import literki = require('./scripts/literki');
import literki_server = require('./scripts/literki_server');
import db = require('./scripts/db');
import util = require('./scripts/util');

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

passport.use(
    new GoogleStrategy({
        clientID: '699211361113-6b5hmrk8169iipecd81tpq9it0s0aim4.apps.googleusercontent.com',
        clientSecret: 'Lc6wOH0NjHGYRw5KgJfxftQr',
        callbackURL: 'http://localhost:1337/auth/google/return',
    },(iss, sub, profile, accessToken, refreshToken, done) => {
            repo.loadOrCreateUser(profile.id, profile.displayName, (err, user) => {
                return done(err, user)
            });
      })
);

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    repo.loadUser(id,(err, user) => done(err, user));
});

app.get('/auth/google', passport.authenticate('google-openidconnect'));

app.get('/auth/google/return',
    passport.authenticate('google-openidconnect', {
        successRedirect: '/main.html',
        failureRedirect: '/login.html'
    })
);

app.get('/auth/google/signout',(req, res) => {
    req.logout();
    res.redirect('/login.html');
});

var auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.json({ errorMessage: "Not authenticated" });
};

app.get('/game/new', auth, (req, res) => {
    var player = new literki.GamePlayer();
    player.userId = req.user.id;
    player.playerName = "Irenka";
    player.remainingTime = 15 * 60;
   
    var players = new Array<literki.GamePlayer>();
    players.push(player);
   
    var game = new literki_server.GameRun_Server();
    game.newGame(players);
    var state: literki.IGameState = game.getState();

    repo.newState(state,(err, gameId) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        repo.loadState(gameId,(err, state) => {
            if (err != null) {
                errorMessages = errorMessages.concat(util.formatError(err));
            }
            res.json({ state: state, errorMessage: errorMessages });
        });
    });
});

app.get('/game/join', auth,(req, res) => {
     var gameId: number = req.query.gameId;
   
    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ errorMessage: errorMessages });
        } else if (state != null) {
            var game = new literki_server.GameRun_Server();
            game.runState(state);

            var player = new literki.GamePlayer();
            player.userId = req.user.id;
            player.playerName = "Krzyś";
            player.remainingTime = 15 * 60;
            if (game.addPlayer(player)) {
                state = game.getState();
                repo.saveState(state,(err) => {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ state: state, errorMessage: errorMessages });
                });
            } else {
                res.json({ state: state, errorMessage: "Player not added" });
            }
        }
    });
});

app.get('/game/list', auth, (req, res) => {
    repo.allGames((err, games) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ games: games, errorMessage: errorMessages });
    });
});


app.get('/game/get', auth, (req, res) => {
    var gameId: number = req.query.gameId;
   
    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, errorMessage: errorMessages });
    });
});

app.get('/game/start', auth,(req, res) => {
    var gameId: number = req.query.gameId;

    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        if (state.runState == literki.GameRunState.Created || literki.GameRunState.Paused) {
            state.runState = literki.GameRunState.Running;
            repo.saveState(state,(err) => {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        } else {
            res.json({ state: state, errorMessage: errorMessages });
        }
    });
});

app.get('/game/pause', auth,(req, res) => {
    var gameId: number = req.query.gameId;

    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        if (state.runState == literki.GameRunState.Running) {
            state.runState = literki.GameRunState.Paused;
            repo.saveState(state,(err) => {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        } else {
            res.json({ state: state, errorMessage: errorMessages });
        }
    });
});


app.post('/game/move', auth, (req, res) => {
    var move: literki.GameMove = req.body;

    repo.loadState(move.gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ errorMessage: errorMessages });
        } else {
            var game = new literki_server.GameRun_Server();
            game.runState(state);
            game.makeMove(move);
            state = game.getState();
            repo.saveState(state,(err) => {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        }
    });
});

app.post('/game/alive', auth, (req, res) => {
    var gameId: number = req.body.gameId;
    var playerName: string = req.body.playerName;
    var game = new literki_server.GameRun_Server();

    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        } else {
            var remainingTime = state.players[state.currentPlayerIndex].remainingTime;
            if (state.runState == literki.GameRunState.Running) {
                if (remainingTime > 0) {
                    remainingTime--;
                    state.players[state.currentPlayerIndex].remainingTime = remainingTime;
                }
                repo.saveState(state,(err) => {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ remainingTime: remainingTime, errorMessage: errorMessages });
                });
            } else {
                res.json({ remainingTime: remainingTime, errorMessage: errorMessages });
            }
        }
    });
});





