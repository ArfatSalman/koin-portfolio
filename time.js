const convertToMs = (time, unit) => {
  if (unit === 's') {
    return 1000 * time;
  }
}

const time = (timeQuanta, configObj) => {
  let timeInMilliseconds;

  if (typeof timeQuanta === 'string') {
    const regex = /^(\d)[\s]*([ms|s|m|h|d])$/i;
    const matches = regex.exec(timeQuanta);
    
    if (matches === null) {
      throw new Error(`Cannot parse ${timeQuanta}`);
    }

    const [, time, unit] = matches;
  }

  return {
    get milliseconds() {
      return timeQuanta;
    },
    get seconds() {
      return 1000 * this.milliseconds;
    },
    get minutes() {
      return 60 * this.seconds;
    },
    get hours() {
      return 60 * this.minutes;
    }
  }
}

module.exports = time;

time('5');

time('5ms').hours;

const toMS = Time({ out: 'ms'});

toMS(5).seconds // 5000