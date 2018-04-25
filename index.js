const fetch = require('node-fetch');
const jclrz = require('json-colorz');
const sendMail = require('./sendMail');
const time = require('./time');

process
  .on('unhandledRejection', async (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    await sendMail({ subject: `${reason} 'Unhandled Rejection at Promise' ${p}` });
  })
  .on('uncaughtException', async err => {
    await sendMail({ subject: `${err}` });
    throw err;
  });

let runningTick = 1; // minutes
const INTERVAL_PER_MINUTE = 2;

const normalisedTimeQuantas = [2, 10, 20, 30, 60, 90, 120, 180];
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


const portfolio = {
  ETH: {
    quantity: 0.25000,
    boughtAt: 40401,
    highestBidPrices: { },
    lowestAskPrices: { },
    tolerance: 1000
  },
  REQ: {
    highestBidPrices: { },
    lowestAskPrices: { },
    tolerance: 1
  }
};

// const checkPricesHaveFallenOf = ({ coin, currentHighestBidPrice,  lastHighestBidPrice, duration }) => {
//   const bidPriceDifference = currentHighestBidPrice - lastHighestBidPrice;
//   console.log(`bidPriceDifference => ${bidPriceDifference}`);
//   const tolerance = portfolio[coin].tolerance;

//   // If currentBidPrice has fallen by more than tolerance level.
//   // bidPriceDifference < 0 because the price should be negative for 
//   // falling
//   // check whether prices have fallen by tolerance in last X minutes/hours
//   const highestBidPricesHaveFallen = bidPriceDifference < 0 && Math.abs(bidPriceDifference) >= tolerance;
//   console.log(`highestBidPricesHaveFallen ${highestBidPricesHaveFallen}`);

//   if (highestBidPricesHaveFallen) {
//     sendMail({ subject: `${coin} Prices fell by ${bidPriceDifference} in ${duration}` })
//     .then((mailInfo) => {
//       console.log(mailInfo);
//     })
//   }
// }

const updatePortfolio = ({ coin, currentHighestBidPrice, currentLowestAskPrice }) => {

  const normalisedTime = Object.values(timeKeys).map(({timeQuanta, name}) => ({ name, timeQuanta: timeQuanta / INTERVAL_PER_MINUTE }));
  const reverseSorted = normalisedTime.sort((a, b) => b.timeQuanta - a.timeQuanta);
  reverseSorted.forEach(({timeQuanta, name}) => {
    if (runningTick % timeQuanta === 0) {
      const bidPrices = portfolio[coin].highestBidPrices;
      bidPrices[name] = currentHighestBidPrice;

      const askPrices = portfolio[coin].lowestAskPrices;
      askPrices[name] = currentLowestAskPrice;
    }
  });

  // const highestBidPrices = portfolio[coin].highestBidPrices;

  // if (runningTick % 180 === 0) {
  //   highestBidPrices[timeMarkers.THREE_HOURS] = currentHighestBidPrice;
  // } else if (runningTick % 120 === 0) {
  //   highestBidPrices[timeMarkers.TWO_HOURS] = currentHighestBidPrice;
  // } else if (runningTick % 30 === 0) {
  //   highestBidPrices[timeMarkers.THIRTY] = currentHighestBidPrice;
  // } else if (runningTick % 60 === 0) {
  //   highestBidPrices[timeMarkers.ONE_HOUR] = currentHighestBidPrice;
  // } else if (runningTick % 10 === 0) {
  //   highestBidPrices[timeMarkers.TEN] = currentHighestBidPrice;
  // } else if (runningTick % 2 === 0) {
  //   highestBidPrices[timeMarkers.TWO] = currentHighestBidPrice;
  // }
}

setInterval(async () => {
  const result = await fetch('https://koinex.in/api/ticker');
  
  const dataStats = JSON.parse(await result.text())['stats'];

  // ===== For falling prices 
  for (const [coin, valueObj] of Object.entries(portfolio)) {
    // The max price buyers are ready to pay    
    const currentHighestBidPrice = dataStats[coin]['highest_bid'];
    // console.log(coin, valueObj, currentHighestBidPrice);

    const priceFallDetails = Object.entries(valueObj.highestBidPrices).find(([ time, lastHighestBidPrice ]) => {
      // console.log(time, lastHighestBidPrice);
      const bidPriceDifference = currentHighestBidPrice - lastHighestBidPrice;
      const tolerance = valueObj.tolerance;

      const highestBidPricesHaveFallen = bidPriceDifference < 0 && Math.abs(bidPriceDifference) >= tolerance;
      return highestBidPricesHaveFallen;
    });

    if (priceFallDetails) {
      console.log(priceFallDetails);
      const [duration, price] = priceFallDetails;
      sendMail({ subject: `${coin} Prices fell by ${price - currentHighestBidPrice} in ${duration}` })
      .then((info) => jclrz(info));
    }

    // ============= For rising prices

    // The min price sellers are selling at
    const currentLowestAskPrice = dataStats[coin]['lowest_ask']
    const priceRiseDetails = Object.entries(valueObj.lowestAskPrices).find(([time, lastLowestAskPrice]) => {
      // console.log(time, lastHighestBidPrice);      
      const priceDifference = currentLowestAskPrice - lastLowestAskPrice;
      const tolerance = valueObj.tolerance;      

      const priceHasRisen = priceDifference > 0 && priceDifference >= tolerance;
      return priceHasRisen;
    });

    if (priceRiseDetails) {
      // console.log(priceRiseDetails);
      const [duration, price] = priceRiseDetails;
      sendMail({ subject: `${coin} Prices fell by ${price - currentLowestAskPrice} in ${duration}` })
      .then((info) => jclrz(info));      
    }

    // Update the per coin portfolio
    updatePortfolio({ coin, currentHighestBidPrice, currentLowestAskPrice });
  }




  // const coin = 'ETH';

  // // The max price buyers are ready to pay
  // const currentHighestBidPrice = dataStats[coin]['highest_bid'];
  // console.log(`currentHighestBidPrice ${currentHighestBidPrice}`);
  // const lastHighestBidPrices = portfolio[coin].highestBidPrices;

  // for (const [time, price] of Object.entries(lastHighestBidPrices)) {
  //   console.log(`Running loop on [${time}, ${price}]`);
  //   checkPricesHaveFallenOf({
  //     coin,
  //     currentHighestBidPrice,
  //     lastHighestBidPrice: price,
  //     duration: time
  //   });
  // }
    // const bidPriceDifference = currentHighestBidPrice - lastHighestBidPrice;
    // const tolerance = portfolio[coin].tolerance;

    // // If currentBidPrice has fallen by more than tolerance level
    // // bidPriceDifference < 0 because the price should be negative for 
    // // falling
    // // check whether prices have fallen by tolerance in last 10 minutes
    // const highestBidPricesHaveFallen = bidPriceDifference < 0 && Math.abs(bidPriceDifference) >= tolerance;
    // if (highestBidPricesHaveFallen) {
    //   await sendMail({ subject: `${coin} Prices fell by ${bidPriceDifference}` })
    // }

  // Update Portfolio prices
  // updatePortfolioHigestBidPrices(coin, currentHighestBidPrice);

  // update running tick
  runningTick = runningTick + 1;

  jclrz(portfolio);
}, time(INTERVAL_PER_MINUTE).minutes);


// For Heroku
// setInterval(() => {
//   fetch('http://');
// }, time(20).minutes);