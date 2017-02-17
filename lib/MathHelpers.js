class MathHelpers {
  static dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  static normalize(v) {
    let len = Math.sqrt(v.x * v.x + v.y * v.y);

    if (len === 0) {
      len = 1;
    }

    return { x: v.x / len, y: v.y / len };
  }
}

module.exports = MathHelpers;
