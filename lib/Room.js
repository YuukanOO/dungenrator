class Room {
  constructor(id, x, y, width, height, color) {
    this.id = id;
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

  centerX() {
    return (this.left + this.right) / 2.0;
  }

  centerY() {
    return (this.top + this.bottom) / 2.0;
  }

  width() {
    return this.right - this.left;
  }

  height() {
    return this.top - this.bottom;
  }

  shift(x, y) {
    this.x += x;
    this.y += y;

    this.left += x;
    this.right += x;

    this.top += y;
    this.bottom += y;
  }
}

module.exports = Room;
