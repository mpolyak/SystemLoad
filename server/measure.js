/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

"use strict";

const os = require("os");

function measure()
{
    var total = 0, idle = 0;

    os.cpus().forEach((cpu) =>
    {
        for (let time in cpu.times)
            total += cpu.times[time];

        idle += cpu.times.idle;
    });

    return {total: total, idle: idle};
}

var last = measure();

module.exports = function ()
{
    var current = measure();

    var total = current.total - last.total;
    var idle = current.idle - last.idle;

    last = current;

    return {timestamp: Date.now(), load: total ? 1 - (idle / total) : 0};
};