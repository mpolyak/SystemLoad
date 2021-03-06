Description
-----------

System Load measures your CPU usage and displays the result in a web dashboard.
It will also generate an alert if CPU usage stays above 50% on average for 2 minutes and will clear the alert once it drops below 50% for 2 minutes.

![Alt text](/screenshots/sine.png?raw=true "Sine Wave")
![Alt text](/screenshots/square.png?raw=true "Square Wave")

System Requirements
-------------------

Node v4.3.1 or above. You can use Vagrantfile to start a virtual testing environment.
External dependencies hosted on a CDN: d3.js library and Roboto font.

Commands
--------

1. Install project dependencies.

> npm install

2. Test alerting logic.

> npm test

3. Start application server on localhost port 3000.

> npm start

4. Generate CPU load for testing at a constant 100%.

> npm run load-100

5. Generate CPU load for testing as a 3 minute period sine wave with 100% amplitude.

> npm run load-sin
