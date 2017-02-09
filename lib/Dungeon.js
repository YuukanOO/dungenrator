const Room = require('./Room');
const Random = require('./Random');
const gm = require('gm');
const path = require('path');
const fs = require('fs');

const colors = [
  '#38c974',
  '#2e50c5',
  '#db4437',
  '#1da1f2',
  '#3b5998',
  '#333333',
  '#ea9560',
  '#e67e1d',
  '#abacac',
  '#e488cc',
  '#2d9fff',
  '#393939',
  '#ca2daa',
  '#ff65be',
  '#be66ea',
];

class Dungeon {
  constructor() {
    this.map = null;
    this.mapPath = path.join(process.cwd(), 'dungenrator.svg');
    this.mapSize = 32;
    this.imageScale = 12;
    this.rooms = [];
    this.maxRoomsNumber = 10;
    this.minRoomsNumber = 3;
    this.minRoomSize = 3;
    this.maxRoomSize = 8;
    this.backgroundColor = '#000000';
    this.roomColor = '#ffffff';
  }

  /**
   * Generates the dungeon!
   */
  generate() {
    this.map = [];

    // Generates an empty 2 dimensional array
    for (let x = 0; x < this.mapSize; x += 1) {
      this.map[x] = [];
      for (let y = 0; y < this.mapSize; y += 1) {
        this.map[x][y] = 0;
      }
    }

    // Gets a random number of rooms to generate
    const numberOfRooms = Random.get(this.minRoomsNumber, this.maxRoomsNumber);

    // Determines sizes and positions of each rooms
    for (let i = 0; i < numberOfRooms; i += 1) {
      const room = new Room(
        Random.get(1, this.mapSize - this.maxRoomSize - 1),
        Random.get(1, this.mapSize - this.maxRoomSize - 1),
        Random.get(this.minRoomSize, this.maxRoomSize),
        Random.get(this.minRoomSize, this.maxRoomSize),
        colors[i]);

      if (!this.doesCollide(room)) {
        room.width -= 1;
        room.height -= 1;

        this.rooms.push(room);
      } else {
        i -= 1;
      }
    }

    this.squashRooms();

    // Starts building corridors
    for (let i = 0; i < numberOfRooms; i += 1) {
      const roomA = this.rooms[i];
      const roomB = this.findClosestRoom(roomA);

      const pointA = {
        x: Random.get(roomA.x, roomA.x + roomA.width),
        y: Random.get(roomA.y, roomA.y + roomA.height),
      };
      const pointB = {
        x: Random.get(roomB.x, roomB.x + roomB.width),
        y: Random.get(roomB.y, roomB.y + roomB.height),
      };

      while ((pointB.x !== pointA.x) || (pointB.y !== pointA.y)) {
        if (pointB.x !== pointA.x) {
          if (pointB.x > pointA.x) {
            pointB.x -= 1;
          } else {
            pointB.x += 1;
          }
        } else if (pointB.y !== pointA.y) {
          if (pointB.y > pointA.y) {
            pointB.y -= 1;
          } else {
            pointB.y += 1;
          }
        }

        this.map[pointB.x][pointB.y] = 1;
      }
    }

    for (let i = 0; i < numberOfRooms; i += 1) {
      const room = this.rooms[i];
      for (let x = room.x; x < room.x + room.width; x += 1) {
        for (let y = room.y; y < room.y + room.height; y += 1) {
          this.map[x][y] = 1;
        }
      }
    }

    // Find walls
    for (let x = 0; x < this.mapSize; x += 1) {
      for (let y = 0; y < this.mapSize; y += 1) {
        if (this.map[x][y] === 1) {
          for (let xx = x - 1; xx <= x + 1; xx += 1) {
            for (let yy = y - 1; yy <= y + 1; yy += 1) {
              if (this.map[xx][yy] === 0) {
                this.map[xx][yy] = 2;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Gets the closest room relative to the given one.
   *
   * @param {Room} room Room to check.
   * @returns {Room} The closest room.
   */
  findClosestRoom(room) {
    const mid = {
      x: room.x + (room.width / 2),
      y: room.y + (room.height / 2),
    };
    let closest = null;
    let closestDistance = 1000;

    for (let i = 0; i < this.rooms.length; i += 1) {
      const check = this.rooms[i];
      if (check !== room) {
        const checkMid = {
          x: check.x + (check.width / 2),
          y: check.y + (check.height / 2),
        };
        const distance = Math.min(
          Math.abs(mid.x - checkMid.x) - (room.width / 2) - (check.width / 2),
          Math.abs(mid.y - checkMid.y) - (room.height / 2) - (check.height / 2));
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = check;
        }
      }
    }
    return closest;
  }

  /**
   * Checks if a room collides with another one.
   *
   * @param {Room} room Room to check.
   * @param {Number} ignore Index of room to ignore.
   * @returns {Boolean} True if it collides, false otherwise.
   */
  doesCollide(room, ignore) {
    for (let i = 0; i < this.rooms.length; i += 1) {
      if (i !== ignore) {
        const check = this.rooms[i];

        if (!((room.x + room.width < check.x)
            || (room.x > check.x + check.width)
            || (room.y + room.height < check.y)
            || (room.y > check.y + check.height))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Remove large gaps between rooms.
   */
  squashRooms() {
    for (let i = 0; i < 10; i += 1) {
      for (let j = 0; j < this.rooms.length; j += 1) {
        const room = this.rooms[j];

        // eslint-disable-next-line
        while (true) {
          const oldPosition = {
            x: room.x,
            y: room.y,
          };

          if (room.x > 1) {
            room.x -= 1;
          }

          if (room.y > 1) {
            room.y -= 1;
          }

          if ((room.x === 1) && (room.y === 1)) {
            break;
          }

          if (this.doesCollide(room, j)) {
            room.x = oldPosition.x;
            room.y = oldPosition.y;
            break;
          }
        }
      }
    }
  }

  /**
   * Print the generated dungeon to a string.
   */
  writeString() {
    let string = '';
    for (let x = 0; x < this.mapSize; x += 1) {
      for (let y = 0; y < this.mapSize; y += 1) {
        string += this.map[y][x];
      }
      string += '\n';
    }

    return string;
  }

  /**
   * Write the generated dungeon image to the file system.
   */
  writeImage() {
    let svgData = '<svg>';
    for (let x = 0; x < this.mapSize; x += 1) {
      for (let y = 0; y < this.mapSize; y += 1) {
        switch (this.map[x][y]) {
          case 1:
            svgData += `<rect x="${x}" y="${y}" width="1" height="1" fill="#ffffff" />`;
            break;
          case 2:
            svgData += `<rect x="${x}" y="${y}" width="1" height="1" fill="#cccccc" />`;
            break;
          default:
            svgData += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000000" />`;
        }
      }
    }

    svgData += '</svg>';

    fs.writeFile(this.mapPath, svgData, (err) => {
      if (err) {
        console.error(err);
      }
    });

    // const img = gm(this.mapSize, this.mapSize, this.backgroundColor);

    // // Starts by drawing rooms
    // for (let i = 0; i < this.rooms.length; i += 1) {
    //   const room = this.rooms[i];

    //   img
    //     .fill(room.color)
    //     .drawRectangle(room.x, room.y, room.x + room.width, room.y + room.height);
    // }

    // // Draw something
    // for (let x = 0; x < this.mapSize; x += 1) {
    //   for (let y = 0; y < this.mapSize; y += 1) {
    //     if (this.map[x][y] === 3) {
    //       img.fill('#ffffff').drawRectangle(x, y, x + 1, y + 1);
    //     }
    //   }
    // }

    // img
    // .scale(this.mapSize * this.imageScale, this.mapSize * this.imageScale)
    // .write(this.mapPath, (err) => {
    //   if (err) {
    //     console.error(this.mapPath, err);
    //   }
    // });
  }
}

module.exports = Dungeon;
