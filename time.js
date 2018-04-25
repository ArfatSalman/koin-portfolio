const time = (timeQuanta) => {
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