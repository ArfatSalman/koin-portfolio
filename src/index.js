/* eslint-disable no-restricted-syntax */
const { INTERVAL_PER_MINUTE } = require('./constants');
const portfolio = require('./Portfolio');
const slopePriceTracker = require('./trackPriceUsingSlope');
const priceHistoryTracker = require('./priceHistoryDifference');

const jclrz = require('json-colorz');


const sendMail = require('./sendMail');
const time = require('./time');


process
  .on('unhandledRejection', async (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    process.exit();
  })
  .on('uncaughtException', async (err) => {
    sendMail({ subject: `${err}` }).then(info => console.log(info));
    throw err;
  });

let runningTick = 1; // minutes

// Stategy One
// setInterval(slopePriceTracker, time(30).seconds);

// Strategy Two
setInterval(async () => {
  await priceHistoryTracker({ runningTick });

  runningTick += 1;
  jclrz(portfolio);

}, time(INTERVAL_PER_MINUTE).minutes);


setInterval(() => {
  for (const [, valueObj] of Object.entries(portfolio)) {
    valueObj.emailSentInLastThirtyMins = false;
  }
}, time(30).minutes);

// For Heroku
setInterval(() => {
  fetch('http://');
}, time(20).minutes);
