const Room = require('./Room');
const Random = require('./Random');
const MathHelpers = require('./MathHelpers');
const Delaunay = require('./Delaunay');
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
    this.tris = null;
    this.gridSize = 4;
    this.padding = 1;
  }

  /**
   * Generates the dungeon!
   */
  generate() {
    for (let i = 0; i < 20; i += 1) {
      const point = this.getRandomPointInCircle(this.mapSize);

      this.rooms.push(new Room(
        i,
        point.x,
        point.y,
        Random.get(this.minRoomSize, this.maxRoomSize),
        Random.get(this.minRoomSize, this.maxRoomSize)));
    }

    this.writeImage('.0');

    this.separateRooms();

    this.writeImage('.1');

    this.pickMainRooms();

    this.writeImage('.2');

    this.triangulate();

    this.writeImage('.3');
  }

  triangulate() {
    const data = this.rooms.map(r => [r.centerX(), r.centerY()]);
    this.tris = Delaunay.triangulate(data);

    console.log(this.tris);
  }

  pickMainRooms() {
    const thresold = 1.25 * (this.maxRoomSize / 2.25);

    for (let i = 0; i < this.rooms.length; i += 1) {
      const room = this.rooms[i];

      if (room.width > thresold && room.height > thresold) {
        room.color = '#ff0000';
      }
    }

    // Only keep those selected
    this.rooms = this.rooms.filter(r => r.color);
  }

  separateRooms() {
    let touching = true;

    while (touching) {
      touching = false;

      for (let i = 0; i < this.rooms.length; i += 1) {
        const a = this.rooms[i];

        let neighbors = 0;
        const v = {
          x: 0,
          y: 0,
        };

        for (let j = 0; j < this.rooms.length; j += 1) {
          if (j !== i) {
            const b = this.rooms[j];
            const aCenter = { x: a.centerX(), y: a.centerY() };
            const bCenter = { x: b.centerX(), y: b.centerY() };
            const distance = MathHelpers.dist(bCenter.x, bCenter.y, aCenter.x, aCenter.y);

            const aMax = Math.max(a.width, a.height);
            const bMax = Math.max(b.width, b.height);

            if (distance < Math.max(aMax, bMax)) {
              v.x = (v.x + bCenter.x - aCenter.x) * distance;
              v.y = (v.y + bCenter.y - aCenter.y) * distance;
              neighbors += 1;
            }
          }
        }

        if (neighbors !== 0) {
          touching = true;
          v.x /= neighbors;
          v.y /= neighbors;
          v.x *= -1;
          v.y *= -1;

          const normalizedOne = MathHelpers.normalize(v);

          a.shift(normalizedOne.x, normalizedOne.y);
        }
      }
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

  /**
   * Write the generated dungeon image to the file system.
   */
  writeImage(prefix = '') {
    const imgSize = 100;
    const imgSizeOver2 = imgSize / 2;
    const baseName = this.mapPath + prefix;

    let svgData = `<svg width="${imgSize}" height="${imgSize}"><rect width="${imgSize}" height="${imgSize}" fill="#000000" />`;

    for (let i = 0; i < this.rooms.length; i += 1) {
      const room = this.rooms[i];

      const color = room.color || '#ffffff';

      svgData += `<rect fill="${color}" opacity="0.5" x="${room.x + imgSizeOver2}" y="${room.y + imgSizeOver2}" width="${room.width}" height="${room.height}" />`;
    }

    if (this.tris) {
      let start = null;
      let end = null;

      for (let i = 0; i < this.tris.length; i += 1) {
        if (i === 0) {
          start = this.rooms[this.tris[i]];
        } else {
          end = this.rooms[this.tris[i]];
          const a = { x: start.centerX() + imgSizeOver2, y: start.centerY() + imgSizeOver2 };
          const b = { x: end.centerX() + imgSizeOver2, y: end.centerY() + imgSizeOver2 };
          svgData += `<line x1="${a.x}" y1= "${a.y}" x2="${b.x}" y2="${b.y}" style="stroke:#00ff00;stroke-width:1" />`;

          start = end;
        }
      }
    }

    svgData += '</svg>';

    fs.writeFile(`${baseName}.svg`, svgData, (err) => {
      if (err) {
        console.error(err);
      }

      gm(`${baseName}.svg`)
        .scale(400, 400)
        .write(`${baseName}.png`, (er) => {
          if (er) {
            console.error(er);
          }
        });
    });
  }
}

module.exports = Dungeon;
