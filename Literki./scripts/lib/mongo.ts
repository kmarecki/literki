/// <reference path="../../typings/mongoose/mongoose.d.ts"/>

import mongoose = require('mongoose');

export class Repository {

    private connected = false;
    private uri: string;

    open(uri: string): void {
        this.uri = uri;
        mongoose.connection.on('connected', () => {
            console.log('Mongoose default connection open to ' + this.uri);
            this.connected = true;
        });
        mongoose.connection.on('error', (err) => {
            console.log('Mongoose default connection error: ' + err);
        });
        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
            this.connected = false;
        });
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    }

    protected connect(): void {
        if (this.connected) {
            return;
        }

        mongoose.connect(this.uri);
    }
}