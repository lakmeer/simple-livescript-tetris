(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, TetrisGame, inputHandler, tetrisGame, tileSize, tileWidth, tileHeight, currentBrick, nextBrick, gameState, outputCanvas, outputContext, DebugOutput, dbo, debugOutput, frameDriver;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
FrameDriver = require('./frame-driver').FrameDriver;
InputHandler = require('./input-handler').InputHandler;
TetrisGame = require('./tetris-game').TetrisGame;
inputHandler = new InputHandler;
tetrisGame = new TetrisGame;
tileSize = 20;
tileWidth = 10;
tileHeight = 18;
currentBrick = [[1, 0], [1, 0], [1, 1]];
nextBrick = [[1, 1], [1, 1]];
gameState = {
  metagameState: 'no-game',
  score: 0,
  nextBrick: {
    shape: nextBrick
  },
  currentBrick: {
    shape: currentBrick,
    pos: [4, 0]
  },
  inputState: [],
  elapsedTime: 0,
  elapsedFrames: 0,
  tileSize: tileSize,
  tileWidth: tileWidth,
  tileHeight: tileHeight,
  arena: [repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([0], tileWidth), repeatArray$([1], tileWidth), repeatArray$([2], tileWidth), repeatArray$([3], tileWidth), repeatArray$([4], tileWidth), repeatArray$([5], tileWidth), repeatArray$([6], tileWidth), repeatArray$([7], tileWidth)]
};
outputCanvas = document.getElementById('canvas');
outputContext = outputCanvas.getContext('2d');
outputCanvas.style.background = "white";
outputCanvas.style.border = "3px solid";
outputCanvas.style.borderColor = "#444 #999 #eee #777";
outputCanvas.style.borderRadius = "3px";
outputCanvas.width = 1 + 10 * 20;
outputCanvas.height = 1 + 18 * 20;
DebugOutput = require('./debug-output').DebugOutput;
InputHandler.on(192, function(){
  if (frameDriver.state.running) {
    return frameDriver.stop();
  } else {
    return frameDriver.start();
  }
});
dbo = document.createElement('pre');
document.body.appendChild(dbo);
debugOutput = new DebugOutput(dbo);
frameDriver = new FrameDriver(function(Δt, time, frame){
  gameState.elapsedTime = time;
  gameState.elapsedFrames = frame;
  gameState.inputState = inputHandler.changesSinceLastFrame();
  gameState = tetrisGame.runFrame(gameState, Δt);
  tetrisGame.render(gameState, outputContext);
  if (debugOutput != null) {
    debugOutput.render(gameState, dbo);
  }
  if (gameState.metagameState === 'failure') {
    return frameDriver.stop();
  }
});
frameDriver.start();
delay(1000, function(){
  return gameState.inputState.push({
    key: 'left',
    action: 'down'
  });
});
delay(1000, function(){
  return gameState.inputState.push({
    key: 'left',
    action: 'up'
  });
});
delay(30000, bind$(frameDriver, 'stop'));
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"./debug-output":2,"./frame-driver":3,"./input-handler":4,"./tetris-game":8,"std":5}],2:[function(require,module,exports){
var template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
template = {
  cell: function(it){
    if (it) {
      return "▒▒";
    } else {
      return "  ";
    }
  },
  brick: function(){
    return this.shape.map(function(it){
      return it.map(template.cell).join(' ');
    }).join("\n        ");
  },
  keys: function(){
    var i$, len$, keySummary, results$ = [];
    if (this.length) {
      for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
        keySummary = this[i$];
        results$.push(keySummary.key + '-' + keySummary.action + "|");
      }
      return results$;
    } else {
      return "(no change)";
    }
  },
  normal: function(){
    return " meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\nscore - " + this.score + "\n keys - " + template.keys.apply(this.inputState) + "\n\nbrick - " + template.brick.apply(this.currentBrick) + "\n\n next - " + template.brick.apply(this.nextBrick);
  }
};
out$.DebugOutput = DebugOutput = (function(){
  DebugOutput.displayName = 'DebugOutput';
  var prototype = DebugOutput.prototype, constructor = DebugOutput;
  prototype.render = function(state, output){
    return output.innerText = template.normal.apply(state);
  };
  function DebugOutput(){}
  return DebugOutput;
}());
},{}],3:[function(require,module,exports){
var ref$, id, log, raf, FrameDriver, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, raf = ref$.raf;
out$.FrameDriver = FrameDriver = (function(){
  FrameDriver.displayName = 'FrameDriver';
  var prototype = FrameDriver.prototype, constructor = FrameDriver;
  function FrameDriver(onFrame){
    this.onFrame = onFrame;
    this.frame = bind$(this, 'frame', prototype);
    log("FrameDriver::new");
    this.state = {
      zero: 0,
      time: 0,
      frame: 0,
      running: false
    };
  }
  prototype.frame = function(){
    var now, Δt;
    now = Date.now() - this.state.zero;
    Δt = this.state.time - now;
    this.state.time = now;
    this.state.frame = this.state.frame + 1;
    this.onFrame(Δt, this.state.time, this.state.frame);
    if (this.state.running) {
      return raf(this.frame);
    }
  };
  prototype.start = function(){
    if (this.state.running === true) {
      return;
    }
    log("FrameDriver::Start - starting");
    this.state.zero = Date.now();
    this.state.time = 0;
    this.state.running = true;
    return this.frame();
  };
  prototype.stop = function(){
    if (this.state.running === false) {
      return;
    }
    log("FrameDriver::Stop - stopping");
    return this.state.running = false;
  };
  return FrameDriver;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"std":5}],4:[function(require,module,exports){
var ref$, id, log, KEY, ACTION_NAME, eventSummary, InputHandler, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
KEY = {
  RETURN: 13,
  ESCAPE: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};
ACTION_NAME = (ref$ = {}, ref$[KEY.RETURN + ""] = 'confirm', ref$[KEY.ESCAPE + ""] = 'back', ref$[KEY.SPACE + ""] = 'action', ref$[KEY.LEFT + ""] = 'left', ref$[KEY.UP + ""] = 'up', ref$[KEY.RIGHT + ""] = 'right', ref$[KEY.DOWN + ""] = 'down', ref$);
eventSummary = function(eventSaver, keyDirection){
  return function(arg$){
    var which, that;
    which = arg$.which;
    if (that = ACTION_NAME[which]) {
      return eventSaver({
        key: that,
        action: keyDirection
      });
    }
  };
};
out$.InputHandler = InputHandler = (function(){
  InputHandler.displayName = 'InputHandler';
  var prototype = InputHandler.prototype, constructor = InputHandler;
  function InputHandler(){
    this.saveEvent = bind$(this, 'saveEvent', prototype);
    log("InputHandler::new");
    this.state = {
      savedEvents: []
    };
    document.addEventListener('keydown', eventSummary(this.saveEvent, 'down'));
    document.addEventListener('keyup', eventSummary(this.saveEvent, 'up'));
  }
  prototype.saveEvent = function(eventSummary){
    return this.state.savedEvents.push(eventSummary);
  };
  prototype.changesSinceLastFrame = function(){
    var changes;
    changes = this.state.savedEvents;
    this.state.savedEvents = [];
    return changes;
  };
  InputHandler.debugMode = function(){
    return document.addEventListener('keydown', function(arg$){
      var which;
      which = arg$.which;
      return log("InputHandler::debugMode -", which, ACTION_NAME[which] || '[unbound]');
    });
  };
  InputHandler.on = function(code, λ){
    return document.addEventListener('keydown', function(arg$){
      var which;
      which = arg$.which;
      if (which === code) {
        return λ();
      }
    });
  };
  return InputHandler;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"std":5}],5:[function(require,module,exports){
var id, log, flip, delay, floor, random, rand, randomFrom, raf, that, out$ = typeof exports != 'undefined' && exports || this;
out$.id = id = function(it){
  return it;
};
out$.log = log = function(){
  console.log.apply(console, arguments);
  return arguments[0];
};
out$.flip = flip = function(λ){
  return function(a, b){
    return λ(b, a);
  };
};
out$.delay = delay = flip(setTimeout);
out$.floor = floor = Math.floor;
out$.random = random = Math.random;
out$.rand = rand = function(min, max){
  return min + floor(random() * (max - min));
};
out$.randomFrom = randomFrom = function(list){
  return list[rand(0, list.length - 1)];
};
out$.raf = raf = (that = window.requestAnimationFrame) != null
  ? that
  : (that = window.webkitRequestAnimationFrame) != null
    ? that
    : (that = window.mozRequestAnimationFrame) != null
      ? that
      : function(λ){
        return setTimeout(λ, 1000 / 60);
      };
},{}],6:[function(require,module,exports){
var Blitter, out$ = typeof exports != 'undefined' && exports || this;
out$.Blitter = Blitter = (function(){
  Blitter.displayName = 'Blitter';
  var prototype = Blitter.prototype, constructor = Blitter;
  function Blitter(x, y){
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = x;
    this.height = this.canvas.height = y;
    this.ctx = this.canvas.getContext('2d');
  }
  prototype.blitTo = function(dest, x, y, alpha){
    x == null && (x = 0);
    y == null && (y = 0);
    alpha == null && (alpha = 1);
    dest.globalAlpha = alpha;
    return dest.drawImage(this.canvas, x, y);
  };
  prototype.clear = function(){
    return this.ctx.clearRect(0, 0, this.width, this.height);
  };
  return Blitter;
}());
},{}],7:[function(require,module,exports){
var GameCore, out$ = typeof exports != 'undefined' && exports || this;
out$.GameCore = GameCore = (function(){
  GameCore.displayName = 'GameCore';
  var prototype = GameCore.prototype, constructor = GameCore;
  function GameCore(){}
  return GameCore;
}());
},{}],8:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, GameCore, Renderer, Timer, brickColors, brickShapes, newBrick, canMove, copyBrickToArena, topIsReached, isComplete, clearArena, spawnNewBrick, dropArenaRow, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
randomFrom = require('std').randomFrom;
GameCore = require('./game-core').GameCore;
Renderer = require('./renderer').Renderer;
Timer = require('../timer').Timer;
brickColors = ['black', '#e00', '#f70', '#ee0', '#0f4', '#2ed', '#35f', '#b0b'];
brickShapes = [[[1, 1], [1, 1]], [[2, 2, 0], [0, 2, 2]], [[0, 3, 3], [3, 3, 0]], [[4, 0], [4, 0], [4, 4]], [[0, 5], [0, 5], [5, 5]], [[0, 6, 0], [6, 6, 6]], [[7], [7], [7], [7]]];
newBrick = function(ix){
  ix == null && (ix = rand(0, brickShapes.length));
  return {
    shape: brickShapes[ix],
    color: brickColors[ix],
    pos: [4, 0]
  };
};
canMove = function(arg$, arena, move){
  var pos, shape, ref$, i$, len$, y, v, j$, ref1$, len1$, x, u, arenaCell;
  pos = arg$.pos, shape = arg$.shape;
  if (!(0 <= pos[0] + move[0]) || !(pos[0] + move[0] + shape[0].length <= arena[0].length)) {
    return false;
  }
  if (!(0 <= (ref$ = pos[1] + move[1]) && ref$ < arena.length) || !(pos[1] + move[1] + shape.length <= arena.length)) {
    return false;
  }
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      arenaCell = arena[v + move[1]][u + move[0]];
      if (arenaCell && shape[y][x]) {
        return false;
      }
    }
  }
  return true;
  function fn$(){
    var i$, to$, results$ = [];
    for (i$ = pos[1], to$ = pos[1] + shape.length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
  function fn1$(){
    var i$, to$, results$ = [];
    for (i$ = pos[0], to$ = pos[0] + shape[0].length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
};
copyBrickToArena = function(arg$, arena){
  var pos, shape, i$, ref$, len$, y, v, lresult$, j$, ref1$, len1$, x, u, results$ = [];
  pos = arg$.pos, shape = arg$.shape;
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      lresult$.push(arena[v][u] = shape[y][x]);
    }
    results$.push(lresult$);
  }
  return results$;
  function fn$(){
    var i$, to$, results$ = [];
    for (i$ = pos[1], to$ = pos[1] + shape.length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
  function fn1$(){
    var i$, to$, results$ = [];
    for (i$ = pos[0], to$ = pos[0] + shape[0].length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
};
topIsReached = function(arena){
  var i$, ref$, len$, cell;
  for (i$ = 0, len$ = (ref$ = arena[0]).length; i$ < len$; ++i$) {
    cell = ref$[i$];
    if (cell) {
      return true;
    }
  }
  return false;
};
isComplete = function(row){
  var i$, len$, cell;
  for (i$ = 0, len$ = row.length; i$ < len$; ++i$) {
    cell = row[i$];
    if (!cell) {
      return false;
    }
  }
  return true;
};
clearArena = function(arena){
  var i$, len$, row, lresult$, j$, len1$, cell, results$ = [];
  for (i$ = 0, len$ = arena.length; i$ < len$; ++i$) {
    row = arena[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
      cell = row[j$];
      lresult$.push(cell = 0);
    }
    results$.push(lresult$);
  }
  return results$;
};
spawnNewBrick = function(gameState){
  gameState.currentBrick = gameState.nextBrick;
  gameState.currentBrick.pos = [4, 0];
  return gameState.nextBrick = newBrick();
};
dropArenaRow = function(arena, rowIx){
  arena.splice(rowIx, 1);
  return arena.unshift(repeatArray$([0], arena[0].length));
};
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(){
    log("TetrisGame::new");
    this.renderer = new Renderer;
    this.timer = new Timer;
  }
  prototype.showFailScreen = function(gameState, Δt){
    return console.debug('FAILED');
  };
  prototype.beginNewGame = function(gameState){
    gameState.arena = clearArena(gameState.arena);
    gameState.arena[gameState.arena.length - 3] = [1, 2, 3, 0, 0, 0, 5, 4, 3, 2];
    gameState.arena[gameState.arena.length - 2] = [1, 2, 3, 4, 5, 0, 5, 4, 3, 2];
    gameState.arena[gameState.arena.length - 1] = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2];
    gameState.nextBrick = newBrick();
    gameState.currentBrick = newBrick();
    gameState.currentBrick.pos = [4, 0];
    gameState.score = 0;
    return gameState.metagameState = 'game';
  };
  prototype.advanceGame = function(gameState){
    var currentBrick, arena, inputState, ref$, key, action, i$, ix, row, len$, rowIx;
    currentBrick = gameState.currentBrick, arena = gameState.arena, inputState = gameState.inputState;
    while (gameState.inputState.length) {
      ref$ = gameState.inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'left':
          if (canMove(currentBrick, arena, [-1, 0])) {
            currentBrick.pos[0] -= 1;
          }
          break;
        case 'right':
          if (canMove(currentBrick, arena, [1, 0])) {
            currentBrick.pos[0] += 1;
          }
        }
      }
    }
    if (canMove(currentBrick, arena, [0, 1])) {
      currentBrick.pos[1] += 1;
    } else {
      copyBrickToArena(currentBrick, arena);
      spawnNewBrick(gameState);
    }
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      rowIx = ref$[i$];
      dropArenaRow(gameState.arena, rowIx);
    }
    if (topIsReached(arena)) {
      gameState.metagameState = 'failure';
    }
    return gameState;
    function fn$(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = arena).length; i$ < len$; ++i$) {
        ix = i$;
        row = ref$[i$];
        if (isComplete(row)) {
          results$.push(ix);
        }
      }
      return results$;
    }
  };
  prototype.runFrame = function(gameState, Δt){
    var metagameState;
    metagameState = gameState.metagameState;
    switch (metagameState) {
    case 'failure':
      this.showFailScreen.apply(this, arguments);
      break;
    case 'game':
      this.advanceGame.apply(this, arguments);
      break;
    case 'no-game':
      this.beginNewGame.apply(this, arguments);
      break;
    default:
      console.debug('Unknown metagame-state:', metagameState);
    }
    return gameState;
  };
  prototype.render = function(gameState, output){
    var metagameState;
    metagameState = gameState.metagameState;
    switch (metagameState) {
    case 'no-game':
      return this.renderer.renderStartMenu(gameState, output);
    case 'pause':
      return this.renderer.renderPauseMenu(gameState, output);
    case 'game':
      return this.renderer.renderGame(gameState, output);
    case 'win':
      return this.renderer.renderWinScreen(gameState, output);
    }
  };
  return TetrisGame;
}());
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
},{"../timer":12,"./game-core":7,"./renderer":9,"std":5}],9:[function(require,module,exports){
var ref$, id, log, ArenaView, BrickView, Renderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
ArenaView = require('./views/arena').ArenaView;
BrickView = require('./views/brick').BrickView;
out$.Renderer = Renderer = (function(){
  Renderer.displayName = 'Renderer';
  var prototype = Renderer.prototype, constructor = Renderer;
  function Renderer(tileSize){
    tileSize == null && (tileSize = 20);
    this.arena = new ArenaView(10 * tileSize + 1, 18 * tileSize + 1);
    this.brick = new BrickView(4 * tileSize, 4 * tileSize);
  }
  prototype.renderStartMenu = function(){};
  prototype.renderGame = function(gameState, outputContext){
    var brick, z;
    brick = gameState.currentBrick, z = gameState.tileSize;
    outputContext.clearRect(0, 0, gameState.tileWidth * z, gameState.tileHeight * z);
    this.arena.render(gameState).blitTo(outputContext, 0, 0, 0.7);
    return this.brick.render(gameState).blitTo(outputContext, brick.pos[0] * z, brick.pos[1] * z);
  };
  return Renderer;
}());
},{"./views/arena":10,"./views/brick":11,"std":5}],10:[function(require,module,exports){
var ref$, id, log, Blitter, tileColors, ArenaView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = require('../blitter').Blitter;
tileColors = ['black', '#e00', '#f70', '#ee0', '#0f4', '#2ed', '#35f', '#b0b'];
out$.ArenaView = ArenaView = (function(superclass){
  var prototype = extend$((import$(ArenaView, superclass).displayName = 'ArenaView', ArenaView), superclass).prototype, constructor = ArenaView;
  function ArenaView(){
    ArenaView.superclass.apply(this, arguments);
  }
  prototype.drawTiles = function(arena, size){
    var i$, len$, y, row, lresult$, j$, len1$, x, tile, results$ = [];
    for (i$ = 0, len$ = arena.length; i$ < len$; ++i$) {
      y = i$;
      row = arena[i$];
      lresult$ = [];
      log(row);
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        tile = row[j$];
        if (tile) {
          this.ctx.fillStyle = tileColors[tile];
          lresult$.push(this.ctx.fillRect(1 + x * size, 1 + y * size, size - 1, size - 1));
        }
      }
      results$.push(lresult$);
    }
    return results$;
  };
  prototype.drawGrid = function(w, h, size){
    var i$, x, y;
    this.ctx.strokeStyle = '#333';
    this.ctx.beginPath();
    for (i$ = 0; i$ <= w; ++i$) {
      x = i$;
      this.ctx.moveTo(x * size + 0.5, 0);
      this.ctx.lineTo(x * size + 0.5, h * size + 0.5);
    }
    for (i$ = 0; i$ <= h; ++i$) {
      y = i$;
      this.ctx.moveTo(0, y * size + 0.5);
      this.ctx.lineTo(w * size + 0.5, y * size + 0.5);
    }
    return this.ctx.stroke();
  };
  prototype.render = function(arg$){
    var arena, tileWidth, tileHeight, tileSize;
    arena = arg$.arena, tileWidth = arg$.tileWidth, tileHeight = arg$.tileHeight, tileSize = arg$.tileSize;
    this.clear();
    this.drawGrid(tileWidth, tileHeight, tileSize);
    this.drawTiles(arena, tileSize);
    return this;
  };
  return ArenaView;
}(Blitter));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../blitter":6,"std":5}],11:[function(require,module,exports){
var ref$, id, log, Blitter, tileColors, BrickView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = require('../blitter').Blitter;
tileColors = ['black', '#e00', '#f70', '#ee0', '#0f4', '#2ed', '#35f', '#b0b'];
out$.BrickView = BrickView = (function(superclass){
  var prototype = extend$((import$(BrickView, superclass).displayName = 'BrickView', BrickView), superclass).prototype, constructor = BrickView;
  function BrickView(){
    BrickView.superclass.apply(this, arguments);
  }
  prototype.render = function(gameState){
    var brick, tileSize, i$, ref$, len$, y, row, j$, len1$, x, cell;
    brick = gameState.currentBrick, tileSize = gameState.tileSize;
    this.clear();
    for (i$ = 0, len$ = (ref$ = brick.shape).length; i$ < len$; ++i$) {
      y = i$;
      row = ref$[i$];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          this.ctx.fillStyle = tileColors[cell];
          this.ctx.fillRect(x * tileSize + 1, y * tileSize + 1, tileSize - 1, tileSize - 1);
        }
      }
    }
    return this;
  };
  return BrickView;
}(Blitter));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../blitter":6,"std":5}],12:[function(require,module,exports){
var ref$, id, log, allTimers, Timer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
allTimers = [];
out$.Timer = Timer = (function(){
  Timer.displayName = 'Timer';
  var prototype = Timer.prototype, constructor = Timer;
  function Timer(targetTime, begin){
    this.targetTime = targetTime;
    begin == null && (begin = false);
    this.currentTime = 0;
    this.state = begin ? 'active' : 'expired';
    this.active = begin;
    this.expired = !begin;
    allTimers.push(this);
  }
  prototype.setExpired = function(){
    this.state = 'expired';
    this.active = false;
    return this.expired = true;
  };
  prototype.setActive = function(){
    this.state = 'active';
    this.active = true;
    return this.expired = false;
  };
  prototype.update = function(Δt){
    if (this.active) {
      this.currentTime += Δt;
      if (this.currentTime >= this.targetTime) {
        return this.setExpired();
      }
    }
  };
  prototype.reset = function(time){
    time == null && (time = this.targetTime);
    this.currentTime = 0;
    this.targetTime = time;
    return this.setActive();
  };
  prototype.destroy = function(){
    return allTimers.aplice(allTimers.indexOf(this), 1);
  };
  Timer.updateAll = function(Δt){
    return allTimers.map(function(it){
      return it.update(Δt);
    });
  };
  return Timer;
}());
},{"std":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZ2FtZS1jb3JlLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvcmVuZGVyZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3ZpZXdzL2FyZW5hLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS92aWV3cy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGltZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlZiQsIGxvZywgZGVsYXksIEZyYW1lRHJpdmVyLCBJbnB1dEhhbmRsZXIsIFRldHJpc0dhbWUsIGlucHV0SGFuZGxlciwgdGV0cmlzR2FtZSwgdGlsZVNpemUsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgY3VycmVudEJyaWNrLCBuZXh0QnJpY2ssIGdhbWVTdGF0ZSwgb3V0cHV0Q2FudmFzLCBvdXRwdXRDb250ZXh0LCBEZWJ1Z091dHB1dCwgZGJvLCBkZWJ1Z091dHB1dCwgZnJhbWVEcml2ZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5GcmFtZURyaXZlciA9IHJlcXVpcmUoJy4vZnJhbWUtZHJpdmVyJykuRnJhbWVEcml2ZXI7XG5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2lucHV0LWhhbmRsZXInKS5JbnB1dEhhbmRsZXI7XG5UZXRyaXNHYW1lID0gcmVxdWlyZSgnLi90ZXRyaXMtZ2FtZScpLlRldHJpc0dhbWU7XG5pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xudGV0cmlzR2FtZSA9IG5ldyBUZXRyaXNHYW1lO1xudGlsZVNpemUgPSAyMDtcbnRpbGVXaWR0aCA9IDEwO1xudGlsZUhlaWdodCA9IDE4O1xuY3VycmVudEJyaWNrID0gW1sxLCAwXSwgWzEsIDBdLCBbMSwgMV1dO1xubmV4dEJyaWNrID0gW1sxLCAxXSwgWzEsIDFdXTtcbmdhbWVTdGF0ZSA9IHtcbiAgbWV0YWdhbWVTdGF0ZTogJ25vLWdhbWUnLFxuICBzY29yZTogMCxcbiAgbmV4dEJyaWNrOiB7XG4gICAgc2hhcGU6IG5leHRCcmlja1xuICB9LFxuICBjdXJyZW50QnJpY2s6IHtcbiAgICBzaGFwZTogY3VycmVudEJyaWNrLFxuICAgIHBvczogWzQsIDBdXG4gIH0sXG4gIGlucHV0U3RhdGU6IFtdLFxuICBlbGFwc2VkVGltZTogMCxcbiAgZWxhcHNlZEZyYW1lczogMCxcbiAgdGlsZVNpemU6IHRpbGVTaXplLFxuICB0aWxlV2lkdGg6IHRpbGVXaWR0aCxcbiAgdGlsZUhlaWdodDogdGlsZUhlaWdodCxcbiAgYXJlbmE6IFtyZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzBdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzFdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzJdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzNdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzRdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzVdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzZdLCB0aWxlV2lkdGgpLCByZXBlYXRBcnJheSQoWzddLCB0aWxlV2lkdGgpXVxufTtcbm91dHB1dENhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbm91dHB1dENvbnRleHQgPSBvdXRwdXRDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbm91dHB1dENhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ3aGl0ZVwiO1xub3V0cHV0Q2FudmFzLnN0eWxlLmJvcmRlciA9IFwiM3B4IHNvbGlkXCI7XG5vdXRwdXRDYW52YXMuc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiM0NDQgIzk5OSAjZWVlICM3NzdcIjtcbm91dHB1dENhbnZhcy5zdHlsZS5ib3JkZXJSYWRpdXMgPSBcIjNweFwiO1xub3V0cHV0Q2FudmFzLndpZHRoID0gMSArIDEwICogMjA7XG5vdXRwdXRDYW52YXMuaGVpZ2h0ID0gMSArIDE4ICogMjA7XG5EZWJ1Z091dHB1dCA9IHJlcXVpcmUoJy4vZGVidWctb3V0cHV0JykuRGVidWdPdXRwdXQ7XG5JbnB1dEhhbmRsZXIub24oMTkyLCBmdW5jdGlvbigpe1xuICBpZiAoZnJhbWVEcml2ZXIuc3RhdGUucnVubmluZykge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gIH1cbn0pO1xuZGJvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRibyk7XG5kZWJ1Z091dHB1dCA9IG5ldyBEZWJ1Z091dHB1dChkYm8pO1xuZnJhbWVEcml2ZXIgPSBuZXcgRnJhbWVEcml2ZXIoZnVuY3Rpb24ozpR0LCB0aW1lLCBmcmFtZSl7XG4gIGdhbWVTdGF0ZS5lbGFwc2VkVGltZSA9IHRpbWU7XG4gIGdhbWVTdGF0ZS5lbGFwc2VkRnJhbWVzID0gZnJhbWU7XG4gIGdhbWVTdGF0ZS5pbnB1dFN0YXRlID0gaW5wdXRIYW5kbGVyLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSgpO1xuICBnYW1lU3RhdGUgPSB0ZXRyaXNHYW1lLnJ1bkZyYW1lKGdhbWVTdGF0ZSwgzpR0KTtcbiAgdGV0cmlzR2FtZS5yZW5kZXIoZ2FtZVN0YXRlLCBvdXRwdXRDb250ZXh0KTtcbiAgaWYgKGRlYnVnT3V0cHV0ICE9IG51bGwpIHtcbiAgICBkZWJ1Z091dHB1dC5yZW5kZXIoZ2FtZVN0YXRlLCBkYm8pO1xuICB9XG4gIGlmIChnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZSA9PT0gJ2ZhaWx1cmUnKSB7XG4gICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0b3AoKTtcbiAgfVxufSk7XG5mcmFtZURyaXZlci5zdGFydCgpO1xuZGVsYXkoMTAwMCwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5pbnB1dFN0YXRlLnB1c2goe1xuICAgIGtleTogJ2xlZnQnLFxuICAgIGFjdGlvbjogJ2Rvd24nXG4gIH0pO1xufSk7XG5kZWxheSgxMDAwLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZ2FtZVN0YXRlLmlucHV0U3RhdGUucHVzaCh7XG4gICAga2V5OiAnbGVmdCcsXG4gICAgYWN0aW9uOiAndXAnXG4gIH0pO1xufSk7XG5kZWxheSgzMDAwMCwgYmluZCQoZnJhbWVEcml2ZXIsICdzdG9wJykpO1xuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciB0ZW1wbGF0ZSwgRGVidWdPdXRwdXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG50ZW1wbGF0ZSA9IHtcbiAgY2VsbDogZnVuY3Rpb24oaXQpe1xuICAgIGlmIChpdCkge1xuICAgICAgcmV0dXJuIFwi4paS4paSXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIiAgXCI7XG4gICAgfVxuICB9LFxuICBicmljazogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm1hcCh0ZW1wbGF0ZS5jZWxsKS5qb2luKCcgJyk7XG4gICAgfSkuam9pbihcIlxcbiAgICAgICAgXCIpO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbGVuJCwga2V5U3VtbWFyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGhpcy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBrZXlTdW1tYXJ5ID0gdGhpc1tpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2goa2V5U3VtbWFyeS5rZXkgKyAnLScgKyBrZXlTdW1tYXJ5LmFjdGlvbiArIFwifFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiKG5vIGNoYW5nZSlcIjtcbiAgICB9XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgbWV0YSAtIFwiICsgdGhpcy5tZXRhZ2FtZVN0YXRlICsgXCJcXG4gdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuZnJhbWUgLSBcIiArIHRoaXMuZWxhcHNlZEZyYW1lcyArIFwiXFxuc2NvcmUgLSBcIiArIHRoaXMuc2NvcmUgKyBcIlxcbiBrZXlzIC0gXCIgKyB0ZW1wbGF0ZS5rZXlzLmFwcGx5KHRoaXMuaW5wdXRTdGF0ZSkgKyBcIlxcblxcbmJyaWNrIC0gXCIgKyB0ZW1wbGF0ZS5icmljay5hcHBseSh0aGlzLmN1cnJlbnRCcmljaykgKyBcIlxcblxcbiBuZXh0IC0gXCIgKyB0ZW1wbGF0ZS5icmljay5hcHBseSh0aGlzLm5leHRCcmljayk7XG4gIH1cbn07XG5vdXQkLkRlYnVnT3V0cHV0ID0gRGVidWdPdXRwdXQgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdPdXRwdXQuZGlzcGxheU5hbWUgPSAnRGVidWdPdXRwdXQnO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdPdXRwdXQucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnT3V0cHV0O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oc3RhdGUsIG91dHB1dCl7XG4gICAgcmV0dXJuIG91dHB1dC5pbm5lclRleHQgPSB0ZW1wbGF0ZS5ub3JtYWwuYXBwbHkoc3RhdGUpO1xuICB9O1xuICBmdW5jdGlvbiBEZWJ1Z091dHB1dCgpe31cbiAgcmV0dXJuIERlYnVnT3V0cHV0O1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFmLCBGcmFtZURyaXZlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFmID0gcmVmJC5yYWY7XG5vdXQkLkZyYW1lRHJpdmVyID0gRnJhbWVEcml2ZXIgPSAoZnVuY3Rpb24oKXtcbiAgRnJhbWVEcml2ZXIuZGlzcGxheU5hbWUgPSAnRnJhbWVEcml2ZXInO1xuICB2YXIgcHJvdG90eXBlID0gRnJhbWVEcml2ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lRHJpdmVyO1xuICBmdW5jdGlvbiBGcmFtZURyaXZlcihvbkZyYW1lKXtcbiAgICB0aGlzLm9uRnJhbWUgPSBvbkZyYW1lO1xuICAgIHRoaXMuZnJhbWUgPSBiaW5kJCh0aGlzLCAnZnJhbWUnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpuZXdcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHplcm86IDAsXG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICBydW5uaW5nOiBmYWxzZVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbm93LCDOlHQ7XG4gICAgbm93ID0gRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuemVybztcbiAgICDOlHQgPSB0aGlzLnN0YXRlLnRpbWUgLSBub3c7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gbm93O1xuICAgIHRoaXMuc3RhdGUuZnJhbWUgPSB0aGlzLnN0YXRlLmZyYW1lICsgMTtcbiAgICB0aGlzLm9uRnJhbWUozpR0LCB0aGlzLnN0YXRlLnRpbWUsIHRoaXMuc3RhdGUuZnJhbWUpO1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICAgIHJldHVybiByYWYodGhpcy5mcmFtZSk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS56ZXJvID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUucnVubmluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdG9wIC0gc3RvcHBpbmdcIik7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucnVubmluZyA9IGZhbHNlO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEtFWSwgQUNUSU9OX05BTUUsIGV2ZW50U3VtbWFyeSwgSW5wdXRIYW5kbGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuS0VZID0ge1xuICBSRVRVUk46IDEzLFxuICBFU0NBUEU6IDI3LFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDBcbn07XG5BQ1RJT05fTkFNRSA9IChyZWYkID0ge30sIHJlZiRbS0VZLlJFVFVSTiArIFwiXCJdID0gJ2NvbmZpcm0nLCByZWYkW0tFWS5FU0NBUEUgKyBcIlwiXSA9ICdiYWNrJywgcmVmJFtLRVkuU1BBQ0UgKyBcIlwiXSA9ICdhY3Rpb24nLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAndXAnLCByZWYkW0tFWS5SSUdIVCArIFwiXCJdID0gJ3JpZ2h0JywgcmVmJFtLRVkuRE9XTiArIFwiXCJdID0gJ2Rvd24nLCByZWYkKTtcbmV2ZW50U3VtbWFyeSA9IGZ1bmN0aW9uKGV2ZW50U2F2ZXIsIGtleURpcmVjdGlvbil7XG4gIHJldHVybiBmdW5jdGlvbihhcmckKXtcbiAgICB2YXIgd2hpY2gsIHRoYXQ7XG4gICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgIGlmICh0aGF0ID0gQUNUSU9OX05BTUVbd2hpY2hdKSB7XG4gICAgICByZXR1cm4gZXZlbnRTYXZlcih7XG4gICAgICAgIGtleTogdGhhdCxcbiAgICAgICAgYWN0aW9uOiBrZXlEaXJlY3Rpb25cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5vdXQkLklucHV0SGFuZGxlciA9IElucHV0SGFuZGxlciA9IChmdW5jdGlvbigpe1xuICBJbnB1dEhhbmRsZXIuZGlzcGxheU5hbWUgPSAnSW5wdXRIYW5kbGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IElucHV0SGFuZGxlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gSW5wdXRIYW5kbGVyO1xuICBmdW5jdGlvbiBJbnB1dEhhbmRsZXIoKXtcbiAgICB0aGlzLnNhdmVFdmVudCA9IGJpbmQkKHRoaXMsICdzYXZlRXZlbnQnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIklucHV0SGFuZGxlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzYXZlZEV2ZW50czogW11cbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudFN1bW1hcnkodGhpcy5zYXZlRXZlbnQsICdkb3duJykpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZlbnRTdW1tYXJ5KHRoaXMuc2F2ZUV2ZW50LCAndXAnKSk7XG4gIH1cbiAgcHJvdG90eXBlLnNhdmVFdmVudCA9IGZ1bmN0aW9uKGV2ZW50U3VtbWFyeSl7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2F2ZWRFdmVudHMucHVzaChldmVudFN1bW1hcnkpO1xuICB9O1xuICBwcm90b3R5cGUuY2hhbmdlc1NpbmNlTGFzdEZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY2hhbmdlcztcbiAgICBjaGFuZ2VzID0gdGhpcy5zdGF0ZS5zYXZlZEV2ZW50cztcbiAgICB0aGlzLnN0YXRlLnNhdmVkRXZlbnRzID0gW107XG4gICAgcmV0dXJuIGNoYW5nZXM7XG4gIH07XG4gIElucHV0SGFuZGxlci5kZWJ1Z01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICByZXR1cm4gbG9nKFwiSW5wdXRIYW5kbGVyOjpkZWJ1Z01vZGUgLVwiLCB3aGljaCwgQUNUSU9OX05BTUVbd2hpY2hdIHx8ICdbdW5ib3VuZF0nKTtcbiAgICB9KTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLm9uID0gZnVuY3Rpb24oY29kZSwgzrspe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICBpZiAod2hpY2ggPT09IGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIM67KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBJbnB1dEhhbmRsZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIGlkLCBsb2csIGZsaXAsIGRlbGF5LCBmbG9vciwgcmFuZG9tLCByYW5kLCByYW5kb21Gcm9tLCByYWYsIHRoYXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gTWF0aC5yYW5kb207XG5vdXQkLnJhbmQgPSByYW5kID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgZmxvb3IocmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XG59O1xub3V0JC5yYW5kb21Gcm9tID0gcmFuZG9tRnJvbSA9IGZ1bmN0aW9uKGxpc3Qpe1xuICByZXR1cm4gbGlzdFtyYW5kKDAsIGxpc3QubGVuZ3RoIC0gMSldO1xufTtcbm91dCQucmFmID0gcmFmID0gKHRoYXQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gID8gdGhhdFxuICA6ICh0aGF0ID0gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgID8gdGhhdFxuICAgIDogKHRoYXQgPSB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogZnVuY3Rpb24ozrspe1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dCjOuywgMTAwMCAvIDYwKTtcbiAgICAgIH07IiwidmFyIEJsaXR0ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLkJsaXR0ZXIgPSBCbGl0dGVyID0gKGZ1bmN0aW9uKCl7XG4gIEJsaXR0ZXIuZGlzcGxheU5hbWUgPSAnQmxpdHRlcic7XG4gIHZhciBwcm90b3R5cGUgPSBCbGl0dGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCbGl0dGVyO1xuICBmdW5jdGlvbiBCbGl0dGVyKHgsIHkpe1xuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0geDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHk7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICB9XG4gIHByb3RvdHlwZS5ibGl0VG8gPSBmdW5jdGlvbihkZXN0LCB4LCB5LCBhbHBoYSl7XG4gICAgeCA9PSBudWxsICYmICh4ID0gMCk7XG4gICAgeSA9PSBudWxsICYmICh5ID0gMCk7XG4gICAgYWxwaGEgPT0gbnVsbCAmJiAoYWxwaGEgPSAxKTtcbiAgICBkZXN0Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgcmV0dXJuIGRlc3QuZHJhd0ltYWdlKHRoaXMuY2FudmFzLCB4LCB5KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgfTtcbiAgcmV0dXJuIEJsaXR0ZXI7XG59KCkpOyIsInZhciBHYW1lQ29yZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuR2FtZUNvcmUgPSBHYW1lQ29yZSA9IChmdW5jdGlvbigpe1xuICBHYW1lQ29yZS5kaXNwbGF5TmFtZSA9ICdHYW1lQ29yZSc7XG4gIHZhciBwcm90b3R5cGUgPSBHYW1lQ29yZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR2FtZUNvcmU7XG4gIGZ1bmN0aW9uIEdhbWVDb3JlKCl7fVxuICByZXR1cm4gR2FtZUNvcmU7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCByYW5kb21Gcm9tLCBHYW1lQ29yZSwgUmVuZGVyZXIsIFRpbWVyLCBicmlja0NvbG9ycywgYnJpY2tTaGFwZXMsIG5ld0JyaWNrLCBjYW5Nb3ZlLCBjb3B5QnJpY2tUb0FyZW5hLCB0b3BJc1JlYWNoZWQsIGlzQ29tcGxldGUsIGNsZWFyQXJlbmEsIHNwYXduTmV3QnJpY2ssIGRyb3BBcmVuYVJvdywgVGV0cmlzR2FtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcbnJhbmRvbUZyb20gPSByZXF1aXJlKCdzdGQnKS5yYW5kb21Gcm9tO1xuR2FtZUNvcmUgPSByZXF1aXJlKCcuL2dhbWUtY29yZScpLkdhbWVDb3JlO1xuUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJykuUmVuZGVyZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4uL3RpbWVyJykuVGltZXI7XG5icmlja0NvbG9ycyA9IFsnYmxhY2snLCAnI2UwMCcsICcjZjcwJywgJyNlZTAnLCAnIzBmNCcsICcjMmVkJywgJyMzNWYnLCAnI2IwYiddO1xuYnJpY2tTaGFwZXMgPSBbW1sxLCAxXSwgWzEsIDFdXSwgW1syLCAyLCAwXSwgWzAsIDIsIDJdXSwgW1swLCAzLCAzXSwgWzMsIDMsIDBdXSwgW1s0LCAwXSwgWzQsIDBdLCBbNCwgNF1dLCBbWzAsIDVdLCBbMCwgNV0sIFs1LCA1XV0sIFtbMCwgNiwgMF0sIFs2LCA2LCA2XV0sIFtbN10sIFs3XSwgWzddLCBbN11dXTtcbm5ld0JyaWNrID0gZnVuY3Rpb24oaXgpe1xuICBpeCA9PSBudWxsICYmIChpeCA9IHJhbmQoMCwgYnJpY2tTaGFwZXMubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgc2hhcGU6IGJyaWNrU2hhcGVzW2l4XSxcbiAgICBjb2xvcjogYnJpY2tDb2xvcnNbaXhdLFxuICAgIHBvczogWzQsIDBdXG4gIH07XG59O1xuY2FuTW92ZSA9IGZ1bmN0aW9uKGFyZyQsIGFyZW5hLCBtb3ZlKXtcbiAgdmFyIHBvcywgc2hhcGUsIHJlZiQsIGkkLCBsZW4kLCB5LCB2LCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1LCBhcmVuYUNlbGw7XG4gIHBvcyA9IGFyZyQucG9zLCBzaGFwZSA9IGFyZyQuc2hhcGU7XG4gIGlmICghKDAgPD0gcG9zWzBdICsgbW92ZVswXSkgfHwgIShwb3NbMF0gKyBtb3ZlWzBdICsgc2hhcGVbMF0ubGVuZ3RoIDw9IGFyZW5hWzBdLmxlbmd0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCEoMCA8PSAocmVmJCA9IHBvc1sxXSArIG1vdmVbMV0pICYmIHJlZiQgPCBhcmVuYS5sZW5ndGgpIHx8ICEocG9zWzFdICsgbW92ZVsxXSArIHNoYXBlLmxlbmd0aCA8PSBhcmVuYS5sZW5ndGgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGFyZW5hQ2VsbCA9IGFyZW5hW3YgKyBtb3ZlWzFdXVt1ICsgbW92ZVswXV07XG4gICAgICBpZiAoYXJlbmFDZWxsICYmIHNoYXBlW3ldW3hdKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5jb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJlbmEpe1xuICB2YXIgcG9zLCBzaGFwZSwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGxyZXN1bHQkLCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1LCByZXN1bHRzJCA9IFtdO1xuICBwb3MgPSBhcmckLnBvcywgc2hhcGUgPSBhcmckLnNoYXBlO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2goYXJlbmFbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbnRvcElzUmVhY2hlZCA9IGZ1bmN0aW9uKGFyZW5hKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmFbMF0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgY2VsbCA9IHJlZiRbaSRdO1xuICAgIGlmIChjZWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbmlzQ29tcGxldGUgPSBmdW5jdGlvbihyb3cpe1xuICB2YXIgaSQsIGxlbiQsIGNlbGw7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgY2VsbCA9IHJvd1tpJF07XG4gICAgaWYgKCFjZWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbmNsZWFyQXJlbmEgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IGFyZW5hLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgcm93ID0gYXJlbmFbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICBscmVzdWx0JC5wdXNoKGNlbGwgPSAwKTtcbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbnNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICBnYW1lU3RhdGUuY3VycmVudEJyaWNrID0gZ2FtZVN0YXRlLm5leHRCcmljaztcbiAgZ2FtZVN0YXRlLmN1cnJlbnRCcmljay5wb3MgPSBbNCwgMF07XG4gIHJldHVybiBnYW1lU3RhdGUubmV4dEJyaWNrID0gbmV3QnJpY2soKTtcbn07XG5kcm9wQXJlbmFSb3cgPSBmdW5jdGlvbihhcmVuYSwgcm93SXgpe1xuICBhcmVuYS5zcGxpY2Uocm93SXgsIDEpO1xuICByZXR1cm4gYXJlbmEudW5zaGlmdChyZXBlYXRBcnJheSQoWzBdLCBhcmVuYVswXS5sZW5ndGgpKTtcbn07XG5vdXQkLlRldHJpc0dhbWUgPSBUZXRyaXNHYW1lID0gKGZ1bmN0aW9uKCl7XG4gIFRldHJpc0dhbWUuZGlzcGxheU5hbWUgPSAnVGV0cmlzR2FtZSc7XG4gIHZhciBwcm90b3R5cGUgPSBUZXRyaXNHYW1lLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUZXRyaXNHYW1lO1xuICBmdW5jdGlvbiBUZXRyaXNHYW1lKCl7XG4gICAgbG9nKFwiVGV0cmlzR2FtZTo6bmV3XCIpO1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXI7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcjtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0ZhaWxTY3JlZW4gPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgcmV0dXJuIGNvbnNvbGUuZGVidWcoJ0ZBSUxFRCcpO1xuICB9O1xuICBwcm90b3R5cGUuYmVnaW5OZXdHYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICBnYW1lU3RhdGUuYXJlbmEgPSBjbGVhckFyZW5hKGdhbWVTdGF0ZS5hcmVuYSk7XG4gICAgZ2FtZVN0YXRlLmFyZW5hW2dhbWVTdGF0ZS5hcmVuYS5sZW5ndGggLSAzXSA9IFsxLCAyLCAzLCAwLCAwLCAwLCA1LCA0LCAzLCAyXTtcbiAgICBnYW1lU3RhdGUuYXJlbmFbZ2FtZVN0YXRlLmFyZW5hLmxlbmd0aCAtIDJdID0gWzEsIDIsIDMsIDQsIDUsIDAsIDUsIDQsIDMsIDJdO1xuICAgIGdhbWVTdGF0ZS5hcmVuYVtnYW1lU3RhdGUuYXJlbmEubGVuZ3RoIC0gMV0gPSBbMSwgMiwgMywgNCwgNSwgNiwgNSwgNCwgMywgMl07XG4gICAgZ2FtZVN0YXRlLm5leHRCcmljayA9IG5ld0JyaWNrKCk7XG4gICAgZ2FtZVN0YXRlLmN1cnJlbnRCcmljayA9IG5ld0JyaWNrKCk7XG4gICAgZ2FtZVN0YXRlLmN1cnJlbnRCcmljay5wb3MgPSBbNCwgMF07XG4gICAgZ2FtZVN0YXRlLnNjb3JlID0gMDtcbiAgICByZXR1cm4gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gIH07XG4gIHByb3RvdHlwZS5hZHZhbmNlR2FtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgdmFyIGN1cnJlbnRCcmljaywgYXJlbmEsIGlucHV0U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCBpJCwgaXgsIHJvdywgbGVuJCwgcm93SXg7XG4gICAgY3VycmVudEJyaWNrID0gZ2FtZVN0YXRlLmN1cnJlbnRCcmljaywgYXJlbmEgPSBnYW1lU3RhdGUuYXJlbmEsIGlucHV0U3RhdGUgPSBnYW1lU3RhdGUuaW5wdXRTdGF0ZTtcbiAgICB3aGlsZSAoZ2FtZVN0YXRlLmlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gZ2FtZVN0YXRlLmlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgIGlmIChjYW5Nb3ZlKGN1cnJlbnRCcmljaywgYXJlbmEsIFstMSwgMF0pKSB7XG4gICAgICAgICAgICBjdXJyZW50QnJpY2sucG9zWzBdIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKGNhbk1vdmUoY3VycmVudEJyaWNrLCBhcmVuYSwgWzEsIDBdKSkge1xuICAgICAgICAgICAgY3VycmVudEJyaWNrLnBvc1swXSArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2FuTW92ZShjdXJyZW50QnJpY2ssIGFyZW5hLCBbMCwgMV0pKSB7XG4gICAgICBjdXJyZW50QnJpY2sucG9zWzFdICs9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlCcmlja1RvQXJlbmEoY3VycmVudEJyaWNrLCBhcmVuYSk7XG4gICAgICBzcGF3bk5ld0JyaWNrKGdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93SXggPSByZWYkW2kkXTtcbiAgICAgIGRyb3BBcmVuYVJvdyhnYW1lU3RhdGUuYXJlbmEsIHJvd0l4KTtcbiAgICB9XG4gICAgaWYgKHRvcElzUmVhY2hlZChhcmVuYSkpIHtcbiAgICAgIGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlID0gJ2ZhaWx1cmUnO1xuICAgIH1cbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICAgIGZ1bmN0aW9uIGZuJCgpe1xuICAgICAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBpeCA9IGkkO1xuICAgICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgICAgaWYgKGlzQ29tcGxldGUocm93KSkge1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goaXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucnVuRnJhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgdmFyIG1ldGFnYW1lU3RhdGU7XG4gICAgbWV0YWdhbWVTdGF0ZSA9IGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIHN3aXRjaCAobWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ2ZhaWx1cmUnOlxuICAgICAgdGhpcy5zaG93RmFpbFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICB0aGlzLmFkdmFuY2VHYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIHRoaXMuYmVnaW5OZXdHYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5kZWJ1ZygnVW5rbm93biBtZXRhZ2FtZS1zdGF0ZTonLCBtZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGdhbWVTdGF0ZTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSwgb3V0cHV0KXtcbiAgICB2YXIgbWV0YWdhbWVTdGF0ZTtcbiAgICBtZXRhZ2FtZVN0YXRlID0gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJTdGFydE1lbnUoZ2FtZVN0YXRlLCBvdXRwdXQpO1xuICAgIGNhc2UgJ3BhdXNlJzpcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnJlbmRlclBhdXNlTWVudShnYW1lU3RhdGUsIG91dHB1dCk7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJHYW1lKGdhbWVTdGF0ZSwgb3V0cHV0KTtcbiAgICBjYXNlICd3aW4nOlxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucmVuZGVyV2luU2NyZWVuKGdhbWVTdGF0ZSwgb3V0cHV0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBUZXRyaXNHYW1lO1xufSgpKTtcbmZ1bmN0aW9uIHJlcGVhdEFycmF5JChhcnIsIG4pe1xuICBmb3IgKHZhciByID0gW107IG4gPiAwOyAobiA+Pj0gMSkgJiYgKGFyciA9IGFyci5jb25jYXQoYXJyKSkpXG4gICAgaWYgKG4gJiAxKSByLnB1c2guYXBwbHkociwgYXJyKTtcbiAgcmV0dXJuIHI7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEFyZW5hVmlldywgQnJpY2tWaWV3LCBSZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkFyZW5hVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXJlbmEnKS5BcmVuYVZpZXc7XG5Ccmlja1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2JyaWNrJykuQnJpY2tWaWV3O1xub3V0JC5SZW5kZXJlciA9IFJlbmRlcmVyID0gKGZ1bmN0aW9uKCl7XG4gIFJlbmRlcmVyLmRpc3BsYXlOYW1lID0gJ1JlbmRlcmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IFJlbmRlcmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBSZW5kZXJlcjtcbiAgZnVuY3Rpb24gUmVuZGVyZXIodGlsZVNpemUpe1xuICAgIHRpbGVTaXplID09IG51bGwgJiYgKHRpbGVTaXplID0gMjApO1xuICAgIHRoaXMuYXJlbmEgPSBuZXcgQXJlbmFWaWV3KDEwICogdGlsZVNpemUgKyAxLCAxOCAqIHRpbGVTaXplICsgMSk7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmlja1ZpZXcoNCAqIHRpbGVTaXplLCA0ICogdGlsZVNpemUpO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXJTdGFydE1lbnUgPSBmdW5jdGlvbigpe307XG4gIHByb3RvdHlwZS5yZW5kZXJHYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCBvdXRwdXRDb250ZXh0KXtcbiAgICB2YXIgYnJpY2ssIHo7XG4gICAgYnJpY2sgPSBnYW1lU3RhdGUuY3VycmVudEJyaWNrLCB6ID0gZ2FtZVN0YXRlLnRpbGVTaXplO1xuICAgIG91dHB1dENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGdhbWVTdGF0ZS50aWxlV2lkdGggKiB6LCBnYW1lU3RhdGUudGlsZUhlaWdodCAqIHopO1xuICAgIHRoaXMuYXJlbmEucmVuZGVyKGdhbWVTdGF0ZSkuYmxpdFRvKG91dHB1dENvbnRleHQsIDAsIDAsIDAuNyk7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2sucmVuZGVyKGdhbWVTdGF0ZSkuYmxpdFRvKG91dHB1dENvbnRleHQsIGJyaWNrLnBvc1swXSAqIHosIGJyaWNrLnBvc1sxXSAqIHopO1xuICB9O1xuICByZXR1cm4gUmVuZGVyZXI7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCB0aWxlQ29sb3JzLCBBcmVuYVZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi4vYmxpdHRlcicpLkJsaXR0ZXI7XG50aWxlQ29sb3JzID0gWydibGFjaycsICcjZTAwJywgJyNmNzAnLCAnI2VlMCcsICcjMGY0JywgJyMyZWQnLCAnIzM1ZicsICcjYjBiJ107XG5vdXQkLkFyZW5hVmlldyA9IEFyZW5hVmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmFWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdBcmVuYVZpZXcnLCBBcmVuYVZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmFWaWV3O1xuICBmdW5jdGlvbiBBcmVuYVZpZXcoKXtcbiAgICBBcmVuYVZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHByb3RvdHlwZS5kcmF3VGlsZXMgPSBmdW5jdGlvbihhcmVuYSwgc2l6ZSl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIHRpbGUsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBhcmVuYS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gYXJlbmFbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGxvZyhyb3cpO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIHRpbGUgPSByb3dbaiRdO1xuICAgICAgICBpZiAodGlsZSkge1xuICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRpbGVDb2xvcnNbdGlsZV07XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmN0eC5maWxsUmVjdCgxICsgeCAqIHNpemUsIDEgKyB5ICogc2l6ZSwgc2l6ZSAtIDEsIHNpemUgLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5kcmF3R3JpZCA9IGZ1bmN0aW9uKHcsIGgsIHNpemUpe1xuICAgIHZhciBpJCwgeCwgeTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjMzMzJztcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gdzsgKytpJCkge1xuICAgICAgeCA9IGkkO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKHggKiBzaXplICsgMC41LCAwKTtcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyh4ICogc2l6ZSArIDAuNSwgaCAqIHNpemUgKyAwLjUpO1xuICAgIH1cbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gaDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKDAsIHkgKiBzaXplICsgMC41KTtcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyh3ICogc2l6ZSArIDAuNSwgeSAqIHNpemUgKyAwLjUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jdHguc3Ryb2tlKCk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihhcmckKXtcbiAgICB2YXIgYXJlbmEsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgdGlsZVNpemU7XG4gICAgYXJlbmEgPSBhcmckLmFyZW5hLCB0aWxlV2lkdGggPSBhcmckLnRpbGVXaWR0aCwgdGlsZUhlaWdodCA9IGFyZyQudGlsZUhlaWdodCwgdGlsZVNpemUgPSBhcmckLnRpbGVTaXplO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmRyYXdHcmlkKHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgdGlsZVNpemUpO1xuICAgIHRoaXMuZHJhd1RpbGVzKGFyZW5hLCB0aWxlU2l6ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHJldHVybiBBcmVuYVZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCB0aWxlQ29sb3JzLCBCcmlja1ZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi4vYmxpdHRlcicpLkJsaXR0ZXI7XG50aWxlQ29sb3JzID0gWydibGFjaycsICcjZTAwJywgJyNmNzAnLCAnI2VlMCcsICcjMGY0JywgJyMyZWQnLCAnIzM1ZicsICcjYjBiJ107XG5vdXQkLkJyaWNrVmlldyA9IEJyaWNrVmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQnJpY2tWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmlja1ZpZXcnLCBCcmlja1ZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQnJpY2tWaWV3O1xuICBmdW5jdGlvbiBCcmlja1ZpZXcoKXtcbiAgICBCcmlja1ZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIHZhciBicmljaywgdGlsZVNpemUsIGkkLCByZWYkLCBsZW4kLCB5LCByb3csIGokLCBsZW4xJCwgeCwgY2VsbDtcbiAgICBicmljayA9IGdhbWVTdGF0ZS5jdXJyZW50QnJpY2ssIHRpbGVTaXplID0gZ2FtZVN0YXRlLnRpbGVTaXplO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYnJpY2suc2hhcGUpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aWxlQ29sb3JzW2NlbGxdO1xuICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHggKiB0aWxlU2l6ZSArIDEsIHkgKiB0aWxlU2l6ZSArIDEsIHRpbGVTaXplIC0gMSwgdGlsZVNpemUgLSAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcmV0dXJuIEJyaWNrVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGFsbFRpbWVycywgVGltZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5hbGxUaW1lcnMgPSBbXTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBwcm90b3R5cGUgPSBUaW1lci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGltZXI7XG4gIGZ1bmN0aW9uIFRpbWVyKHRhcmdldFRpbWUsIGJlZ2luKXtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0YXJnZXRUaW1lO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSBiZWdpbiA/ICdhY3RpdmUnIDogJ2V4cGlyZWQnO1xuICAgIHRoaXMuYWN0aXZlID0gYmVnaW47XG4gICAgdGhpcy5leHBpcmVkID0gIWJlZ2luO1xuICAgIGFsbFRpbWVycy5wdXNoKHRoaXMpO1xuICB9XG4gIHByb3RvdHlwZS5zZXRFeHBpcmVkID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnN0YXRlID0gJ2V4cGlyZWQnO1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuZXhwaXJlZCA9IHRydWU7XG4gIH07XG4gIHByb3RvdHlwZS5zZXRBY3RpdmUgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuc3RhdGUgPSAnYWN0aXZlJztcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZXhwaXJlZCA9IGZhbHNlO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ozpR0KXtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUgKz0gzpR0O1xuICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWUgPj0gdGhpcy50YXJnZXRUaW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEV4cGlyZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRoaXMudGFyZ2V0VGltZSk7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbGxUaW1lcnMuYXBsaWNlKGFsbFRpbWVycy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgfTtcbiAgVGltZXIudXBkYXRlQWxsID0gZnVuY3Rpb24ozpR0KXtcbiAgICByZXR1cm4gYWxsVGltZXJzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudXBkYXRlKM6UdCk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBUaW1lcjtcbn0oKSk7Il19
