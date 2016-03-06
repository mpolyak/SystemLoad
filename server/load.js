/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

"use strict";

const cluster = require("cluster");
const os      = require("os");

if (cluster.isMaster)
{
    for (let i = 0; i < os.cpus().length; i ++)
         cluster.fork();
}
else
{
    if (process.argv.length === 3 && process.argv[2] === "sin")
    {
        let work = (time) =>
        {
            var now = Date.now();

            while (now < time)
                now = Date.now();

            time = Math.floor(1000 * 0.5 * (1 + Math.sin(now / (30 * 1000))));

            setTimeout(() => work(Date.now() + (1000 - time)), time);
        };

        work(0);
    }
    else
        while (1) {}
}