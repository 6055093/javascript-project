/*
NOTE: You will need to add and modify code in this file to complete this project.
I have defined a few functions and variables to help guide you but that doesn't mean no other variables or functions are necessary.
If you think you have a better / different way to do things, you are free to do so :)
*/

const monsterNames = [
  'Bigfoot',
  'Centaur',
  'Cerberus',
  'Chimera',
  'Ghost',
  'Goblin',
  'Golem',
  'Manticore',
  'Medusa',
  'Minotaur',
  'Ogre',
  'Vampire',
  'Wendigo',
  'Werewolf',
];

const RARITY_LIST = ['Common', 'Unusual', 'Rare', 'Epic'];
const items = [
  {
    name: 'Common potion',
    type: 'potion',
    value: 5,
    rarity: 0,
    use: useItem,
  },
  {
    name: 'Common bomb',
    type: 'bomb',
    value: 7,
    rarity: 0,
    use: useItem,
  },
  {
    name: 'Epic key',
    type: 'key',
    value: 150,
    rarity: 3,
    use: useItem,
  },
]; // Array of item objects. These will be used to clone new items with the appropriate properties.
const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
let gameStep = 0; // The current game step, value is index of the GAME_STEPS array.
let board = []; // The board holds all the game entities. It is a 2D array.

let player = {}; // The player object
let skills = [
  (confuse = {
    name: 'Confuse',
    requiredLevel: 1,
    cooldown: 10000,
    use: useSkill,
  }),
  (steal = {
    name: 'Steal',
    requiredLevel: 3,
    cooldown: 25000,
    use: useSkill,
  }),
];

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color) {
  if (typeof arg === 'object') console.log(arg);
  else console.log('%c' + arg, `color: ${color};`);
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count = 20) {
  let dash = '-';
  console.log(
    '%c' + dash.repeat(count) + title + dash.repeat(count),
    'color: blue' + ';font-weight:bold;'
  );
}

// Returns a new object with the same keys and values as the input object
function clone(entity) {
  let clonedEntity = {};
  return Object.assign(clonedEntity, entity);
}

// returns true or false to indicate whether 2 different objects have the same keys and values
function assertEqual(obj1, obj2) {
  if (Object.entries(obj1).toString() === Object.entries(obj2).toString()) {
    return true;
  }
  return false;
}

// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {
  return objs.slice();
}

// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target) {
  for (let i = 0; i < player.items.length; i++) {
    if (player.items[i].name.includes(itemName)) {
      if (itemName === 'Common potion') {
        if (target === undefined) {
          player.hp += 25;
          delete player.items[i];
          return console.log(
            'Used ' + itemName + '! +25hp (Total HP: ' + player.hp + ')'
          );
        } else {
          target.hp += 25;
          delete player.items[i];
          return console.log(
            'Used ' + itemName + '! +25hp (Total HP: ' + target.hp + ')'
          );
        }
      }
      if (itemName === 'Common bomb') {
        if (target === undefined) {
          player.hp -= 50;
          delete player.items[i];
          return console.log(
            'Used ' + itemName + '! -50hp (Total HP: ' + player.hp + ')'
          );
        } else {
          target.hp -= 50;
          delete player.items[i];
          return console.log(
            'Used ' + itemName + '! -50hp (Total HP: ' + target.hp + ')'
          );
        }
      }
      if (itemName === 'Epic key') {
        if (player.position === createDungeon.position) {
          isLocked = false;
          delete player.items[i];
          return console.log('You unlocked the dungeon!');
        }
      }
    } else {
      console.log("You don't have a " + itemName + ' in your inventory.');
    }
  }
}

// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName, target) {
  for (let i = 0; i < player.skills.length; i++) {
    if (player.skills[i].name.includes(skillName)) {
      if (skillName === 'confuse') {
        console.log('Confusing ' + target.name + ' ...');
        target.name = target.name.split('');
        target.name = target.name.reverse();
        target.name = target.name.join('');
        console.log(
          target.name + ' is confused and hurts itself in the process'
        );
        target.hp -= player.level * 25;
        console.log(target.name + ' hit! - 25hp. HP left: ' + target.hp);
      }
    }
  }
}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {
  for (let j = 0; j < rows; j++) {
    let Entity = [];
    for (let i = 0; i < columns; i++) {
      if (j === 0 || j === rows - 1) {
        wallEntity = {};
        wallEntity.type = 'wall';
        wallEntity.symbol = '#';
        wallEntity.position = { row: j, column: i };
        Entity.push(wallEntity);
      } else {
        if (i === 0 || i === columns - 1) {
          wallEntity = {};
          wallEntity.type = 'wall';
          wallEntity.symbol = '#';
          wallEntity.position = { row: j, column: i };
          Entity.push(wallEntity);
        } else {
          grassEntity = {};
          grassEntity.type = 'grass';
          grassEntity.symbol = '.';
          grassEntity.position = { row: j, column: i };
          Entity.push(grassEntity);
        }
      }
    }
    board.push(Entity);
  }
}

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  board[entity.position.row][entity.position.column] = entity;
  printBoard();
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer() {
  board[Math.floor(board.length / 2)][Math.floor(board[0].length / 2)] = player;
  player.position.row = Math.floor(board.length / 2);
  player.position.column = Math.floor(board[0].length / 2);
}

// Creates the board and places player
function initBoard(rows, columns) {
  createBoard(rows, columns);
  placePlayer();
  console.log('Creating board and placing player...');
}

// Prints the board
function printBoard() {
  for (let i = 0; i < board.length; i++) {
    let boardPrint = '';
    for (let j = 0; j < board[0].length; j++) {
      if (i === player.position.row && j === player.position.column) {
        boardPrint += player.symbol;
      } else {
        boardPrint += board[i][j].symbol;
      }
    }
    console.log(boardPrint);
  }
}
// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {
  let startItems = clone(items);
  let startSkills = clone(skills);
  if (level === 1 || level === 2) {
    startSkills = skills.slice(0, 1);
  }
  player.name = name;
  player.level = level;
  player.items = startItems;
  player.skills = startSkills;
  player.attack = player.level * 10;
  player.speed = 3000 / player.level;
  player.hp = player.level * 100;
  player.gold = 0;
  player.exp = 0;
  player.type = 'player';
  player.symbol = 'P';
  player.position = {};
  player.getMaxHp = function() {
    return level * 100;
  };
  player.levelUp = levelUp;
  player.getExpToLevel = function() {
    return level * 20;
  };

  console.log('Created a player with name ' + name + ' and level ' + level);
}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items = [], position) {
  let randomNumber = Math.floor(Math.random() * monsterNames.length);
  let monsterItems = clone(items);
  let newMonsters = {};

  newMonsters.name = monsterNames[randomNumber];
  newMonsters.level = level;
  newMonsters.hp = level * 100;
  newMonsters.attack = level * 10;
  newMonsters.speed = 6000 / level;
  newMonsters.items = monsterItems;
  newMonsters.position = position;
  newMonsters.type = 'monster';
  newMonsters.symbol = 'M';
  newMonsters.getMaxHp = function() {
    return level * 100;
  };
  newMonsters.getExp = function() {
    return level * 10;
  };

  console.log('Creating monster...');
  return newMonsters;
}

// Creates a tradesman object with the specified items and position. hp is Infinity
// The items property will need to be a new array of cloned item objects
function createTradesman(items, position) {
  console.log('Creating and placing Tradesman with name Mr. T...');
  let tradesmanItems = clone(items);
  let newTradesman = {};

  newTradesman.name = 'Mr. T';
  newTradesman.hp = Infinity;
  newTradesman.items = tradesmanItems;
  newTradesman.position = position;
  newTradesman.type = 'tradesman';
  newTradesman.symbol = 'T';
  newTradesman.getMaxHp = function() {
    return Infinity;
  };

  updateBoard(newTradesman);

  console.log('Creating and placing Tradesman with name Mr. T...');
}

// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {
  console.log('Creating and placing new item...');
  let newItem = clone(item);
  newItem.position = position;
  newItem.symbol = 'I';
  updateBoard(newItem);
}

// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(
  position,
  isLocked = true,
  hasPrincess = true,
  items = [],
  gold = 0
) {
  let newDungeon = {};
  newDungeon.isLocked = isLocked;
  newDungeon.hasPrincess = hasPrincess;
  newDungeon.items = items;
  newDungeon.gold = gold;
  newDungeon.position = position;
  newDungeon.type = 'dungeon';
  newDungeon.symbol = 'D';
  updateBoard(newDungeon);
}

// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {
  let grassEntity = {
    type: 'grass',
    symbol: '.',
    position: { row: player.position.row, column: player.position.column },
  };
  if (direction === 'U') {
    if (board[player.position.row - 1][player.position.column].symbol === '#') {
      printBoard();
      return console.log('%c' + "You can't go any further!", 'color: red');
    }
    if (board[player.position.row - 1][player.position.column].symbol === 'M') {
      let Monster = board[player.position.row - 1][player.position.column];
      console.log('%c' + 'Encountered a ' + Monster.name + '!', 'color: red');
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row - 1][player.position.column] = player;
      player.position.row = player.position.row - 1;
      let attackMonster = setInterval(function playerAttack() {
        Monster.hp = Monster.hp - player.attack;
        console.log(
          '%c' + "You've dealt " + player.attack + ' damage!',
          'color: purple'
        );
        console.log(
          '%c' + Monster.name + ' has ' + Monster.hp + ' HP remaining',
          'color: purple'
        );
        if (Monster.hp < 1) {
          console.log("You've defeated " + Monster.name + ' !');
          console.log('You earned ' + Monster.getExp() + ' EXP!');
          player.items = { ...player.items, ...Monster.items };
          player.exp = player.exp + Monster.getExp();
          levelUp();
          clearInterval(attackMonster);
          clearInterval(attackPlayer);
        }
      }, player.speed);
      let attackPlayer = setInterval(function monsterAttack() {
        player.hp = player.hp - Monster.attack;
        console.log(
          '%c' + Monster.name + ' hit you for ' + Monster.attack + ' damage!',
          'color: red'
        );
        console.log(
          '%c' + 'You have ' + player.hp + ' HP remaining',
          'color: red'
        );
        if (player.hp < 1) {
          console.log(Monster.name + ' has defeated you!');
          printSectionTitle('GAME OVER');
          clearInterval(attackPlayer);
        }
      }, Monster.speed);
    } else {
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row - 1][player.position.column] = player;
      player.position.row = player.position.row - 1;
    }
  }
  if (direction === 'D') {
    if (board[player.position.row + 1][player.position.column].symbol === '#') {
      printBoard();
      return console.log('%c' + "You can't go any further!", 'color: red');
    }
    if (board[player.position.row + 1][player.position.column].symbol === 'M') {
      let Monster = board[player.position.row + 1][player.position.column];
      console.log('%c' + 'Encountered a ' + Monster.name + '!', 'color: red');
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row + 1][player.position.column] = player;
      player.position.row = player.position.row + 1;
      let attackMonster = setInterval(function playerAttack() {
        Monster.hp = Monster.hp - player.attack;
        console.log(
          '%c' + "You've dealt " + player.attack + ' damage!',
          'color: purple'
        );
        console.log(
          '%c' + Monster.name + ' has ' + Monster.hp + ' HP remaining',
          'color: purple'
        );
        if (Monster.hp < 1) {
          console.log("You've defeated " + Monster.name + ' !');
          console.log('You earned ' + Monster.getExp() + ' EXP!');
          player.items = { ...player.items, ...Monster.items };
          player.exp = player.exp + Monster.getExp();
          levelUp();
          clearInterval(attackMonster);
          clearInterval(attackPlayer);
        }
      }, player.speed);
      let attackPlayer = setInterval(function monsterAttack() {
        player.hp = player.hp - Monster.attack;
        console.log(
          '%c' + Monster.name + ' hit you for ' + Monster.attack + ' damage!',
          'color: red'
        );
        console.log(
          '%c' + 'You have ' + player.hp + ' HP remaining',
          'color: red'
        );
        if (player.hp < 1) {
          console.log(Monster.name + ' has defeated you!');
          printSectionTitle('GAME OVER');
          clearInterval(attackPlayer);
        }
      }, Monster.speed);
    } else {
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row + 1][player.position.column] = player;
      player.position.row = player.position.row + 1;
    }
  }
  if (direction === 'L') {
    if (board[player.position.row][player.position.column - 1].symbol === '#') {
      printBoard();
      return console.log('%c' + "You can't go any further!", 'color: red');
    }
    if (board[player.position.row][player.position.column - 1].symbol === 'M') {
      let Monster = board[player.position.row][player.position.column - 1];
      console.log('%c' + 'Encountered a ' + Monster.name + '!', 'color: red');
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row][player.position.column - 1] = player;
      player.position.column = player.position.column - 1;
      let attackMonster = setInterval(function playerAttack() {
        Monster.hp = Monster.hp - player.attack;
        console.log(
          '%c' + "You've dealt " + player.attack + ' damage!',
          'color: purple'
        );
        console.log(
          '%c' + Monster.name + ' has ' + Monster.hp + ' HP remaining',
          'color: purple'
        );
        if (Monster.hp < 1) {
          console.log("You've defeated " + Monster.name + ' !');
          console.log('You earned ' + Monster.getExp() + ' EXP!');
          player.items = { ...player.items, ...Monster.items };
          player.exp = player.exp + Monster.getExp();
          levelUp();
          clearInterval(attackMonster);
          clearInterval(attackPlayer);
        }
      }, player.speed);
      let attackPlayer = setInterval(function monsterAttack() {
        player.hp = player.hp - Monster.attack;
        console.log(
          '%c' + Monster.name + ' hit you for ' + Monster.attack + ' damage!',
          'color: red'
        );
        console.log(
          '%c' + 'You have ' + player.hp + ' HP remaining',
          'color: red'
        );
        if (player.hp < 1) {
          console.log(Monster.name + ' has defeated you!');
          printSectionTitle('GAME OVER');
          clearInterval(attackPlayer);
        }
      }, Monster.speed);
    } else {
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row][player.position.column - 1] = player;
      player.position.column = player.position.column - 1;
    }
  }
  if (direction === 'R') {
    if (board[player.position.row][player.position.column + 1].symbol === '#') {
      printBoard();
      return console.log('%c' + "You can't go any further!", 'color: red');
    }
    if (board[player.position.row][player.position.column + 1].symbol === 'M') {
      let Monster = board[player.position.row][player.position.column + 1];
      console.log('%c' + 'Encountered a ' + Monster.name + '!', 'color: red');
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row][player.position.column + 1] = player;
      player.position.column = player.position.column + 1;
      let attackMonster = setInterval(function playerAttack() {
        Monster.hp = Monster.hp - player.attack;
        console.log(
          '%c' + "You've dealt " + player.attack + ' damage!',
          'color: purple'
        );
        console.log(
          '%c' + Monster.name + ' has ' + Monster.hp + ' HP remaining',
          'color: purple'
        );
        if (Monster.hp < 1) {
          console.log("You've defeated " + Monster.name + ' !');
          console.log('You earned ' + Monster.getExp() + ' EXP!');
          player.items = { ...player.items, ...Monster.items };
          player.exp = player.exp + Monster.getExp();
          levelUp();
          clearInterval(attackMonster);
          clearInterval(attackPlayer);
        }
      }, player.speed);
      let attackPlayer = setInterval(function monsterAttack() {
        player.hp = player.hp - Monster.attack;
        console.log(
          '%c' + Monster.name + ' hit you for ' + Monster.attack + ' damage!',
          'color: red'
        );
        console.log(
          '%c' + 'You have ' + player.hp + ' HP remaining',
          'color: red'
        );
        if (player.hp < 1) {
          console.log(Monster.name + ' has defeated you!');
          printSectionTitle('GAME OVER');
          clearInterval(attackPlayer);
        }
      }, Monster.speed);
    } else {
      board[player.position.row][player.position.column] = grassEntity;
      board[player.position.row][player.position.column + 1] = player;
      player.position.column = player.position.column + 1;
    }
  }
  printBoard();
}

