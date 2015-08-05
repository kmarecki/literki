///<reference path="typings\express\express.d.ts"/>
///<reference path="typings\express-session\express-session.d.ts"/>
///<reference path="typings\passport\passport.d.ts"/>
///<reference path="typings\body-parser\body-parser.d.ts"/>
///<reference path="typings\cookie-parser\cookie-parser.d.ts"/>

var config = require('config');

import express = require('express');
import session = require('express-session');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');

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

passport.use(
    new GoogleStrategy({
        clientID: config.GoogleAuthorization.clientID,
        clientSecret: config.GoogleAuthorization.clientSecret,
        callbackURL: config.GoogleAuthorization.callbackURL
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


app.get('/:pageName.html',(req, res) => {
    res.render(req.params.pageName, { title: req.params.pageName });
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
   
    var game = new literki_server.GameRun_Server(req.user.googleId);
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
            res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
        });
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
        res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
    });
});

app.get('/game/join', auth,(req, res) => simpleGameMethodCall(req, res,(game, req) => game.join()));
app.get('/game/start', auth, (req, res) => simpleGameMethodCall(req, res, (game, req) => game.start()));
app.get('/game/pause', auth, (req, res) => simpleGameMethodCall(req, res, (game, req) => game.pause()));
app.get('/game/fold', auth, (req, res) => simpleGameMethodCall(req, res, (game, req) => game.fold()));
app.get('/game/exchange', auth,(req, res) => simpleGameMethodCall(req, res, (game, req) => game.exchange(req.query.exchangeLetters)));
app.get('/game/approve', auth,(req, res) => simpleGameMethodCall(req, res,(game, req) => game.approveMove(req.query.approve)));
app.post('/game/move', auth,(req, res) => {
    var move = <literki.GameMove> req.body;
    simpleGameMethodCall(req, res, (game, req) => game.makeMove(move), move.gameId);
});
  
function simpleGameMethodCall(req: express.Request, res: express.Response, call: (game: literki_server.GameRun_Server, req: express.Request) => string, gameId: number = req.query.gameId): void {

    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        } else {
            var game = new literki_server.GameRun_Server(req.user.id);
            game.runState(state);
            var errMsg = call(game, req);
            if (errMsg != null) {
                res.json({ state: state, errorMessage: errMsg });
            } else {
                state = game.getState();
                repo.saveState(state,(err) => {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
                });
            }
        }
    });
}

app.post('/game/alive', auth, (req, res) => {
    var gameId: number = req.body.gameId;
    var currentPlayerId = req.body.currentPlayerId;
    var userId = req.user.id;

    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        } else {
            var currentPlayer = state.players[state.currentPlayerIndex];
            var forceRefresh = currentPlayer.userId != currentPlayerId;
            var remainingTime = currentPlayer.remainingTime; 
            if (currentPlayer.userId == userId && state.runState == literki.GameRunState.Running && state.playState == literki.GamePlayState.PlayerMove) {
                if (remainingTime > 0) {
                    remainingTime--;
                    state.players[state.currentPlayerIndex].remainingTime = remainingTime;
                }
                repo.saveState(state,(err) => {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ remainingTime: remainingTime, forceRefresh: forceRefresh, errorMessage: errorMessages });
                });
            } else {
                res.json({ remainingTime: remainingTime, forceRefresh: forceRefresh, errorMessage: errorMessages });
            }
        }
    });
});





