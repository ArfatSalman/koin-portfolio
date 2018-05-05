/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */

/**
 * While the ask price is the lowest price a prospective seller is willing to accept, 
 * the bid price is the highest price that a prospective buyer is willing to pay for the security. 
 */

const jclrz = require('json-colorz');
const fetch = require('node-fetch');
const get = require('lodash/get');
const sendMail = require('./sendMail');
const { KOINEX_PROPERTIES } = require('./constants');
const portfolio = require('./Portfolio');

const bidPriceFallPredicate = ({ currentPrice, lastPrice, tolerance }) =>
  currentPrice - lastPrice < 0 && Math.abs(currentPrice - lastPrice) >= tolerance;

const bidPriceChecker = ({ dataStats, coin, valueObj }) => {
  const currentPrice = get(dataStats, `${coin}.${KOINEX_PROPERTIES.HIGHEST_BID}`);

  const { tolerance } = valueObj;
  const priceFallDetails = Object.entries(valueObj.highestBidPrices).find(([, lastPrice]) =>
    bidPriceFallPredicate({ currentPrice, lastPrice, tolerance }));

  if (priceFallDetails && !valueObj.emailSentInLastThirtyMins) {
    const [duration, price] = priceFallDetails;

    sendMail({ subject: `${coin} Prices fell by ${price - currentPrice} in ${duration}` })
      .then((info) => {
        jclrz(info);
        valueObj.emailSentInLastThirtyMins = true;
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

const askPriceRisePredicate = ({ currentPrice, lastPrice, tolerance }) =>
  currentPrice - lastPrice > 0 && currentPrice - lastPrice >= tolerance;

const askPriceChecker = ({ dataStats, coin, valueObj }) => {
  const currentPrice = get(dataStats, `${coin}.${KOINEX_PROPERTIES.LOWEST_ASK}`);

  const { tolerance } = valueObj;
  const priceRiseDetails = Object.entries(valueObj.lowestAskPrices).find(([, lastPrice]) =>
    askPriceRisePredicate({ currentPrice, lastPrice, tolerance}));

  if (priceRiseDetails && !valueObj.emailSentInLastThirtyMins) {
    // console.log(priceRiseDetails);
    const [duration, price] = priceRiseDetails;
    sendMail({ subject: `${coin} Prices rose by ${price - currentPrice} in ${duration}` })
      .then((info) => {
        jclrz(info);
        valueObj.emailSentInLastThirtyMins = true;
      })
      .catch(err => console.log(err));
  }
};


module.exports = async ({ runningTick }) => {
  const result = await fetch(KOINEX_PROPERTIES.KOINEX_TICKER_URL);
  const dataStats = get(JSON.parse(await result.text()), KOINEX_PROPERTIES.KOINEX_COIN_DETAILS_PATH);

  for (const [coin, valueObj] of Object.entries(portfolio)) {
    bidPriceChecker({ dataStats, coin, valueObj });
    askPriceChecker({ dataStats, coin, valueObj });
    portfolio.updatePortfolio({ coin, coinDetails: dataStats[coin], runningTick });
  }
};
