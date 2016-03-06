/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

"use strict";

const WINDOW = 2 * 60 * 1000;

const EPSILON = 0.0001;

function mean(values)
{
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdev(values, average)
{
    if (isNaN(average))
        average = mean(values);

    return Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length);
}

module.exports = function (load, rate)
{
    // Calculate number of samples per averaging window.
    var count = Math.floor(WINDOW / (1000 / rate));

    var events = [], alert = false;

    // Sample sliding time window.
    for (let i = 0; i < load.length; i ++)
    {
        let sample = [], last = null;

        // Collect load values for averaging.
        for (let j = i; j < load.length && sample.length < count; j ++)
        {
            last = load[j];

            sample.push(last.load);
        }

        // Skip incomplete sample window.
        if (sample.length !== count)
            continue;

        let first = load[i], avg = mean(sample), dev = stdev(sample, avg);

        if (alert)
        {
            if (avg < 0.5 - EPSILON)
            {
                let minutes = Math.round((last.timestamp - first.timestamp) / (60 * 1000));

                events.push({timestamp: last.timestamp, load: last.load, type: "normal", message: "CPU Load below 50% on average for the past " +
                    minutes + " minutes (mean = " + Math.floor(avg * 100) + "%, stdev = " + Math.round(dev * 100) + "%)."});

                alert = false;
            }
        }
        else if (avg > 0.5 + EPSILON)
        {
            let minutes = Math.round((last.timestamp - first.timestamp) / (60 * 1000));

            events.push({timestamp: last.timestamp, load: last.load, type: "alert", message: "CPU Load above 50% on average for the past " +
                minutes + " minutes (mean = " + Math.ceil(avg * 100) + "%, stdev = " + Math.round(dev * 100) + "%)."});

            alert = true;
        }
    }

    return events;
};