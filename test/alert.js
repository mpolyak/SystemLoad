/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

"use strict";

const {expect} = require("chai");

const alert = require("../server/alert.js");

const UPDATE_RATE = 0.1;

function* clock()
{
    var period = 1000 / UPDATE_RATE, time = 0;

    while (time <= 10 * 60 * 1000) {
        yield time; time += period;
    }

    return time;
}

describe("Alert", () =>
{
    describe("50% Load", () =>
    {
        var events;

        before(() =>
        {
            var load = [];

            for (let time of clock())
                load.push({timestamp: time, load: 0.5});

            events = alert(load, UPDATE_RATE);
        });

        it("should have no events", () =>
        {
            expect(events).to.be.empty;
        });
    });

    describe("51% Load", () =>
    {
        var events;

        before(() =>
        {
            var load = [];

            for (let time of clock())
                load.push({timestamp: time, load: 0.51});

            events = alert(load, UPDATE_RATE);
        });

        it("should have 1 event", () =>
        {
            expect(events).to.be.of.length(1);
        });

        it("should alert at 2 minutes", () =>
        {
            var event = events[0];

            expect(event.type).to.equal("alert");
            expect(event.timestamp).to.equal((2 * 60 * 1000) - (1000 / UPDATE_RATE));
        });
    });

    describe("Square Wave, 100% at 3 to 6 min", () =>
    {
        var events;

        before(() =>
        {
            var load = [];

            for (let time of clock())
            {
                let minute = Math.floor(time / (60 * 1000));

                load.push({timestamp: time, load: minute < 3 || minute > 6 ? 0 : 1});
            }

            events = alert(load, UPDATE_RATE);
        });

        it("should have 2 events", () =>
        {
            expect(events).to.be.of.length(2);
        });

        it("should alert at 4 minutes", () =>
        {
            var event = events[0];

            expect(event.type).to.equal("alert");
            expect(event.timestamp).to.equal(4 * 60 * 1000);
        });

        it("should recover at 8 minutes", () =>
        {
            var event = events[1];

            expect(event.type).to.equal("normal");
            expect(event.timestamp).to.equal(8 * 60 * 1000);
        });
    });

    describe("Ramp, 0% to 100%", () =>
    {
        var events;

        before(() =>
        {
            var load = [];

            for (let time of clock())
                load.push({timestamp: time, load: time / (10 * 60 * 1000)});

            events = alert(load, UPDATE_RATE);
        });

        it("should have 1 event", () =>
        {
            expect(events).to.be.of.length(1);
        });

        it("should alert at 6 minutes", () =>
        {
            var event = events[0];

            expect(event.type).to.equal("alert");
            expect(event.timestamp).to.equal(6 * 60 * 1000);
        });
    });

    describe("Ramp, 100% to 0%", () =>
    {
        var events;

        before(() =>
        {
            var load = [];

            for (let time of clock())
                load.push({timestamp: time, load: 1 - (time / (10 * 60 * 1000))});

            events = alert(load, UPDATE_RATE);
        });

        it("should have 2 events", () =>
        {
            expect(events).to.be.of.length(2);
        });

        it("should alert at 2 minutes", () =>
        {
            var event = events[0];

            expect(event.type).to.equal("alert");
            expect(event.timestamp).to.equal((2 * 60 * 1000) - (1000 / UPDATE_RATE));
        });

        it("should recover at 6 minutes", () =>
        {
            var event = events[1];

            expect(event.type).to.equal("normal");
            expect(event.timestamp).to.equal(6 * 60 * 1000);
        });
    });

    describe("Sine Wave, 2 minute period, 100% amplitude", () =>
    {
        var events;

        before(() =>
        {
            var load = [];

            for (let time of clock())
                load.push({timestamp: time, load: 0.5 * (1 + Math.sin((time / (20 * 1000)) + (10 * 1000)))});

            events = alert(load, UPDATE_RATE);
        });

        it("should have 8 events", () =>
        {
            expect(events).to.be.of.length(8);
        });

        it("should first alert at 2 minutes", () =>
        {
            var event = events[0];

            expect(event.type).to.equal("alert");
            expect(event.timestamp).to.equal(2 * 60 * 1000);
        });

        it("should have alternating alert/normal events", () =>
        {
            events.forEach((event, index) =>
                expect(event.type).to.equal(index % 2 ? "normal" : "alert"));
        });

        it("should have events at one minute interval", () =>
        {
            events.forEach((event, index) =>
            {
                var minutes = Math.floor(event.timestamp / (60 * 1000));

                expect(minutes).to.equal(2 + index);
            });
        });
    });
});