/* eslint-disable no-restricted-syntax */

const _ = require('lodash');
const List = require('./List');
const { timeKeys, KOINEX_PROPERTIES, INTERVAL_PER_MINUTE } = require('./constants');

const portfolioBase = {
  highestBidPrices: { },
  lowestAskPrices: { },
  lastTradedPrices: new List(15),
  tolerance: 0,
  emailSentInLastThirtyMins: false,
};

const portfolio = {
  ETH: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 1000,
  },
  REQ: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 1,
  },
  EOS: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 100,
  },
  TRX: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 1,
  },
};

function updateLastTradedPrice({ coin, lastTradedPrices }) {
  this[coin].lastTradedPrices.insert(lastTradedPrices);
}
function updatePortfolio({ coin, coinDetails, runningTick }) {
  const normalisedTime = Object.values(timeKeys).map(({ timeQuanta, name }) =>
    ({ name, timeQuanta: timeQuanta / INTERVAL_PER_MINUTE }));
  const reverseSorted = normalisedTime.sort((a, b) => b.timeQuanta - a.timeQuanta);
  const toUpdateObj = reverseSorted.find(({ timeQuanta }) => runningTick % timeQuanta === 0);


  if (toUpdateObj) {
    const { name } = toUpdateObj;

    this[coin].highestBidPrices[name] = coinDetails[KOINEX_PROPERTIES.HIGHEST_BID];
    this[coin].lowestAskPrices[name] = coinDetails[KOINEX_PROPERTIES.LOWEST_ASK];
  }
}

Object.defineProperty(portfolio, 'updateLastTradedPrice', {
  enumerable: false,
  value: updateLastTradedPrice,
});

Object.defineProperty(portfolio, 'updatePortfolio', {
  enumerable: false,
  value: updatePortfolio,
});

module.exports = portfolio;
