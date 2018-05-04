const INTERVAL_PER_MINUTE = 1;
const SLOPE_RUNNING_TICK = 1;

const timeKeys = {
  TWO: { timeQuanta: 2, name: 'two' },
  TEN: { timeQuanta: 10, name: 'ten' },
  TWENTY: { timeQuanta: 20, name: 'twenty' },
  THIRTY: { timeQuanta: 30, name: 'thirty' },
  ONE_HOUR: { timeQuanta: 60, name: 'oneHour' },
  ONE_HALF_HOUR: { timeQuanta: 90, name: 'oneHalfHour'},
  TWO_HOURS: { timeQuanta: 120, name: 'twoHours' },
  THREE_HOURS: { timeQuanta: 180, name: 'threeHours' },
};

const KOINEX_PROPERTIES = {
  HIGHEST_BID: 'highest_bid',
  LOWEST_ASK: 'lowest_ask',
  LAST_TRADED_PRICE: 'last_traded_price',
  KOINEX_TICKER_URL: 'https://koinex.in/api/ticker',
  KOINEX_COIN_DETAILS_PATH: 'stats.inr',
};

module.exports = {
  INTERVAL_PER_MINUTE,
  SLOPE_RUNNING_TICK,
  timeKeys,
  KOINEX_PROPERTIES,
};
