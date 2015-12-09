///<reference path="typings\express\express.d.ts"/>
///<reference path="typings\express-session\express-session.d.ts"/>
///<reference path="typings\passport\passport.d.ts"/>
///<reference path="typings\body-parser\body-parser.d.ts"/>
///<reference path="typings\cookie-parser\cookie-parser.d.ts"/>

var config = require('config');

import _ = require('underscore');
import http = require('http');
import express = require('express');
import session = require('express-session');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');

import passport = require('passport');

import literki = require('./scripts/literki');
import literki_server = require('./scripts/literki_server');
import entities = require('./scripts/entities');
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
app.use((err: Error, req, res, next) => {
    console.error(err);
    res.status(500).send('Something broke!');
});
app.set('view engine', 'jade');
app.locals.pretty = true;

var uri = config.MongoDb.uri;
var repo = new db.GameRepository();
repo.open(uri);

var strategy = config.Passport.strategy;

switch (strategy) {
    case 'Google': {
        var GoogleStrategy = require('passport-google-openidconnect').Strategy;
        passport.use(
            new GoogleStrategy({
                clientID: config.GoogleAuthorization.clientID,
                clientSecret: config.GoogleAuthorization.clientSecret,
                callbackURL: config.GoogleAuthorization.callbackURL
            }, (iss, sub, profile, accessToken, refreshToken, done) => {
                repo.loadOrCreateUser(profile.id, profile.displayName, (err, user) => {
                    return done(err, user)
                });
            })
        );

        passport.serializeUser((user, done) => {
            done(null, user.id)
        });

        passport.deserializeUser((id, done) => {
            repo.loadUser(id, (err, user) => done(err, user));
        });

        app.get('/auth/google', passport.authenticate('google-openidconnect'));

        app.get('/auth/google/return',
            passport.authenticate('google-openidconnect', {
                successRedirect: '/main.html',
                failureRedirect: '/login.html'
            })
        );

        app.get('/auth/google/signout', (req, res) => {
            req.logout();
            res.redirect('/login.html');
        });
        break;
    }
    case 'Http': {
        var users = new Array<{ id: number, userName: string }>();

        var HttpStrategy = require('passport-http').BasicStrategy;
        passport.use(
            new HttpStrategy({}, (userName, password, done) => {
                //hack for mocha tests, never use Http strategy in the production
                var id = password;
                users.push({
                    id: id,
                    userName: userName
                });
                var user = _.last(users);
                done(null, user);
            })
        );

        passport.serializeUser((user, done) => {
            done(null, user.id)
        });

        passport.deserializeUser((id, done) => {
            var user = _.find(users, (user) => user.id == id);
            done(null, user);
        });

        app.get('/auth/http', passport.authenticate('basic'), (req, res) => {
            res.end('Authentifaction successfull');
        });

        break;
    }
    default: {
        throw new Error(`Unknown passport strategy: ${strategy}`);
    }
}

var auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.json({ errorMessage: "Błąd uwierzytelnienia użytkownika." });
};

app.get('/login.html', (req, res) => {
    res.render('login', { title: 'login' });
});

app.get('/:pageName.html', auth, (req, res) => {
    res.render(req.params.pageName, { title: req.params.pageName });
});

