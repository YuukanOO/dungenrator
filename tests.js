const dungenrator = require('./index');

const dungeon = new dungenrator.Dungeon();

dungeon.generate();

// console.log(dungeon);
// console.log(dungeon.writeString());
dungeon.writeImage();