// Returns XP required to level up. Value is level \* 20, e.g. level 2 -> 40xp required
function getExpToLevel() {
  let remainingXP = player.level * 20 - player.exp;
  console.log('You need ' + remainingXP + ' EXP to level up!');
}

// Returns XP received for defeating monster. Value is level \* 10 e.g. level 2 -> 20 exp points received.
function getExp() {
  let Exp = monsters.level * 10;
  console.log('You will receive ' + Exp + ' EXP for defeating this monster');
}

// A method to update the level and the different properties affected by a level change. Level up happens when exp >= [player level * 20]
function levelUp() {
  if (player.exp >= player.level * 20) {
    player.level++;
    player.exp = player.exp - player.level * 20;
    player.attack = player.level * 10;
    player.speed = 3000 / player.level;
    player.hp = player.level * 100;

    console.log('Congratulations! You have reached level ' + player.level);

    if (player.level === 3) {
      player.skills.push(skills[1]);
      console.log(
        "You have unlocked the STEAL skill! Use it by calling useSkill('steal')"
      );
    }
  } else {
    getExpToLevel();
  }
}
function playerAttack(monster) {
  monster.hp = monster.hp - player.attack;
  console.log(
    '%c' + "You've dealt " + player.attack + ' damage!',
    'color: purple'
  );
  console.log(
    '%c' + monster.name + ' has ' + monster.hp + ' HP remaining',
    'color: purple'
  );
  if (monster.hp < 1) {
    player.items = { ...player.items, ...monster.items };
    player.exp = player.exp + monster.getExp();
    levelUp();
  }
}

