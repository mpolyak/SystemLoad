/*
 * Copyright (c) Michael Polyak. All rights reserved.
 */

(function () {
    "use strict";

    function timestampToString(timestamp)
    {
        var date = new Date(timestamp),
            hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();

        return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    function updateCaption(load, point)
    {
        var points = load.points; points = [points[points.length - 1]];

        if (point)
            points.push(point);

        var caption = d3.select("figcaption");

        caption.html(points.reduce(function (html, point, index)
        {
            var percent = Math.round(point.load * 100);

            if (!index)
                document.title = percent + "% CPU";

            var level = "nominal";

            if (percent >= 50)
            {
                if (percent >= 75) {
                    level = "danger";
                }
                else
                    level = "caution";
            }

            return html + (index ? " &mdash; " : "") + timestampToString(point.timestamp) + (index ? " " : " CPU ") + "<b class='" + level + "'>" + percent + "%</b>";

        }, ""));
    }

    function updateChart(load)
    {
        var start = NaN, end = NaN, minimum = 0, maximum = 1;

        load.points.forEach(function (point)
        {
            if (isNaN(start) || point.timestamp < start)
                start = point.timestamp;

            if (isNaN(end) || point.timestamp > end)
                end = point.timestamp;

            minimum = Math.min(minimum, point.load);
            maximum = Math.max(maximum, point.load);
        });

        if (isNaN(start))
            return;

        // Minimum time window is 10 minutes.
        end = Math.max(end, start + (10 * 60 * 1000));

        var svg = d3.select("svg"), rect = svg.node().getBoundingClientRect(),
            width = rect.width - 20,
            height = rect.height - 20;

        // Update defs.
        svg.select("#gradient-mid")
            .attr("offset", maximum <= 0.5 ? 0 : 1 - (0.5 / maximum));

        svg.select("#clip").select("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width - 50)
            .attr("height", height - 0);

        // Chart properties.
        var x = d3.time.scale()
            .domain([start, end])
            .range([0, width - 50]);

        var y = d3.scale.linear()
            .domain([minimum, maximum])
            .range([height - 25, 1]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .innerTickSize(-(height - 20))
            .outerTickSize(0)
            .tickPadding(12)
            .tickFormat(d3.time.format("%H:%M"));

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(3)
            .tickFormat(d3.format(".0%"))
            .innerTickSize(-(width - 50))
            .outerTickSize(0)
            .tickPadding(8)
            .orient("right");

        var line = d3.svg.line()
            .x(function (d) { return x(d.timestamp); })
            .y(function (d) { return y(d.load); });

        // Update plot.
        var chart = svg.select(".chart")
            .attr("transform", "translate(" + 10 + "," + 10 + ")")
            .datum(load.points);

        chart.select(".x.axis")
            .attr("width", width)
            .attr("transform", "translate(0," + (height - 25) + ")")
            .call(xAxis);

        chart.select(".y.axis")
            .attr("transform", "translate(" + (width - 50) + ",0)")
            .call(yAxis);

        chart.select(".line")
            .attr("d", line);

        // Update events.
        var events = chart.select(".events").selectAll("circle").data(load.events.filter(function (d) { return d.timestamp >= start; }))
            .attr("class", function (d) { return d.type; })
            .attr("cx",    function (d) { return x(d.timestamp); })
            .attr("cy",    function (d) { return y(d.load); })
            .attr("r",     5);

        events.enter().append("circle")
            .attr("class", function (d) { return d.type; })
            .attr("cx",    function (d) { return x(d.timestamp); })
            .attr("cy",    function (d) { return y(d.load); })
            .attr("r",     5);

        events.exit().remove();

        // Update mouse focus.
        chart.select(".overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseout", function () { updateCaption(load); })
            .on("mousemove", function ()
            {
                var timestamp = x.invert(d3.mouse(this)[0] - 10), point, next;

                for (var i = 0; i < load.points.length; i ++)
                {
                    point = load.points[i];

                    if (point.timestamp >= timestamp || i === load.points.length - 1)
                        break;

                    next = load.points[i + 1];

                    if (next.timestamp >= timestamp && next.timestamp - timestamp < timestamp - point.timestamp)
                    {
                        point = next;

                        break;
                    }
                }

                updateCaption(load, point);
            });
    }

    function updateLog(load)
    {
        var events = [];

        load.events.forEach(function (event) { events.unshift(event); });

        var list = d3.select("ul").selectAll("li").data(events)
            .attr("class", function (d) { return d.type; })
            .html(function (d) { return "<b>" + timestampToString(d.timestamp) + "</b> " + d.message; });

        list.enter().append("li")
            .attr("class", function (d) { return d.type; })
            .html(function (d) { return "<b>" + timestampToString(d.timestamp) + "</b> " + d.message; });

        list.exit().remove();
    }

    function update(load)
    {
        load = load || update.load;

        if (!load)
            return;

        update.load = load;

        updateCaption(load);
        updateChart(load);
        updateLog(load);
    }

    function connect()
    {
        var socket = new WebSocket("ws://" + window.location.host);

        socket.onerror = function ()
        {
            document.title = "System Load";

            var caption = d3.select("figcaption");

            caption.html("<b class='danger'>CONNECTION DROPPED<b>");
        };

        socket.onclose = function ()
        {
            document.title = "System Load";

            var caption = d3.select("figcaption");

            caption.html("<b class='danger'>CONNECTION CLOSED<b>");

            // Attempt to reconnect in 5 seconds.
            setTimeout(function () { connect(); }, 5 * 1000);
        };

        socket.onmessage = function (message)
        {
            update(JSON.parse(message.data));
        };
    }

    window.onresize = function ()
    {
        update();
    }

    window.onload = function ()
    {
        connect();
    };
})();