app.post('/game/new', auth, (req, res) => {
    repo.loadUser(req.user.id, (err, user) => {
        if (err != null) {
            var errorMessages = util.formatError(err);
            res.json({ errorMessage: errorMessages });
        } else {
            var request = <entities.NewGameRequest>req.body;
            var game = new literki_server.GameRun_Server(req.user.profileId);
            game.newGame(user.id, user.userName, request.playerCount, request.timeLimit);
            var state: literki.IGameState = game.state;

            repo.newState(state, (err, gameId) => {
                var errorMessages;
                if (err != null) {
                    errorMessages = util.formatError(err);
                }
                repo.loadState(gameId, (err, state) => {
                    if (err != null) {
                        errorMessages = errorMessages.concat(util.formatError(err));
                    }
                    res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
                });
            });
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
        var errorMessages;
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
    });
});

app.get('/game/join', auth, (req, res) => simpleGameMethodCall(req, res, (game, req, call) => call(game.join())));
app.get('/game/start', auth, (req, res) => simpleGameMethodCall(req, res, (game, req, call) => call(game.start())));
app.get('/game/pause', auth, (req, res) => simpleGameMethodCall(req, res, (game, req, call) => call(game.pause())));
app.get('/game/fold', auth, (req, res) => simpleGameMethodCall(req, res, (game, req, call) => call(game.fold())));
app.get('/game/exchange', auth,(req, res) => simpleGameMethodCall(req, res, (game, req, call) => call(game.exchange(req.query.exchangeLetters))));
app.post('/game/approve', auth, (req, res) => {
    var approve = req.body.approve;
    simpleGameMethodCall(req, res, (game, req, call) => {
        game.renderMove();
        repo.existWords(game.getNewWords().map(w => w.word), "pl", (err, exists) => {
            call(game.approveMove(approve, exists));
        });
    }, req.body.gameId);
});
app.post('/game/move', auth, (req, res) => {
    var move = <literki.GameMove> req.body;
    simpleGameMethodCall(req, res, (game, req, call) => call(game.makeMove(move)), move.gameId);
});

app.get('/player/get', auth, (req, res) => {
    repo.loadUser(req.user.id, (err, userProfile) => {
        if (err != null) {
            var errorMessage = util.formatError(err);
        }
        res.json({ userProfile: userProfile, errorMessage: errorMessage });
    });
});

app.post('/player/update', auth, (req, res) => {
    var userProfile = req.body;
    repo.saveUser(userProfile, (err) => {
        if (err != null) {
            var errorMessage = util.formatError(err);
            res.json({ errorMessage: errorMessage });
        } else {
            repo.loadUser(req.user.id, (err, userProfile) => {
                if (err != null) {
                    var errorMessage = util.formatError(err);
                }
                res.json({ userProfile: userProfile, errorMessage: errorMessage });
            });
        }
    });
});

app.post('/player/alive', auth, (req, res) => simpleGameMethodCall(req, res, (game, req, call) => {
    var result = game.alive();
    var forceRefresh =
        game.getCurrentPlayer().userId != req.body.currentPlayerId ||
        game.state.playState != req.body.playState ||
        game.getPlayers().length != req.body.playersCount;
    result.forceRefresh = forceRefresh;
    return call(result);
}, req.body.gameId));

app.get('/server/alive', auth, (req, res) => {
    res.json({ errorMessage: undefined });
});

type gameMethodCallback = (game: literki_server.GameRun_Server, req: express.Request, call: (result: literki_server.GameMethodResult) => any) => void;
function simpleGameMethodCall(req: express.Request, res: express.Response, call: gameMethodCallback, gameId: number = req.query.gameId): void {

    repo.loadState(gameId, (err, state) => {
        var errorMessages;
        if (err || !state) {
            if (err) {
                errorMessages = util.formatError(err);
            }
            res.json({ state: state, userId: req.user.id, errorMessage: errorMessages });
        } else {
            var game = new literki_server.GameRun_Server(req.user.id);
            state = literki.GameState.fromJSON(state);
            game.runState(state);
            call(game, req, (result) => {
                var errMsg = result.errorMessage;
                if (errMsg) {
                    //to discard any changes to current game state
                    repo.loadState(gameId, (err, unchangedState) => {
                        unchangedState = literki.GameState.fromJSON(unchangedState);
                        res.json({ state: unchangedState, userId: req.user.id, errorMessage: errMsg });
                    });
                } else {
                    state = game.state;
                    repo.saveState(state, (err) => {
                        if (err) {
                            errorMessages = errorMessages.concat(util.formatError(err));
                        }
                        res.json({ state: state, userId: req.user.id, forceRefresh: result.forceRefresh, errorMessage: errorMessages });
                    });
                }
            });
        }
    });
}

var server: http.Server;

export function start() {
    var port = process.env.port || 1337;
    console.log('Literki start');
    console.log('Literki port: ' + port);
    server = app.listen(port, '0.0.0.0');
}

export function stop() {
    if (server) {
        console.log('Literki shutdown');
        server.close();
    }
}

export function getGameRepository() {
    return repo;
}

