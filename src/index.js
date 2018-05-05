/* eslint-disable no-restricted-syntax */
const express = require('express');
const jclrz = require('json-colorz');
const jsonFormat = require('json-format');

const { INTERVAL_PER_MINUTE, PORT } = require('./constants');
const portfolio = require('./Portfolio');
const slopePriceTracker = require('./trackPriceUsingSlope');
const priceHistoryTracker = require('./priceHistoryDifference');
const sendMail = require('./sendMail');
const time = require('./time');
const DB = require('./database');

process
  .on('unhandledRejection', async (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    process.exit();
  })
  .on('uncaughtException', async (err) => {
    sendMail({ subject: `${err}` }).then(info => console.log(info));
    throw err;
  });

const app = express();
let runningTick = 1; // minutes

// Stategy One
// setInterval(slopePriceTracker, time(30).seconds);

// Strategy Two
setInterval(async () => {
  await priceHistoryTracker({ runningTick });
  runningTick += 1;

}, time(INTERVAL_PER_MINUTE).minutes);

app.get('/', (req, res) => {
  const response = `
    Running Successfully.
    Running Tick: ${runningTick};
  `;
  res.send(response);
});

app.get('/portfolio', (req, res) => {
  res.send(jsonFormat(portfolio));
});

app.get('/koin/:koinID', (req, res) => {
  res.send(jsonFormat(portfolio[req.params.koinID]));
});

const server = app.listen(PORT || 8080, () => {
  const host = server.address().address;
  const { port } = server.address();

  console.log('App listening at http://%s:%s', host, port);
});

setInterval(() => {
  for (const [, valueObj] of Object.entries(portfolio)) {
    valueObj.emailSentInLastThirtyMins = false;
  }
}, time(25).minutes);

// For Heroku
setInterval(() => {
  fetch('https://koin-tracker.herokuapp.com/')
    .then(() => {})
    .catch(err => console.log(err));
}, time(20).minutes);
