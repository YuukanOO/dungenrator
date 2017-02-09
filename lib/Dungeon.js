const Room = require('./Room');
const Random = require('./Random');
const gm = require('gm');
const path = require('path');
const fs = require('fs');

class Dungeon {
  constructor() {
    this.mapPath = path.join(process.cwd(), 'dungenrator');
    this.mapSize = 25;
    this.maxRoomSize = 15;
    this.minRoomSize = 4;
    this.rooms = [];
    this.gridSize = 4;
    this.padding = 1;
  }

  /**
   * Generates the dungeon!
   */
  generate() {
    for (let i = 0; i < 30; i += 1) {
      const point = this.getRandomPointInCircle(this.mapSize);

      this.rooms.push(new Room(
        point.x,
        point.y,
        Random.get(this.minRoomSize, this.maxRoomSize),
        Random.get(this.minRoomSize, this.maxRoomSize)));
    }

    this.separateRooms();
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  normalize(v) {
    let len = Math.sqrt(v.x * v.x + v.y * v.y);

    if (len === 0) {
      len = 1;
    }

    return { x: v.x / len, y: v.y / len };
  }

  computeSeparation(i) {

  }

  computeAlignment(i) {

  }

  computeCohesion(i) {

  }

  separateRooms() {
    for (let i = 0; i < this.rooms.length; i += 1) {
      const alignment = this.computeAlignment(agent);
      const cohesion = this.computeCohesion(agent);
      const separation = this.computeSeparation(agent);
    }
  }

  getRandomPointInCircle(radius) {
    const t = 2 * Math.PI * Math.random();
    const u = Math.random() + Math.random();
    let r = null;

    if (u > 1) {
      r = 2 - u;
    } else {
      r = u;
    }

    return {
      x: this.snap(radius * r * Math.cos(t)),
      y: this.snap(radius * r * Math.sin(t)),
    };
  }

  snap(val) {
    return Math.floor(((val + this.gridSize - 1) / this.gridSize)) * this.gridSize;
  }

  writeString() {
    return '';
  }

  /**
   * Write the generated dungeon image to the file system.
   */
  writeImage() {
    const imgSize = 100;
    const imgSizeOver2 = imgSize / 2;

    let svgData = `<svg width="${imgSize}" height="${imgSize}"><rect width="${imgSize}" height="${imgSize}" fill="#000000" />`;

    for (let i = 0; i < this.rooms.length; i += 1) {
      const room = this.rooms[i];

      svgData += `<rect fill="#ffffff" opacity="0.5" x="${room.x + imgSizeOver2}" y="${room.y + imgSizeOver2}" width="${room.width}" height="${room.height}" />`;
    }

    // for (let x = 0; x < this.mapSize; x += 1) {
    //   for (let y = 0; y < this.mapSize; y += 1) {
    //     switch (this.map[x][y]) {
    //       case 1:
    //         svgData += `<rect x="${x}" y="${y}" width="1" height="1" fill="#ffffff" />`;
    //         break;
    //       case 2:
    //         svgData += `<rect x="${x}" y="${y}" width="1" height="1" fill="#cccccc" />`;
    //         break;
    //       default:
    //         svgData += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000000" />`;
    //     }
    //   }
    // }

    svgData += '</svg>';

    fs.writeFile(`${this.mapPath}.svg`, svgData, (err) => {
      if (err) {
        console.error(err);
      }

      gm(`${this.mapPath}.svg`)
        .scale(400, 400)
        .write(`${this.mapPath}.png`, (er) => {
          if (er) {
            console.error(er);
          }
        });
    });
  }
}

module.exports = Dungeon;
