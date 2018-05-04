/* eslint-disable no-restricted-syntax */

const fetch = require('node-fetch');
const get = require('lodash/get');
const sendMail = require('./sendMail');
const { KOINEX_PROPERTIES } = require('./constants');
const portfolio = require('./Portfolio');

const isPositive = num => num > 0;

const checkSlopeDirection = (coin, prices) => {
  const difference = [];
  for (let i = 0; i < prices.length - 1; i += 1) {
    difference.push(prices[i] - prices[i + 1]);
  }
  const diffWithNoZeroes = difference.filter(el => el !== 0);

  if (diffWithNoZeroes.length > 10) {
    let directionChange = 0;
    let initialDirection = isPositive(diffWithNoZeroes[0]);
    diffWithNoZeroes.forEach((el) => {
      // direction change
      const currentDirection = isPositive(el);
      if (currentDirection !== initialDirection) {
        initialDirection = currentDirection;
        directionChange += 1;
      }
    });
    if (directionChange === 0) {
      // Either the price is rising or falling
      const absDiff = diffWithNoZeroes.map(el => Math.abs(el));
      const maxDiff = Math.max(...absDiff);

      console.log(`${coin} did not change direction. Max deviation is ${maxDiff}`);
    }

    // only one direction change
    if (directionChange === 1) {
      sendMail({ subject: `${coin} changed direction once.` }).then(info => console.log(info));
    }
  }
  // console.log(difference);
};

module.exports = async () => {
  const result = await fetch(KOINEX_PROPERTIES.KOINEX_TICKER_URL);
  const dataStats = get(JSON.parse(await result.text()), KOINEX_PROPERTIES.KOINEX_COIN_DETAILS_PATH);
  for (const [coin, valueObj] of Object.entries(portfolio)) {
    checkSlopeDirection(coin, valueObj.lastTradedPrices.array);
    portfolio.updateLastTradedPrice({
      coin, lastTradedPrices: get(dataStats, `${coin}.${KOINEX_PROPERTIES.LAST_TRADED_PRICE}`),
    });
  }
};
