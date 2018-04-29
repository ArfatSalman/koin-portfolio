const fetch = require('node-fetch');
const jclrz = require('json-colorz');
const _ = require('lodash');

const sendMail = require('./sendMail');
const time = require('./time');
const List = require('./List');

process
  .on('unhandledRejection', async (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    process.exit();
  })
  .on('uncaughtException', async err => {
    sendMail({ subject: `${err}` }).then((info) => console.log(info));
    throw err;
  });

let runningTick = 1; // minutes
const INTERVAL_PER_MINUTE = 1;

const timeKeys = {
  TWO: { timeQuanta: 2, name: 'two' },
  TEN: { timeQuanta: 10, name: 'ten' },
  TWENTY: {timeQuanta: 20, name: 'twenty'},
  THIRTY: { timeQuanta: 30, name: 'thirty' },
  ONE_HOUR: { timeQuanta: 60, name: 'oneHour' },
  ONE_HALF_HOUR: { timeQuanta: 90, name: 'oneHalfHour'},
  TWO_HOURS: { timeQuanta: 120, name: 'twoHours' },
  THREE_HOURS: { timeQuanta: 180, name: 'threeHours' }
};

const constants = {
  KOINEX_HIGHEST_BID: 'highest_bid',
  KOINEX_LOWEST_ASK: 'lowest_ask',
  KOINEX_LAST_TRADED_PRICE: 'last_traded_price'
};

const portfolioBase = {
  highestBidPrices: { },
  lowestAskPrices: { },
  lastTradedPrices: new List(15),
  tolerance: 0,
  emailSentInLastThirtyMins: false
}

const portfolio = {
  ETH: { 
    ..._.cloneDeep(portfolioBase),
    tolerance: 1000
  },
  REQ: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 1
  },
  EOS: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 100    
  },
  TRX: {
    ..._.cloneDeep(portfolioBase),
    tolerance: 1
  }
};

const updatePortfolio = ({ coin, coinDetails }) => {

  const normalisedTime = Object.values(timeKeys).map(({timeQuanta, name}) => ({ name, timeQuanta: timeQuanta / INTERVAL_PER_MINUTE }));
  const reverseSorted = normalisedTime.sort((a, b) => b.timeQuanta - a.timeQuanta);
  const toUpdateObj = reverseSorted.find(({timeQuanta, _}) => runningTick % timeQuanta === 0);

  
  if (toUpdateObj) {
    const { name } = toUpdateObj;
  
    portfolio[coin].highestBidPrices[name] = coinDetails[constants.KOINEX_HIGHEST_BID];
    portfolio[coin].lowestAskPrices[name] = coinDetails[constants.KOINEX_LOWEST_ASK];
    portfolio[coin].lastTradedPrices.insert(coinDetails[constants.KOINEX_LAST_TRADED_PRICE]);
  }
};

const isPositive = num => num > 0;

const checkSlopeDirection = (coin, prices) => {
  const difference = [];
  for (let i = 0; i < prices.length - 1; i++ ) {
    difference.push(prices[i] - prices[i+1]);
  }
  const diffWithNoZeroes = difference.filter((el) => el !== 0);
  
  if (diffWithNoZeroes.length > 10) {
    let directionChange = 0;
    let initialDirection = isPositive(diffWithNoZeroes[0]);
    diffWithNoZeroes.forEach((el) => {
      // direction change
      const currentDirection = isPositive(el)
      if (currentDirection !== initialDirection) {
        initialDirection = currentDirection;
        directionChange = directionChange + 1;
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
      sendMail({ subject: `${coin} changed direction once.` }).then((info) => console.log(info));
    }
  } 
  // console.log(difference);
}


setInterval(async () => {
  const result = await fetch('https://koinex.in/api/ticker');  
  const dataStats = JSON.parse(await result.text())['stats']['inr'];
  for (const [coin, valueObj] of Object.entries(portfolio)) {
    checkSlopeDirection(coin, valueObj.lastTradedPrices.array);
    updatePortfolio({ coin, coinDetails: dataStats[coin] });
  }
  runningTick = runningTick + 1;
  jclrz({runningTick});
}, time(30).milliseconds);

// setInterval(async () => {
//   const result = await fetch('https://koinex.in/api/ticker');
//   const dataStats = JSON.parse(await result.text())['stats']['inr'];

//   // ===== For falling prices 
//   for (const [coin, valueObj] of Object.entries(portfolio)) {
//     // The max price buyers are ready to pay    
//     const currentHighestBidPrice = dataStats[coin]['highest_bid'];
//     jclrz({ currentHighestBidPrice });
//     // console.log(coin, valueObj, currentHighestBidPrice);

//     const priceFallDetails = Object.entries(valueObj.highestBidPrices).find(([ time, lastHighestBidPrice ]) => {
//       // console.log(time, lastHighestBidPrice);
//       const bidPriceDifference = currentHighestBidPrice - lastHighestBidPrice;
//       const tolerance = valueObj.tolerance;

//       const highestBidPricesHaveFallen = bidPriceDifference < 0 && Math.abs(bidPriceDifference) >= tolerance;
//       return highestBidPricesHaveFallen;
//     });

//     if (priceFallDetails && !valueObj.emailSentInLastThirtyMins) {
//       console.log(priceFallDetails);
//       const [duration, price] = priceFallDetails;
      
//       sendMail({ subject: `${coin} Prices fell by ${price - currentHighestBidPrice} in ${duration}` })
//       .then((info) => {
//         jclrz(info);
//         valueObj.emailSentInLastThirtyMins = true;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//     }

//     // ============= For rising prices

//     // The min price sellers are selling at
//     const currentLowestAskPrice = dataStats[coin]['lowest_ask'];
//     jclrz({ currentLowestAskPrice });
//     const priceRiseDetails = Object.entries(valueObj.lowestAskPrices).find(([time, lastLowestAskPrice]) => {
//       // console.log(time, lastHighestBidPrice);      
//       const priceDifference = currentLowestAskPrice - lastLowestAskPrice;
//       const tolerance = valueObj.tolerance;      

//       const priceHasRisen = priceDifference > 0 && priceDifference >= tolerance;
//       return priceHasRisen;
//     });

//     if (priceRiseDetails && !valueObj.emailSentInLastThirtyMins) {
//       // console.log(priceRiseDetails);
//       const [duration, price] = priceRiseDetails;
//       sendMail({ subject: `${coin} Prices rose by ${price - currentLowestAskPrice} in ${duration}` })
//       .then((info) => {
//         jclrz(info);
//         valueObj.emailSentInLastThirtyMins = true;
//       }).catch( err => {
//         console.log(err);
//       });      
//     }

//     // Update the per coin portfolio
//     updatePortfolio({ coin, coinDetails: dataStats[coin] });
//   }

//   runningTick = runningTick + 1;

//   jclrz(portfolio);
// }, time(INTERVAL_PER_MINUTE).minutes);


setInterval(() => {
  for (const [_, valueObj] of Object.entries(portfolio)) {
    valueObj.emailSentInLastThirtyMins = false;
  }
}, time(30).minutes);

// For Heroku
// setInterval(() => {
//   fetch('http://');
// }, time(20).minutes);