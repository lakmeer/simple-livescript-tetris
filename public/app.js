(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, TetrisGame, GameState, Timer, gameState, inputHandler, tetrisGame, outputCanvas, outputContext, DebugOutput, dbo, debugOutput, frameDriver;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
FrameDriver = require('./frame-driver').FrameDriver;
InputHandler = require('./input-handler').InputHandler;
ref$ = require('./tetris-game'), TetrisGame = ref$.TetrisGame, GameState = ref$.GameState;
Timer = require('./timer').Timer;
gameState = new GameState({
  tileSize: 20,
  tileWidth: 10,
  tileHeight: 18
});
inputHandler = new InputHandler;
tetrisGame = new TetrisGame(gameState);
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
  Timer.updateAll(Δt);
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
},{"./debug-output":2,"./frame-driver":3,"./input-handler":4,"./tetris-game":9,"./timer":13,"std":5}],2:[function(require,module,exports){
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
    return " meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\nscore - " + this.score + "\n keys - " + template.keys.apply(this.inputState) + "\n drop - " + (this.forceDownMode ? 'force' : 'auto') + "\n\nbrick - " + template.brick.apply(this.currentBrick) + "\n\n next - " + template.brick.apply(this.nextBrick);
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
    Δt = now - this.state.time;
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
var ref$, id, log, rand, randomFrom, brickShapes, canMove, copyBrickToArena, topIsReached, isComplete, newBrick, spawnNewBrick, dropArenaRow, clearArena, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand, randomFrom = ref$.randomFrom;
brickShapes = [[[1, 1], [1, 1]], [[2, 2, 0], [0, 2, 2]], [[0, 3, 3], [3, 3, 0]], [[4, 0], [4, 0], [4, 4]], [[0, 5], [0, 5], [5, 5]], [[0, 6, 0], [6, 6, 6]], [[7], [7], [7], [7]]];
out$.canMove = canMove = function(arg$, arena, move){
  var pos, shape, ref$, i$, len$, y, v, j$, ref1$, len1$, x, u;
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
      if (arena[v + move[1]][u + move[0]] && shape[y][x]) {
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
out$.copyBrickToArena = copyBrickToArena = function(arg$, arena){
  var pos, shape, i$, ref$, len$, y, v, lresult$, j$, ref1$, len1$, x, u, results$ = [];
  pos = arg$.pos, shape = arg$.shape;
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      if (shape[y][x]) {
        lresult$.push(arena[v][u] = shape[y][x]);
      }
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
out$.topIsReached = topIsReached = function(arena){
  var i$, ref$, len$, cell;
  for (i$ = 0, len$ = (ref$ = arena[0]).length; i$ < len$; ++i$) {
    cell = ref$[i$];
    if (cell) {
      return true;
    }
  }
  return false;
};
out$.isComplete = isComplete = function(row){
  var i$, len$, cell;
  for (i$ = 0, len$ = row.length; i$ < len$; ++i$) {
    cell = row[i$];
    if (!cell) {
      return false;
    }
  }
  return true;
};
out$.newBrick = newBrick = function(ix){
  ix == null && (ix = rand(0, brickShapes.length));
  return {
    shape: brickShapes[ix],
    pos: [4, 0]
  };
};
out$.spawnNewBrick = spawnNewBrick = function(gameState){
  gameState.currentBrick = gameState.nextBrick;
  gameState.currentBrick.pos = [4, 0];
  return gameState.nextBrick = newBrick();
};
out$.dropArenaRow = dropArenaRow = function(arena, rowIx){
  arena.splice(rowIx, 1);
  return arena.unshift(repeatArray$([0], arena[0].length));
};
out$.clearArena = clearArena = function(arena){
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
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
},{"std":5}],8:[function(require,module,exports){
var ref$, id, log, rand, Timer, GameState, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
Timer = require('../timer').Timer;
out$.GameState = GameState = (function(){
  GameState.displayName = 'GameState';
  var defaults, prototype = GameState.prototype, constructor = GameState;
  defaults = {
    metagameState: 'no-game',
    score: 0,
    nextBrick: void 8,
    currentBrick: void 8,
    inputState: [],
    forceDownMode: false,
    elapsedTime: 0,
    elapsedFrames: 0,
    timers: {},
    tileSize: 20,
    tileWidth: 10,
    tileHeight: 18,
    options: {
      dropSpeed: 500,
      forceDropWaitTime: 100
    },
    arena: [[]]
  };
  function GameState(options){
    import$(import$(this, defaults), options);
    this.timers.dropTimer = new Timer(this.options.dropSpeed);
    this.timers.forceDropWaitTimer = new Timer(this.options.forceDropWaitTime);
    this.arena = constructor.newArena(this.tileWidth, this.tileHeight);
  }
  GameState.newArena = function(width, height){
    var i$, row, lresult$, j$, cell, results$ = [];
    for (i$ = 0; i$ < height; ++i$) {
      row = i$;
      lresult$ = [];
      for (j$ = 0; j$ < width; ++j$) {
        cell = j$;
        lresult$.push(0);
      }
      results$.push(lresult$);
    }
    return results$;
  };
  return GameState;
}());
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../timer":13,"std":5}],9:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, GameState, Renderer, Timer, Core, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
randomFrom = require('std').randomFrom;
GameState = require('./game-state').GameState;
Renderer = require('./renderer').Renderer;
Timer = require('../timer').Timer;
Core = require('./game-core');
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(gameState){
    log("TetrisGame::new");
    this.renderer = new Renderer;
  }
  prototype.showFailScreen = function(gameState, Δt){
    return console.debug('FAILED');
  };
  prototype.beginNewGame = function(gameState){
    (function(){
      Core.clearArena(this.arena);
      this.nextBrick = Core.newBrick();
      this.currentBrick = Core.newBrick();
      this.currentBrick.pos = [4, 0];
      this.score = 0;
      this.metagameState = 'game';
      this.timers.dropTimer.reset();
    }.call(gameState));
    return log(gameState.arena);
  };
  prototype.advanceGame = function(gs){
    var currentBrick, arena, inputState, ref$, key, action, i$, ix, row, len$, rowIx;
    currentBrick = gs.currentBrick, arena = gs.arena, inputState = gs.inputState;
    while (inputState.length) {
      ref$ = inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'left':
          if (Core.canMove(currentBrick, arena, [-1, 0])) {
            currentBrick.pos[0] -= 1;
          }
          break;
        case 'right':
          if (Core.canMove(currentBrick, arena, [1, 0])) {
            currentBrick.pos[0] += 1;
          }
          break;
        case 'down':
          gs.forceDownMode = true;
        }
      } else if (action === 'up') {
        switch (key) {
        case 'down':
          gs.forceDownMode = false;
        }
      }
    }
    if (gs.forceDownMode && gs.timers.forceDropWaitTimer.expired) {
      if (Core.canMove(currentBrick, arena, [0, 1])) {
        currentBrick.pos[1] += 1;
      } else {
        Core.copyBrickToArena(currentBrick, arena);
        gs.timers.forceDropWaitTimer.reset();
        gs.timers.dropTimer.timeToExpiry = gs.timers.forceDropWaitTimer.targetTime;
      }
    }
    if (gs.timers.dropTimer.expired) {
      gs.timers.dropTimer.resetWithRemainder();
      if (Core.canMove(currentBrick, arena, [0, 1])) {
        currentBrick.pos[1] += 1;
      } else {
        Core.copyBrickToArena(currentBrick, arena);
        Core.spawnNewBrick(gs);
      }
      for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
        rowIx = ref$[i$];
        Core.dropArenaRow(gs.arena, rowIx);
      }
      if (Core.topIsReached(arena)) {
        return gs.metagameState = 'failure';
      }
    }
    function fn$(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = arena).length; i$ < len$; ++i$) {
        ix = i$;
        row = ref$[i$];
        if (Core.isComplete(row)) {
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
module.exports = {
  TetrisGame: TetrisGame,
  GameState: GameState
};
},{"../timer":13,"./game-core":7,"./game-state":8,"./renderer":10,"std":5}],10:[function(require,module,exports){
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
},{"./views/arena":11,"./views/brick":12,"std":5}],11:[function(require,module,exports){
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
},{"../blitter":6,"std":5}],12:[function(require,module,exports){
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
},{"../blitter":6,"std":5}],13:[function(require,module,exports){
var ref$, id, log, floor, asciiProgressBar, Timer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
asciiProgressBar = curry$(function(len, val, max){
  var valueChars, emptyChars;
  val = val > max ? max : val;
  valueChars = floor(len * val / max);
  emptyChars = len - valueChars;
  return repeatString$("▒", valueChars) + repeatString$("-", emptyChars);
});
out$.Timer = Timer = (function(){
  Timer.displayName = 'Timer';
  var allTimers, progbar, ref$, TIMER_ACTIVE, TIMER_EXPIRED, prototype = Timer.prototype, constructor = Timer;
  allTimers = [];
  progbar = asciiProgressBar(21);
  ref$ = [0, 1], TIMER_ACTIVE = ref$[0], TIMER_EXPIRED = ref$[1];
  function Timer(targetTime, begin){
    this.targetTime = targetTime != null ? targetTime : 1000;
    begin == null && (begin = false);
    this.currentTime = 0;
    this.state = begin ? TIMER_ACTIVE : TIMER_EXPIRED;
    this.active = begin;
    this.expired = !begin;
    allTimers.push(this);
  }
  Object.defineProperty(prototype, 'active', {
    get: function(){
      return this.state === TIMER_ACTIVE;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'expired', {
    get: function(){
      return this.state === TIMER_EXPIRED;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'timeToExpiry', {
    get: function(){
      return this.targetTime - this.currentTime;
    },
    set: function(expTime){
      this.currentTime = this.targetTime - expTime;
    },
    configurable: true,
    enumerable: true
  });
  prototype.update = function(Δt){
    if (this.active) {
      this.currentTime += Δt;
      if (this.currentTime >= this.targetTime) {
        return this.state = TIMER_EXPIRED;
      }
    }
  };
  prototype.reset = function(time){
    time == null && (time = this.targetTime);
    this.currentTime = 0;
    this.targetTime = time;
    return this.state = TIMER_ACTIVE;
  };
  prototype.resetWithRemainder = function(time){
    time == null && (time = this.targetTime);
    this.currentTime = this.currentTime - time;
    this.targetTime = time;
    return this.state = TIMER_ACTIVE;
  };
  prototype.destroy = function(){
    return allTimers.splice(allTimers.indexOf(this), 1);
  };
  prototype.toString = function(){
    return "TIMER: " + this.targetTime + "\nSTATE: " + this.state + " (" + this.active + "|" + this.expired + ")\n" + progbar(this.currentTime, this.targetTime);
  };
  Timer.updateAll = function(Δt){
    return allTimers.map(function(it){
      return it.update(Δt);
    });
  };
  return Timer;
}());
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
},{"std":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZ2FtZS1jb3JlLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS9nYW1lLXN0YXRlLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvcmVuZGVyZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3ZpZXdzL2FyZW5hLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS92aWV3cy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGltZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIGRlbGF5LCBGcmFtZURyaXZlciwgSW5wdXRIYW5kbGVyLCBUZXRyaXNHYW1lLCBHYW1lU3RhdGUsIFRpbWVyLCBnYW1lU3RhdGUsIGlucHV0SGFuZGxlciwgdGV0cmlzR2FtZSwgb3V0cHV0Q2FudmFzLCBvdXRwdXRDb250ZXh0LCBEZWJ1Z091dHB1dCwgZGJvLCBkZWJ1Z091dHB1dCwgZnJhbWVEcml2ZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5GcmFtZURyaXZlciA9IHJlcXVpcmUoJy4vZnJhbWUtZHJpdmVyJykuRnJhbWVEcml2ZXI7XG5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2lucHV0LWhhbmRsZXInKS5JbnB1dEhhbmRsZXI7XG5yZWYkID0gcmVxdWlyZSgnLi90ZXRyaXMtZ2FtZScpLCBUZXRyaXNHYW1lID0gcmVmJC5UZXRyaXNHYW1lLCBHYW1lU3RhdGUgPSByZWYkLkdhbWVTdGF0ZTtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xuZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZSh7XG4gIHRpbGVTaXplOiAyMCxcbiAgdGlsZVdpZHRoOiAxMCxcbiAgdGlsZUhlaWdodDogMThcbn0pO1xuaW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcjtcbnRldHJpc0dhbWUgPSBuZXcgVGV0cmlzR2FtZShnYW1lU3RhdGUpO1xub3V0cHV0Q2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xub3V0cHV0Q29udGV4dCA9IG91dHB1dENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xub3V0cHV0Q2FudmFzLnN0eWxlLmJhY2tncm91bmQgPSBcIndoaXRlXCI7XG5vdXRwdXRDYW52YXMuc3R5bGUuYm9yZGVyID0gXCIzcHggc29saWRcIjtcbm91dHB1dENhbnZhcy5zdHlsZS5ib3JkZXJDb2xvciA9IFwiIzQ0NCAjOTk5ICNlZWUgIzc3N1wiO1xub3V0cHV0Q2FudmFzLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiM3B4XCI7XG5vdXRwdXRDYW52YXMud2lkdGggPSAxICsgMTAgKiAyMDtcbm91dHB1dENhbnZhcy5oZWlnaHQgPSAxICsgMTggKiAyMDtcbkRlYnVnT3V0cHV0ID0gcmVxdWlyZSgnLi9kZWJ1Zy1vdXRwdXQnKS5EZWJ1Z091dHB1dDtcbklucHV0SGFuZGxlci5vbigxOTIsIGZ1bmN0aW9uKCl7XG4gIGlmIChmcmFtZURyaXZlci5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0b3AoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RhcnQoKTtcbiAgfVxufSk7XG5kYm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGJvKTtcbmRlYnVnT3V0cHV0ID0gbmV3IERlYnVnT3V0cHV0KGRibyk7XG5mcmFtZURyaXZlciA9IG5ldyBGcmFtZURyaXZlcihmdW5jdGlvbijOlHQsIHRpbWUsIGZyYW1lKXtcbiAgZ2FtZVN0YXRlLmVsYXBzZWRUaW1lID0gdGltZTtcbiAgZ2FtZVN0YXRlLmVsYXBzZWRGcmFtZXMgPSBmcmFtZTtcbiAgZ2FtZVN0YXRlLmlucHV0U3RhdGUgPSBpbnB1dEhhbmRsZXIuY2hhbmdlc1NpbmNlTGFzdEZyYW1lKCk7XG4gIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUucnVuRnJhbWUoZ2FtZVN0YXRlLCDOlHQpO1xuICBUaW1lci51cGRhdGVBbGwozpR0KTtcbiAgdGV0cmlzR2FtZS5yZW5kZXIoZ2FtZVN0YXRlLCBvdXRwdXRDb250ZXh0KTtcbiAgaWYgKGRlYnVnT3V0cHV0ICE9IG51bGwpIHtcbiAgICBkZWJ1Z091dHB1dC5yZW5kZXIoZ2FtZVN0YXRlLCBkYm8pO1xuICB9XG4gIGlmIChnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZSA9PT0gJ2ZhaWx1cmUnKSB7XG4gICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0b3AoKTtcbiAgfVxufSk7XG5mcmFtZURyaXZlci5zdGFydCgpO1xuZGVsYXkoMTAwMCwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5pbnB1dFN0YXRlLnB1c2goe1xuICAgIGtleTogJ2xlZnQnLFxuICAgIGFjdGlvbjogJ2Rvd24nXG4gIH0pO1xufSk7XG5kZWxheSgxMDAwLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZ2FtZVN0YXRlLmlucHV0U3RhdGUucHVzaCh7XG4gICAga2V5OiAnbGVmdCcsXG4gICAgYWN0aW9uOiAndXAnXG4gIH0pO1xufSk7IiwidmFyIHRlbXBsYXRlLCBEZWJ1Z091dHB1dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnRlbXBsYXRlID0ge1xuICBjZWxsOiBmdW5jdGlvbihpdCl7XG4gICAgaWYgKGl0KSB7XG4gICAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiICBcIjtcbiAgICB9XG4gIH0sXG4gIGJyaWNrOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQubWFwKHRlbXBsYXRlLmNlbGwpLmpvaW4oJyAnKTtcbiAgICB9KS5qb2luKFwiXFxuICAgICAgICBcIik7XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBrZXlTdW1tYXJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0aGlzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGtleVN1bW1hcnkgPSB0aGlzW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChrZXlTdW1tYXJ5LmtleSArICctJyArIGtleVN1bW1hcnkuYWN0aW9uICsgXCJ8XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIobm8gY2hhbmdlKVwiO1xuICAgIH1cbiAgfSxcbiAgbm9ybWFsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIiBtZXRhIC0gXCIgKyB0aGlzLm1ldGFnYW1lU3RhdGUgKyBcIlxcbiB0aW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRUaW1lICsgXCJcXG5mcmFtZSAtIFwiICsgdGhpcy5lbGFwc2VkRnJhbWVzICsgXCJcXG5zY29yZSAtIFwiICsgdGhpcy5zY29yZSArIFwiXFxuIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKSArIFwiXFxuIGRyb3AgLSBcIiArICh0aGlzLmZvcmNlRG93bk1vZGUgPyAnZm9yY2UnIDogJ2F1dG8nKSArIFwiXFxuXFxuYnJpY2sgLSBcIiArIHRlbXBsYXRlLmJyaWNrLmFwcGx5KHRoaXMuY3VycmVudEJyaWNrKSArIFwiXFxuXFxuIG5leHQgLSBcIiArIHRlbXBsYXRlLmJyaWNrLmFwcGx5KHRoaXMubmV4dEJyaWNrKTtcbiAgfVxufTtcbm91dCQuRGVidWdPdXRwdXQgPSBEZWJ1Z091dHB1dCA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z091dHB1dC5kaXNwbGF5TmFtZSA9ICdEZWJ1Z091dHB1dCc7XG4gIHZhciBwcm90b3R5cGUgPSBEZWJ1Z091dHB1dC5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdPdXRwdXQ7XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSwgb3V0cHV0KXtcbiAgICByZXR1cm4gb3V0cHV0LmlubmVyVGV4dCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gIH07XG4gIGZ1bmN0aW9uIERlYnVnT3V0cHV0KCl7fVxuICByZXR1cm4gRGVidWdPdXRwdXQ7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCByYWYsIEZyYW1lRHJpdmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYWYgPSByZWYkLnJhZjtcbm91dCQuRnJhbWVEcml2ZXIgPSBGcmFtZURyaXZlciA9IChmdW5jdGlvbigpe1xuICBGcmFtZURyaXZlci5kaXNwbGF5TmFtZSA9ICdGcmFtZURyaXZlcic7XG4gIHZhciBwcm90b3R5cGUgPSBGcmFtZURyaXZlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRnJhbWVEcml2ZXI7XG4gIGZ1bmN0aW9uIEZyYW1lRHJpdmVyKG9uRnJhbWUpe1xuICAgIHRoaXMub25GcmFtZSA9IG9uRnJhbWU7XG4gICAgdGhpcy5mcmFtZSA9IGJpbmQkKHRoaXMsICdmcmFtZScsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6Om5ld1wiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgemVybzogMCxcbiAgICAgIHRpbWU6IDAsXG4gICAgICBmcmFtZTogMCxcbiAgICAgIHJ1bm5pbmc6IGZhbHNlXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBub3csIM6UdDtcbiAgICBub3cgPSBEYXRlLm5vdygpIC0gdGhpcy5zdGF0ZS56ZXJvO1xuICAgIM6UdCA9IG5vdyAtIHRoaXMuc3RhdGUudGltZTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSBub3c7XG4gICAgdGhpcy5zdGF0ZS5mcmFtZSA9IHRoaXMuc3RhdGUuZnJhbWUgKyAxO1xuICAgIHRoaXMub25GcmFtZSjOlHQsIHRoaXMuc3RhdGUudGltZSwgdGhpcy5zdGF0ZS5mcmFtZSk7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgcmV0dXJuIHJhZih0aGlzLmZyYW1lKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RhcnQgLSBzdGFydGluZ1wiKTtcbiAgICB0aGlzLnN0YXRlLnplcm8gPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IDA7XG4gICAgdGhpcy5zdGF0ZS5ydW5uaW5nID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5mcmFtZSgpO1xuICB9O1xuICBwcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0b3AgLSBzdG9wcGluZ1wiKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5ydW5uaW5nID0gZmFsc2U7XG4gIH07XG4gIHJldHVybiBGcmFtZURyaXZlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgS0VZLCBBQ1RJT05fTkFNRSwgZXZlbnRTdW1tYXJ5LCBJbnB1dEhhbmRsZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5LRVkgPSB7XG4gIFJFVFVSTjogMTMsXG4gIEVTQ0FQRTogMjcsXG4gIFNQQUNFOiAzMixcbiAgTEVGVDogMzcsXG4gIFVQOiAzOCxcbiAgUklHSFQ6IDM5LFxuICBET1dOOiA0MFxufTtcbkFDVElPTl9OQU1FID0gKHJlZiQgPSB7fSwgcmVmJFtLRVkuUkVUVVJOICsgXCJcIl0gPSAnY29uZmlybScsIHJlZiRbS0VZLkVTQ0FQRSArIFwiXCJdID0gJ2JhY2snLCByZWYkW0tFWS5TUEFDRSArIFwiXCJdID0gJ2FjdGlvbicsIHJlZiRbS0VZLkxFRlQgKyBcIlwiXSA9ICdsZWZ0JywgcmVmJFtLRVkuVVAgKyBcIlwiXSA9ICd1cCcsIHJlZiRbS0VZLlJJR0hUICsgXCJcIl0gPSAncmlnaHQnLCByZWYkW0tFWS5ET1dOICsgXCJcIl0gPSAnZG93bicsIHJlZiQpO1xuZXZlbnRTdW1tYXJ5ID0gZnVuY3Rpb24oZXZlbnRTYXZlciwga2V5RGlyZWN0aW9uKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZyQpe1xuICAgIHZhciB3aGljaCwgdGhhdDtcbiAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgaWYgKHRoYXQgPSBBQ1RJT05fTkFNRVt3aGljaF0pIHtcbiAgICAgIHJldHVybiBldmVudFNhdmVyKHtcbiAgICAgICAga2V5OiB0aGF0LFxuICAgICAgICBhY3Rpb246IGtleURpcmVjdGlvblxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcbm91dCQuSW5wdXRIYW5kbGVyID0gSW5wdXRIYW5kbGVyID0gKGZ1bmN0aW9uKCl7XG4gIElucHV0SGFuZGxlci5kaXNwbGF5TmFtZSA9ICdJbnB1dEhhbmRsZXInO1xuICB2YXIgcHJvdG90eXBlID0gSW5wdXRIYW5kbGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBJbnB1dEhhbmRsZXI7XG4gIGZ1bmN0aW9uIElucHV0SGFuZGxlcigpe1xuICAgIHRoaXMuc2F2ZUV2ZW50ID0gYmluZCQodGhpcywgJ3NhdmVFdmVudCcsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiSW5wdXRIYW5kbGVyOjpuZXdcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNhdmVkRXZlbnRzOiBbXVxuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50U3VtbWFyeSh0aGlzLnNhdmVFdmVudCwgJ2Rvd24nKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldmVudFN1bW1hcnkodGhpcy5zYXZlRXZlbnQsICd1cCcpKTtcbiAgfVxuICBwcm90b3R5cGUuc2F2ZUV2ZW50ID0gZnVuY3Rpb24oZXZlbnRTdW1tYXJ5KXtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zYXZlZEV2ZW50cy5wdXNoKGV2ZW50U3VtbWFyeSk7XG4gIH07XG4gIHByb3RvdHlwZS5jaGFuZ2VzU2luY2VMYXN0RnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBjaGFuZ2VzO1xuICAgIGNoYW5nZXMgPSB0aGlzLnN0YXRlLnNhdmVkRXZlbnRzO1xuICAgIHRoaXMuc3RhdGUuc2F2ZWRFdmVudHMgPSBbXTtcbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIHJldHVybiBsb2coXCJJbnB1dEhhbmRsZXI6OmRlYnVnTW9kZSAtXCIsIHdoaWNoLCBBQ1RJT05fTkFNRVt3aGljaF0gfHwgJ1t1bmJvdW5kXScpO1xuICAgIH0pO1xuICB9O1xuICBJbnB1dEhhbmRsZXIub24gPSBmdW5jdGlvbihjb2RlLCDOuyl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIGlmICh3aGljaCA9PT0gY29kZSkge1xuICAgICAgICByZXR1cm4gzrsoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIElucHV0SGFuZGxlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn0iLCJ2YXIgaWQsIGxvZywgZmxpcCwgZGVsYXksIGZsb29yLCByYW5kb20sIHJhbmQsIHJhbmRvbUZyb20sIHJhZiwgdGhhdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5yYWYgPSByYWYgPSAodGhhdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgPyB0aGF0XG4gIDogKHRoYXQgPSB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgPyB0aGF0XG4gICAgOiAodGhhdCA9IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiBmdW5jdGlvbijOuyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KM67LCAxMDAwIC8gNjApO1xuICAgICAgfTsiLCJ2YXIgQmxpdHRlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuQmxpdHRlciA9IEJsaXR0ZXIgPSAoZnVuY3Rpb24oKXtcbiAgQmxpdHRlci5kaXNwbGF5TmFtZSA9ICdCbGl0dGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEJsaXR0ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJsaXR0ZXI7XG4gIGZ1bmN0aW9uIEJsaXR0ZXIoeCwgeSl7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGggPSB4O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0geTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH1cbiAgcHJvdG90eXBlLmJsaXRUbyA9IGZ1bmN0aW9uKGRlc3QsIHgsIHksIGFscGhhKXtcbiAgICB4ID09IG51bGwgJiYgKHggPSAwKTtcbiAgICB5ID09IG51bGwgJiYgKHkgPSAwKTtcbiAgICBhbHBoYSA9PSBudWxsICYmIChhbHBoYSA9IDEpO1xuICAgIGRlc3QuZ2xvYmFsQWxwaGEgPSBhbHBoYTtcbiAgICByZXR1cm4gZGVzdC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIHgsIHkpO1xuICB9O1xuICBwcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICB9O1xuICByZXR1cm4gQmxpdHRlcjtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIGJyaWNrU2hhcGVzLCBjYW5Nb3ZlLCBjb3B5QnJpY2tUb0FyZW5hLCB0b3BJc1JlYWNoZWQsIGlzQ29tcGxldGUsIG5ld0JyaWNrLCBzcGF3bk5ld0JyaWNrLCBkcm9wQXJlbmFSb3csIGNsZWFyQXJlbmEsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb207XG5icmlja1NoYXBlcyA9IFtbWzEsIDFdLCBbMSwgMV1dLCBbWzIsIDIsIDBdLCBbMCwgMiwgMl1dLCBbWzAsIDMsIDNdLCBbMywgMywgMF1dLCBbWzQsIDBdLCBbNCwgMF0sIFs0LCA0XV0sIFtbMCwgNV0sIFswLCA1XSwgWzUsIDVdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDZdXSwgW1s3XSwgWzddLCBbN10sIFs3XV1dO1xub3V0JC5jYW5Nb3ZlID0gY2FuTW92ZSA9IGZ1bmN0aW9uKGFyZyQsIGFyZW5hLCBtb3ZlKXtcbiAgdmFyIHBvcywgc2hhcGUsIHJlZiQsIGkkLCBsZW4kLCB5LCB2LCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1O1xuICBwb3MgPSBhcmckLnBvcywgc2hhcGUgPSBhcmckLnNoYXBlO1xuICBpZiAoISgwIDw9IHBvc1swXSArIG1vdmVbMF0pIHx8ICEocG9zWzBdICsgbW92ZVswXSArIHNoYXBlWzBdLmxlbmd0aCA8PSBhcmVuYVswXS5sZW5ndGgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghKDAgPD0gKHJlZiQgPSBwb3NbMV0gKyBtb3ZlWzFdKSAmJiByZWYkIDwgYXJlbmEubGVuZ3RoKSB8fCAhKHBvc1sxXSArIG1vdmVbMV0gKyBzaGFwZS5sZW5ndGggPD0gYXJlbmEubGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoYXJlbmFbdiArIG1vdmVbMV1dW3UgKyBtb3ZlWzBdXSAmJiBzaGFwZVt5XVt4XSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC5jb3B5QnJpY2tUb0FyZW5hID0gY29weUJyaWNrVG9BcmVuYSA9IGZ1bmN0aW9uKGFyZyQsIGFyZW5hKXtcbiAgdmFyIHBvcywgc2hhcGUsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0pIHtcbiAgICAgICAgbHJlc3VsdCQucHVzaChhcmVuYVt2XVt1XSA9IHNoYXBlW3ldW3hdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC50b3BJc1JlYWNoZWQgPSB0b3BJc1JlYWNoZWQgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLmlzQ29tcGxldGUgPSBpc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZCgwLCBicmlja1NoYXBlcy5sZW5ndGgpKTtcbiAgcmV0dXJuIHtcbiAgICBzaGFwZTogYnJpY2tTaGFwZXNbaXhdLFxuICAgIHBvczogWzQsIDBdXG4gIH07XG59O1xub3V0JC5zcGF3bk5ld0JyaWNrID0gc3Bhd25OZXdCcmljayA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gIGdhbWVTdGF0ZS5jdXJyZW50QnJpY2sgPSBnYW1lU3RhdGUubmV4dEJyaWNrO1xuICBnYW1lU3RhdGUuY3VycmVudEJyaWNrLnBvcyA9IFs0LCAwXTtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5uZXh0QnJpY2sgPSBuZXdCcmljaygpO1xufTtcbm91dCQuZHJvcEFyZW5hUm93ID0gZHJvcEFyZW5hUm93ID0gZnVuY3Rpb24oYXJlbmEsIHJvd0l4KXtcbiAgYXJlbmEuc3BsaWNlKHJvd0l4LCAxKTtcbiAgcmV0dXJuIGFyZW5hLnVuc2hpZnQocmVwZWF0QXJyYXkkKFswXSwgYXJlbmFbMF0ubGVuZ3RoKSk7XG59O1xub3V0JC5jbGVhckFyZW5hID0gY2xlYXJBcmVuYSA9IGZ1bmN0aW9uKGFyZW5hKXtcbiAgdmFyIGkkLCBsZW4kLCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gYXJlbmEubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICByb3cgPSBhcmVuYVtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2goY2VsbCA9IDApO1xuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgVGltZXIsIEdhbWVTdGF0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcblRpbWVyID0gcmVxdWlyZSgnLi4vdGltZXInKS5UaW1lcjtcbm91dCQuR2FtZVN0YXRlID0gR2FtZVN0YXRlID0gKGZ1bmN0aW9uKCl7XG4gIEdhbWVTdGF0ZS5kaXNwbGF5TmFtZSA9ICdHYW1lU3RhdGUnO1xuICB2YXIgZGVmYXVsdHMsIHByb3RvdHlwZSA9IEdhbWVTdGF0ZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR2FtZVN0YXRlO1xuICBkZWZhdWx0cyA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gICAgc2NvcmU6IDAsXG4gICAgbmV4dEJyaWNrOiB2b2lkIDgsXG4gICAgY3VycmVudEJyaWNrOiB2b2lkIDgsXG4gICAgaW5wdXRTdGF0ZTogW10sXG4gICAgZm9yY2VEb3duTW9kZTogZmFsc2UsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG4gICAgZWxhcHNlZEZyYW1lczogMCxcbiAgICB0aW1lcnM6IHt9LFxuICAgIHRpbGVTaXplOiAyMCxcbiAgICB0aWxlV2lkdGg6IDEwLFxuICAgIHRpbGVIZWlnaHQ6IDE4LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGRyb3BTcGVlZDogNTAwLFxuICAgICAgZm9yY2VEcm9wV2FpdFRpbWU6IDEwMFxuICAgIH0sXG4gICAgYXJlbmE6IFtbXV1cbiAgfTtcbiAgZnVuY3Rpb24gR2FtZVN0YXRlKG9wdGlvbnMpe1xuICAgIGltcG9ydCQoaW1wb3J0JCh0aGlzLCBkZWZhdWx0cyksIG9wdGlvbnMpO1xuICAgIHRoaXMudGltZXJzLmRyb3BUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuZHJvcFNwZWVkKTtcbiAgICB0aGlzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmZvcmNlRHJvcFdhaXRUaW1lKTtcbiAgICB0aGlzLmFyZW5hID0gY29uc3RydWN0b3IubmV3QXJlbmEodGhpcy50aWxlV2lkdGgsIHRoaXMudGlsZUhlaWdodCk7XG4gIH1cbiAgR2FtZVN0YXRlLm5ld0FyZW5hID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCl7XG4gICAgdmFyIGkkLCByb3csIGxyZXN1bHQkLCBqJCwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPCBoZWlnaHQ7ICsraSQpIHtcbiAgICAgIHJvdyA9IGkkO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwOyBqJCA8IHdpZHRoOyArK2okKSB7XG4gICAgICAgIGNlbGwgPSBqJDtcbiAgICAgICAgbHJlc3VsdCQucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBHYW1lU3RhdGU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgcmFuZG9tRnJvbSwgR2FtZVN0YXRlLCBSZW5kZXJlciwgVGltZXIsIENvcmUsIFRldHJpc0dhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5yYW5kb21Gcm9tID0gcmVxdWlyZSgnc3RkJykucmFuZG9tRnJvbTtcbkdhbWVTdGF0ZSA9IHJlcXVpcmUoJy4vZ2FtZS1zdGF0ZScpLkdhbWVTdGF0ZTtcblJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpLlJlbmRlcmVyO1xuVGltZXIgPSByZXF1aXJlKCcuLi90aW1lcicpLlRpbWVyO1xuQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJyk7XG5vdXQkLlRldHJpc0dhbWUgPSBUZXRyaXNHYW1lID0gKGZ1bmN0aW9uKCl7XG4gIFRldHJpc0dhbWUuZGlzcGxheU5hbWUgPSAnVGV0cmlzR2FtZSc7XG4gIHZhciBwcm90b3R5cGUgPSBUZXRyaXNHYW1lLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUZXRyaXNHYW1lO1xuICBmdW5jdGlvbiBUZXRyaXNHYW1lKGdhbWVTdGF0ZSl7XG4gICAgbG9nKFwiVGV0cmlzR2FtZTo6bmV3XCIpO1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXI7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dGYWlsU2NyZWVuID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIHJldHVybiBjb25zb2xlLmRlYnVnKCdGQUlMRUQnKTtcbiAgfTtcbiAgcHJvdG90eXBlLmJlZ2luTmV3R2FtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgKGZ1bmN0aW9uKCl7XG4gICAgICBDb3JlLmNsZWFyQXJlbmEodGhpcy5hcmVuYSk7XG4gICAgICB0aGlzLm5leHRCcmljayA9IENvcmUubmV3QnJpY2soKTtcbiAgICAgIHRoaXMuY3VycmVudEJyaWNrID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5jdXJyZW50QnJpY2sucG9zID0gWzQsIDBdO1xuICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgICB0aGlzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIucmVzZXQoKTtcbiAgICB9LmNhbGwoZ2FtZVN0YXRlKSk7XG4gICAgcmV0dXJuIGxvZyhnYW1lU3RhdGUuYXJlbmEpO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZUdhbWUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGN1cnJlbnRCcmljaywgYXJlbmEsIGlucHV0U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCBpJCwgaXgsIHJvdywgbGVuJCwgcm93SXg7XG4gICAgY3VycmVudEJyaWNrID0gZ3MuY3VycmVudEJyaWNrLCBhcmVuYSA9IGdzLmFyZW5hLCBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZTtcbiAgICB3aGlsZSAoaW5wdXRTdGF0ZS5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dFN0YXRlLnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Nb3ZlKGN1cnJlbnRCcmljaywgYXJlbmEsIFstMSwgMF0pKSB7XG4gICAgICAgICAgICBjdXJyZW50QnJpY2sucG9zWzBdIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShjdXJyZW50QnJpY2ssIGFyZW5hLCBbMSwgMF0pKSB7XG4gICAgICAgICAgICBjdXJyZW50QnJpY2sucG9zWzBdICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChncy5mb3JjZURvd25Nb2RlICYmIGdzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIuZXhwaXJlZCkge1xuICAgICAgaWYgKENvcmUuY2FuTW92ZShjdXJyZW50QnJpY2ssIGFyZW5hLCBbMCwgMV0pKSB7XG4gICAgICAgIGN1cnJlbnRCcmljay5wb3NbMV0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIENvcmUuY29weUJyaWNrVG9BcmVuYShjdXJyZW50QnJpY2ssIGFyZW5hKTtcbiAgICAgICAgZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci5yZXNldCgpO1xuICAgICAgICBncy50aW1lcnMuZHJvcFRpbWVyLnRpbWVUb0V4cGlyeSA9IGdzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIudGFyZ2V0VGltZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdzLnRpbWVycy5kcm9wVGltZXIuZXhwaXJlZCkge1xuICAgICAgZ3MudGltZXJzLmRyb3BUaW1lci5yZXNldFdpdGhSZW1haW5kZXIoKTtcbiAgICAgIGlmIChDb3JlLmNhbk1vdmUoY3VycmVudEJyaWNrLCBhcmVuYSwgWzAsIDFdKSkge1xuICAgICAgICBjdXJyZW50QnJpY2sucG9zWzFdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDb3JlLmNvcHlCcmlja1RvQXJlbmEoY3VycmVudEJyaWNrLCBhcmVuYSk7XG4gICAgICAgIENvcmUuc3Bhd25OZXdCcmljayhncyk7XG4gICAgICB9XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgcm93SXggPSByZWYkW2kkXTtcbiAgICAgICAgQ29yZS5kcm9wQXJlbmFSb3coZ3MuYXJlbmEsIHJvd0l4KTtcbiAgICAgIH1cbiAgICAgIGlmIChDb3JlLnRvcElzUmVhY2hlZChhcmVuYSkpIHtcbiAgICAgICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnZmFpbHVyZSc7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZuJCgpe1xuICAgICAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBpeCA9IGkkO1xuICAgICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgICAgaWYgKENvcmUuaXNDb21wbGV0ZShyb3cpKSB7XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChpeCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5ydW5GcmFtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSwgzpR0KXtcbiAgICB2YXIgbWV0YWdhbWVTdGF0ZTtcbiAgICBtZXRhZ2FtZVN0YXRlID0gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICB0aGlzLnNob3dGYWlsU2NyZWVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHRoaXMuYWR2YW5jZUdhbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgdGhpcy5iZWdpbk5ld0dhbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmRlYnVnKCdVbmtub3duIG1ldGFnYW1lLXN0YXRlOicsIG1ldGFnYW1lU3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCBvdXRwdXQpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnJlbmRlclN0YXJ0TWVudShnYW1lU3RhdGUsIG91dHB1dCk7XG4gICAgY2FzZSAncGF1c2UnOlxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucmVuZGVyUGF1c2VNZW51KGdhbWVTdGF0ZSwgb3V0cHV0KTtcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnJlbmRlckdhbWUoZ2FtZVN0YXRlLCBvdXRwdXQpO1xuICAgIGNhc2UgJ3dpbic6XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJXaW5TY3JlZW4oZ2FtZVN0YXRlLCBvdXRwdXQpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRldHJpc0dhbWU6IFRldHJpc0dhbWUsXG4gIEdhbWVTdGF0ZTogR2FtZVN0YXRlXG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBBcmVuYVZpZXcsIEJyaWNrVmlldywgUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5BcmVuYVZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FyZW5hJykuQXJlbmFWaWV3O1xuQnJpY2tWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9icmljaycpLkJyaWNrVmlldztcbm91dCQuUmVuZGVyZXIgPSBSZW5kZXJlciA9IChmdW5jdGlvbigpe1xuICBSZW5kZXJlci5kaXNwbGF5TmFtZSA9ICdSZW5kZXJlcic7XG4gIHZhciBwcm90b3R5cGUgPSBSZW5kZXJlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIFJlbmRlcmVyKHRpbGVTaXplKXtcbiAgICB0aWxlU2l6ZSA9PSBudWxsICYmICh0aWxlU2l6ZSA9IDIwKTtcbiAgICB0aGlzLmFyZW5hID0gbmV3IEFyZW5hVmlldygxMCAqIHRpbGVTaXplICsgMSwgMTggKiB0aWxlU2l6ZSArIDEpO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2tWaWV3KDQgKiB0aWxlU2l6ZSwgNCAqIHRpbGVTaXplKTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyU3RhcnRNZW51ID0gZnVuY3Rpb24oKXt9O1xuICBwcm90b3R5cGUucmVuZGVyR2FtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSwgb3V0cHV0Q29udGV4dCl7XG4gICAgdmFyIGJyaWNrLCB6O1xuICAgIGJyaWNrID0gZ2FtZVN0YXRlLmN1cnJlbnRCcmljaywgeiA9IGdhbWVTdGF0ZS50aWxlU2l6ZTtcbiAgICBvdXRwdXRDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBnYW1lU3RhdGUudGlsZVdpZHRoICogeiwgZ2FtZVN0YXRlLnRpbGVIZWlnaHQgKiB6KTtcbiAgICB0aGlzLmFyZW5hLnJlbmRlcihnYW1lU3RhdGUpLmJsaXRUbyhvdXRwdXRDb250ZXh0LCAwLCAwLCAwLjcpO1xuICAgIHJldHVybiB0aGlzLmJyaWNrLnJlbmRlcihnYW1lU3RhdGUpLmJsaXRUbyhvdXRwdXRDb250ZXh0LCBicmljay5wb3NbMF0gKiB6LCBicmljay5wb3NbMV0gKiB6KTtcbiAgfTtcbiAgcmV0dXJuIFJlbmRlcmVyO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmxpdHRlciwgdGlsZUNvbG9ycywgQXJlbmFWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4uL2JsaXR0ZXInKS5CbGl0dGVyO1xudGlsZUNvbG9ycyA9IFsnYmxhY2snLCAnI2UwMCcsICcjZjcwJywgJyNlZTAnLCAnIzBmNCcsICcjMmVkJywgJyMzNWYnLCAnI2IwYiddO1xub3V0JC5BcmVuYVZpZXcgPSBBcmVuYVZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEFyZW5hVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFWaWV3JywgQXJlbmFWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEFyZW5hVmlldztcbiAgZnVuY3Rpb24gQXJlbmFWaWV3KCl7XG4gICAgQXJlbmFWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBwcm90b3R5cGUuZHJhd1RpbGVzID0gZnVuY3Rpb24oYXJlbmEsIHNpemUpe1xuICAgIHZhciBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCB0aWxlLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gYXJlbmEubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGFyZW5hW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgIGlmICh0aWxlKSB7XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGlsZUNvbG9yc1t0aWxlXTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuY3R4LmZpbGxSZWN0KDEgKyB4ICogc2l6ZSwgMSArIHkgKiBzaXplLCBzaXplIC0gMSwgc2l6ZSAtIDEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmRyYXdHcmlkID0gZnVuY3Rpb24odywgaCwgc2l6ZSl7XG4gICAgdmFyIGkkLCB4LCB5O1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJyMzMzMnO1xuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSB3OyArK2kkKSB7XG4gICAgICB4ID0gaSQ7XG4gICAgICB0aGlzLmN0eC5tb3ZlVG8oeCAqIHNpemUgKyAwLjUsIDApO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHggKiBzaXplICsgMC41LCBoICogc2l6ZSArIDAuNSk7XG4gICAgfVxuICAgIGZvciAoaSQgPSAwOyBpJCA8PSBoOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgeSAqIHNpemUgKyAwLjUpO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHcgKiBzaXplICsgMC41LCB5ICogc2l6ZSArIDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmN0eC5zdHJva2UoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGFyZyQpe1xuICAgIHZhciBhcmVuYSwgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0LCB0aWxlU2l6ZTtcbiAgICBhcmVuYSA9IGFyZyQuYXJlbmEsIHRpbGVXaWR0aCA9IGFyZyQudGlsZVdpZHRoLCB0aWxlSGVpZ2h0ID0gYXJnJC50aWxlSGVpZ2h0LCB0aWxlU2l6ZSA9IGFyZyQudGlsZVNpemU7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZHJhd0dyaWQodGlsZVdpZHRoLCB0aWxlSGVpZ2h0LCB0aWxlU2l6ZSk7XG4gICAgdGhpcy5kcmF3VGlsZXMoYXJlbmEsIHRpbGVTaXplKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcmV0dXJuIEFyZW5hVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJsaXR0ZXIsIHRpbGVDb2xvcnMsIEJyaWNrVmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuLi9ibGl0dGVyJykuQmxpdHRlcjtcbnRpbGVDb2xvcnMgPSBbJ2JsYWNrJywgJyNlMDAnLCAnI2Y3MCcsICcjZWUwJywgJyMwZjQnLCAnIzJlZCcsICcjMzVmJywgJyNiMGInXTtcbm91dCQuQnJpY2tWaWV3ID0gQnJpY2tWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmlja1ZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0JyaWNrVmlldycsIEJyaWNrVmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmlja1ZpZXc7XG4gIGZ1bmN0aW9uIEJyaWNrVmlldygpe1xuICAgIEJyaWNrVmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgdmFyIGJyaWNrLCB0aWxlU2l6ZSwgaSQsIHJlZiQsIGxlbiQsIHksIHJvdywgaiQsIGxlbjEkLCB4LCBjZWxsO1xuICAgIGJyaWNrID0gZ2FtZVN0YXRlLmN1cnJlbnRCcmljaywgdGlsZVNpemUgPSBnYW1lU3RhdGUudGlsZVNpemU7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBicmljay5zaGFwZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRpbGVDb2xvcnNbY2VsbF07XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoeCAqIHRpbGVTaXplICsgMSwgeSAqIHRpbGVTaXplICsgMSwgdGlsZVNpemUgLSAxLCB0aWxlU2l6ZSAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICByZXR1cm4gQnJpY2tWaWV3O1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSBiZWdpbiA/IFRJTUVSX0FDVElWRSA6IFRJTUVSX0VYUElSRUQ7XG4gICAgdGhpcy5hY3RpdmUgPSBiZWdpbjtcbiAgICB0aGlzLmV4cGlyZWQgPSAhYmVnaW47XG4gICAgYWxsVGltZXJzLnB1c2godGhpcyk7XG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2FjdGl2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfQUNUSVZFO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdleHBpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9FWFBJUkVEO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICd0aW1lVG9FeHBpcnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGV4cFRpbWUpe1xuICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZSAtIGV4cFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lICs9IM6UdDtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMudGFyZ2V0VGltZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldFdpdGhSZW1haW5kZXIgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lIC0gdGltZTtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfQUNUSVZFO1xuICB9O1xuICBwcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5zcGxpY2UoYWxsVGltZXJzLmluZGV4T2YodGhpcyksIDEpO1xuICB9O1xuICBwcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIlRJTUVSOiBcIiArIHRoaXMudGFyZ2V0VGltZSArIFwiXFxuU1RBVEU6IFwiICsgdGhpcy5zdGF0ZSArIFwiIChcIiArIHRoaXMuYWN0aXZlICsgXCJ8XCIgKyB0aGlzLmV4cGlyZWQgKyBcIilcXG5cIiArIHByb2diYXIodGhpcy5jdXJyZW50VGltZSwgdGhpcy50YXJnZXRUaW1lKTtcbiAgfTtcbiAgVGltZXIudXBkYXRlQWxsID0gZnVuY3Rpb24ozpR0KXtcbiAgICByZXR1cm4gYWxsVGltZXJzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudXBkYXRlKM6UdCk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBUaW1lcjtcbn0oKSk7XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
