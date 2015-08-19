/// <reference path="../typings/mocha/mocha.d.ts" />

import assert = require('assert');

describe("Game Test Suite", () => {
    before(() => {
        console.log("Before method");
    });

    after(() => {
        console.log("After method");
    });

    it("Test A", () => {
        assert.ok(true, "This shouldn't fail");
    });

    it("Test B", () => {
        assert.ok(1 === 1, "This shouldn't fail");
        assert.ok(false, "This should fail ts");
    });
});
