/* eslint-disable no-restricted-syntax */
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const { INTERVAL_PER_MINUTE, PORT } = require('./src/constants');
const portfolio = require('./src/Portfolio');
const slopePriceTracker = require('./src/trackPriceUsingSlope');
const priceHistoryTracker = require('./src/priceHistoryDifference');
const sendMail = require('./src/sendMail');
const time = require('./src/time');
const DB = require('./src/database');

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
app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

let runningTick = 1; // minutes

// Stategy One
// setInterval(slopePriceTracker, time(30).seconds);

// Strategy Two
setInterval(async () => {
  await priceHistoryTracker({ runningTick });
  runningTick += 1;

}, time(INTERVAL_PER_MINUTE).minutes);

app.get('/', (req, res) => {
  res.render('pages/index', {
    runningTick,
  });
});

app.post('/', async (req, res) => {
  const result = await sendMail({ subject: 'Sample Mail' });
  res.send(JSON.stringify(result, null, 2));
});

app.get('/portfolio', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify(portfolio, null, 2));
});

app.get('/koin/:koinID', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify(portfolio[req.params.koinID], null, 2));
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
}, time(5).minutes);
