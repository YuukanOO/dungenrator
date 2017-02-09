class Room {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.left = this.x;
    this.right = this.x;

    if (this.width < 0) {
      this.left += this.width;
    } else {
      this.right += this.width;
    }

    this.bottom = y;
    this.top = y;

    if (this.height < 0) {
      this.bottom += this.height;
    } else {
      this.top += this.height;
    }
  }

  touches(b, padding = 0) {
    return !(b.left - padding >= this.right ||
            b.right <= this.left - padding ||
            b.top <= this.bottom - padding ||
            b.bottom - padding >= this.top);
  }

  width() {
    return this.right - this.left;
  }

  height() {
    return this.top - this.bottom;
  }

  shift(x, y) {
    this.left += x;
    this.right += x;

    this.top += y;
    this.bottom += y;
  }
}

module.exports = Room;
