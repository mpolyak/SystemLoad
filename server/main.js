/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

"use strict";

const express  = require("express");
const path     = require("path");
const {Server} = require("ws");

const measure = require("./measure.js");
const message = require("./message.js");

const UPDATE_RATE = 0.1; // Update every 10 seconds.

var load = [measure()];

var app = express();

app.use(express.static(path.resolve(__dirname, "../client")));

var wss = new Server({server: app.listen(3000)});

wss.on("connection", (ws) =>
{
    // Update newly connected client.
    ws.send(message(load, UPDATE_RATE));
});

wss.on("error", (error) => console.log(error.toString()));

// Record system load and update all connected clients.
setInterval(() =>
{
    load.push(measure());

    var payload = message(load, UPDATE_RATE);

    wss.clients.forEach((ws) =>
    {
        ws.send(payload);
    });

}, 1000 / UPDATE_RATE);

console.log("Monitor your System Load with your browser at http://localhost:3000");