// quick launch
function quickLaunch() {
  createPlayer('Jordan');
  next();
  initBoard(7, 15);
  next();
}

function setupPlayer() {
  printSectionTitle('SETUP PLAYER');
  print(
    "Please create a player using the createPlayer function. Usage: createPlayer('Bob')"
  );
  print(
    "You can optionally pass in a level and items, e.g. createPlayer('Bob', 3, [items[0], items[2]]). items[0] refers to the first item in the items variable"
  );
  print("Once you're done, go to the next step with next()");
}

function setupBoard() {
  printSectionTitle('SETUP BOARD');
  print('Please create a board using initBoard(rows, columns)');
  print(
    'Setup monsters, items and more using createMonster(attr), createItem(item, pos), createTradesman(items, pos), createDungeon(pos), updateBoard(entity)'
  );
  print("Once you're done, go to the next step with next()");
}

function startGame() {
  printSectionTitle('START GAME');
  print('Hello ' + player.name);
  print(
    "You are ready to start your adventure. Use move('U' | 'D' | 'L' | 'R') to get going."
  );
  printBoard();
}

function gameOver() {
  printSectionTitle('GAME OVER');
}

function next() {
  gameStep++;
  run();
}

function run() {
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      break;
    case 'GAME_START':
      startGame();
      break;
  }
}

print('Welcome to the game!', 'gold');
print('Follow the instructions to setup your game and start playing');

run();
