/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

"use strict";

const alert = require("./alert.js");

const LIMIT = 10 * 60 * 1000;

module.exports = function (load, rate)
{
    var start = Date.now() - LIMIT;

    // Return last 10 minutes of load data and all historic alert events.
    return JSON.stringify({points: load.filter((point) => point.timestamp >= start), events: alert(load, rate)});
};