class Random {
  static get(low, high) {
    return ~~(Math.random() * (high - low)) + low; // eslint-disable-line
  }
}

module.exports = Random;
