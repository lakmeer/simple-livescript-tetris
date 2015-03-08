(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, TetrisGame, GameState, Timer, gameState, renderOpts, inputHandler, tetrisGame, outputCanvas, DebugOutput, dbo, debugOutput, frameDriver;
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
renderOpts = {
  z: 20
};
inputHandler = new InputHandler;
tetrisGame = new TetrisGame(gameState, renderOpts);
outputCanvas = document.getElementById('canvas');
outputCanvas.width = 1 + 17 * renderOpts.z;
outputCanvas.height = 1 + 20 * renderOpts.z;
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
  var outputBlitter;
  gameState.elapsedTime = time;
  gameState.elapsedFrames = frame;
  gameState.inputState = inputHandler.changesSinceLastFrame();
  gameState = tetrisGame.runFrame(gameState, Δt);
  Timer.updateAll(Δt);
  outputBlitter = tetrisGame.render(gameState, renderOpts);
  if (debugOutput != null) {
    debugOutput.render(gameState, dbo);
  }
  return outputBlitter.blitToCanvas(outputCanvas);
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
},{"./debug-output":2,"./frame-driver":3,"./input-handler":4,"./tetris-game":10,"./timer":16,"std":5}],2:[function(require,module,exports){
var ref$, id, log, template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
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
    return "  NEXT :\n" + template.brick.apply(this.brick.next) + "\n\n score - " + this.score + "\n lines - " + this.lines + "\n\n  meta - " + this.metagameState + "\n  time - " + this.elapsedTime + "\n frame - " + this.elapsedFrames + "\n  keys - " + template.keys.apply(this.inputState) + "\n  drop - " + (this.forceDownMode ? 'force' : 'auto') + "\n\n";
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
},{"std":5}],3:[function(require,module,exports){
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
var id, log, flip, delay, floor, random, rand, randomFrom, addV2, raf, that, out$ = typeof exports != 'undefined' && exports || this;
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
out$.addV2 = addV2 = function(a, b){
  return [a[0] + b[0], a[1] + b[1]];
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
var ref$, id, log, Blitter, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Blitter = Blitter = (function(){
  Blitter.displayName = 'Blitter';
  var prototype = Blitter.prototype, constructor = Blitter;
  function Blitter(opts, x, y){
    this.opts = opts;
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = x;
    this.height = this.canvas.height = y;
    this.ctx = this.canvas.getContext('2d');
  }
  prototype.blitTo = function(dest, x, y, alpha){
    x == null && (x = 0);
    y == null && (y = 0);
    alpha == null && (alpha = 1);
    dest.ctx.globalAlpha = alpha;
    dest.ctx.drawImage(this.canvas, x, y);
    return dest.ctx.globalAlpha = 1;
  };
  prototype.blitToCanvas = function(destCanvas){
    var ctx;
    ctx = destCanvas.getContext('2d');
    ctx.clearRect(0, 0, destCanvas.width, destCanvas.height);
    return ctx.drawImage(this.canvas, 0, 0, destCanvas.width, destCanvas.height);
  };
  prototype.clear = function(){
    return this.ctx.clearRect(0, 0, this.width, this.height);
  };
  return Blitter;
}());
},{"std":5}],7:[function(require,module,exports){
var square, zig, zag, left, right, tee, tetris, all, out$ = typeof exports != 'undefined' && exports || this;
out$.square = square = [[[0, 0, 0], [0, 1, 1], [0, 1, 1], [0, 0, 0]]];
out$.zig = zig = [[[0, 0, 0], [2, 2, 0], [0, 2, 2], [0, 0, 0]], [[0, 2, 0], [2, 2, 0], [2, 0, 0], [0, 0, 0]]];
out$.zag = zag = [[[0, 0, 0], [0, 3, 3], [3, 3, 0], [0, 0, 0]], [[3, 0, 0], [3, 3, 0], [0, 3, 0], [0, 0, 0]]];
out$.left = left = [[[0, 0, 0], [4, 4, 4], [4, 0, 0], [0, 0, 0]], [[4, 4, 0], [0, 4, 0], [0, 4, 0], [0, 0, 0]], [[0, 0, 4], [4, 4, 4], [0, 0, 0], [0, 0, 0]], [[0, 4, 0], [0, 4, 0], [0, 4, 4], [0, 0, 0]]];
out$.right = right = [[[0, 0, 0], [5, 5, 5], [0, 0, 5], [0, 0, 0]], [[0, 5, 0], [0, 5, 0], [5, 5, 0], [0, 0, 0]], [[5, 0, 0], [5, 5, 5], [0, 0, 0], [0, 0, 0]], [[0, 5, 5], [0, 5, 0], [0, 5, 0], [0, 0, 0]]];
out$.tee = tee = [[[0, 0, 0], [6, 6, 6], [0, 6, 0], [0, 0, 0]], [[0, 6, 0], [6, 6, 0], [0, 6, 0], [0, 0, 0]], [[0, 6, 0], [6, 6, 6], [0, 0, 0], [0, 0, 0]], [[0, 6, 0], [0, 6, 6], [0, 6, 0], [0, 0, 0]]];
out$.tetris = tetris = [[[0, 0, 0, 0], [0, 0, 0, 0], [7, 7, 7, 7], [0, 0, 0, 0]], [[0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0]]];
out$.all = all = [
  {
    type: 'square',
    shapes: square
  }, {
    type: 'zig',
    shapes: zig
  }, {
    type: 'zag',
    shapes: zag
  }, {
    type: 'left',
    shapes: left
  }, {
    type: 'right',
    shapes: right
  }, {
    type: 'tee',
    shapes: tee
  }, {
    type: 'tetris',
    shapes: tetris
  }
];
},{}],8:[function(require,module,exports){
var ref$, id, log, addV2, rand, randomFrom, BrickShapes, canDrop, canMove, canRotate, collides, copyBrickToArena, topIsReached, isComplete, newBrick, spawnNewBrick, dropArenaRow, clearArena, getShapeOfRotation, normaliseRotation, rotateBrick, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, rand = ref$.rand, randomFrom = ref$.randomFrom;
BrickShapes = require('./data/brick-shapes');
out$.canDrop = canDrop = function(brick, arena){
  return canMove(brick, [0, 1], arena);
};
out$.canMove = canMove = function(brick, move, arena){
  var newPos;
  newPos = addV2(brick.pos, move);
  return collides(newPos, brick.shape, arena);
};
out$.canRotate = canRotate = function(brick, dir, arena){
  var newShape;
  newShape = getShapeOfRotation(brick, brick.rotation + dir);
  return collides(brick.pos, newShape, arena);
};
out$.collides = collides = function(pos, shape, arg$){
  var cells, width, height, i$, ref$, len$, y, v, j$, ref1$, len1$, x, u;
  cells = arg$.cells, width = arg$.width, height = arg$.height;
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      if (shape[y][x] > 0) {
        if (v >= 0) {
          if (v >= height || u >= width || u < 0 || cells[v][u]) {
            return false;
          }
        }
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
out$.copyBrickToArena = copyBrickToArena = function(arg$, arg1$){
  var pos, shape, cells, i$, ref$, len$, y, v, lresult$, j$, ref1$, len1$, x, u, results$ = [];
  pos = arg$.pos, shape = arg$.shape;
  cells = arg1$.cells;
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      if (shape[y][x] && v >= 0) {
        lresult$.push(cells[v][u] = shape[y][x]);
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
out$.topIsReached = topIsReached = function(arg$){
  var cells, i$, ref$, len$, cell;
  cells = arg$.cells;
  for (i$ = 0, len$ = (ref$ = cells[0]).length; i$ < len$; ++i$) {
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
  ix == null && (ix = rand(0, BrickShapes.all.length));
  return {
    rotation: 0,
    shape: BrickShapes.all[ix].shapes[0],
    type: BrickShapes.all[ix].type,
    pos: [0, 0]
  };
};
out$.spawnNewBrick = spawnNewBrick = function(gs){
  gs.brick.current = gs.brick.next;
  gs.brick.current.pos = [4, -1];
  return gs.brick.next = newBrick();
};
out$.dropArenaRow = dropArenaRow = function(arg$, rowIx){
  var cells;
  cells = arg$.cells;
  cells.splice(rowIx, 1);
  return cells.unshift(repeatArray$([0], cells[0].length));
};
out$.clearArena = clearArena = function(arena){
  var i$, ref$, len$, row, lresult$, j$, len1$, i, cell, results$ = [];
  for (i$ = 0, len$ = (ref$ = arena.cells).length; i$ < len$; ++i$) {
    row = ref$[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
      i = j$;
      cell = row[j$];
      lresult$.push(row[i] = 0);
    }
    results$.push(lresult$);
  }
  return results$;
};
out$.getShapeOfRotation = getShapeOfRotation = function(brick, rotation){
  rotation = normaliseRotation(brick, rotation);
  return BrickShapes[brick.type][rotation];
};
out$.normaliseRotation = normaliseRotation = function(arg$, rotation){
  var type;
  type = arg$.type;
  return rotation % BrickShapes[type].length;
};
out$.rotateBrick = rotateBrick = function(brick, dir){
  var rotation, type;
  rotation = brick.rotation, type = brick.type;
  brick.rotation = normaliseRotation(brick, brick.rotation + dir);
  return brick.shape = getShapeOfRotation(brick, brick.rotation);
};
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
},{"./data/brick-shapes":7,"std":5}],9:[function(require,module,exports){
var ref$, id, log, rand, Timer, GameState, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
Timer = require('../timer').Timer;
out$.GameState = GameState = (function(){
  GameState.displayName = 'GameState';
  var defaults, prototype = GameState.prototype, constructor = GameState;
  defaults = {
    metagameState: 'no-game',
    score: 0,
    lines: 0,
    brick: {
      next: void 8,
      current: void 8
    },
    inputState: [],
    forceDownMode: false,
    elapsedTime: 0,
    elapsedFrames: 0,
    timers: {},
    options: {
      tileWidth: 10,
      tileHeight: 18,
      dropSpeed: 500,
      forceDropWaitTime: 100
    },
    arena: {
      cells: [[]],
      width: 0,
      height: 0
    }
  };
  function GameState(options){
    import$(this, defaults);
    import$(this.options, options);
    this.timers.dropTimer = new Timer(this.options.dropSpeed);
    this.timers.forceDropWaitTimer = new Timer(this.options.forceDropWaitTime);
    this.arena = constructor.newArena(this.options.tileWidth, this.options.tileHeight);
  }
  GameState.newArena = function(width, height){
    var row, cell;
    return {
      cells: (function(){
        var i$, to$, lresult$, j$, to1$, results$ = [];
        for (i$ = 0, to$ = height; i$ < to$; ++i$) {
          row = i$;
          lresult$ = [];
          for (j$ = 0, to1$ = width; j$ < to1$; ++j$) {
            cell = j$;
            lresult$.push(0);
          }
          results$.push(lresult$);
        }
        return results$;
      }()),
      width: width,
      height: height
    };
  };
  return GameState;
}());
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../timer":16,"std":5}],10:[function(require,module,exports){
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
  function TetrisGame(gameState, rendererOptions){
    log("TetrisGame::new");
    this.renderer = new Renderer(rendererOptions);
  }
  prototype.showFailScreen = function(gameState, Δt){
    console.debug('FAILED');
    return this.beginNewGame(gameState);
  };
  prototype.beginNewGame = function(gameState){
    (function(){
      Core.clearArena(this.arena);
      this.brick.next = Core.newBrick();
      this.brick.next.pos = [3, -1];
      this.brick.current = Core.newBrick();
      this.brick.current.pos = [3, -1];
      this.score = 0;
      this.metagameState = 'game';
      this.timers.dropTimer.reset();
    }.call(gameState));
    return gameState;
  };
  prototype.advanceGame = function(gs){
    var brick, arena, inputState, ref$, key, action, rowsDropped, res$, i$, ix, row, len$, rowIx;
    brick = gs.brick, arena = gs.arena, inputState = gs.inputState;
    while (inputState.length) {
      ref$ = inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'left':
          if (Core.canMove(brick.current, [-1, 0], arena)) {
            brick.current.pos[0] -= 1;
          }
          break;
        case 'right':
          if (Core.canMove(brick.current, [1, 0], arena)) {
            brick.current.pos[0] += 1;
          }
          break;
        case 'down':
          gs.forceDownMode = true;
          break;
        case 'action':
          if (Core.canRotate(brick.current, 1, arena)) {
            Core.rotateBrick(brick.current, 1);
          }
        }
      } else if (action === 'up') {
        switch (key) {
        case 'down':
          gs.forceDownMode = false;
        }
      }
    }
    if (gs.forceDownMode && gs.timers.forceDropWaitTimer.expired) {
      if (Core.canDrop(brick.current, arena)) {
        brick.current.pos[1] += 1;
      } else {
        Core.copyBrickToArena(brick.current, arena);
        gs.forceDownMode = false;
        gs.timers.forceDropWaitTimer.reset();
        gs.timers.dropTimer.timeToExpiry = gs.timers.forceDropWaitTimer.targetTime;
      }
    }
    if (gs.timers.dropTimer.expired) {
      gs.timers.dropTimer.resetWithRemainder();
      if (Core.canDrop(brick.current, arena)) {
        brick.current.pos[1] += 1;
      } else {
        Core.copyBrickToArena(brick.current, arena);
        Core.spawnNewBrick(gs);
      }
      res$ = [];
      for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
        rowIx = ref$[i$];
        res$.push(Core.dropArenaRow(gs.arena, rowIx));
      }
      rowsDropped = res$;
      gs.lines += rowsDropped.length;
      if (Core.topIsReached(arena)) {
        return gs.metagameState = 'failure';
      }
    }
    function fn$(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = arena.cells).length; i$ < len$; ++i$) {
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
  prototype.render = function(gameState){
    var metagameState;
    metagameState = gameState.metagameState;
    switch (metagameState) {
    case 'no-game':
      this.renderer.renderStartMenu(gameState);
      break;
    case 'pause':
      this.renderer.renderPauseMenu(gameState);
      break;
    case 'game':
      this.renderer.renderGame(gameState);
      break;
    case 'win':
      this.renderer.renderWinScreen(gameState);
      break;
    default:
      this.renderer.renderBlank();
    }
    return this.renderer;
  };
  return TetrisGame;
}());
module.exports = {
  TetrisGame: TetrisGame,
  GameState: GameState
};
},{"../timer":16,"./game-core":8,"./game-state":9,"./renderer":11,"std":5}],11:[function(require,module,exports){
var ref$, id, log, Blitter, Palette, ArenaView, BrickView, NextBrickView, Renderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = require('./blitter').Blitter;
Palette = require('./views/palette.ls').Palette;
ArenaView = require('./views/arena').ArenaView;
BrickView = require('./views/brick').BrickView;
NextBrickView = require('./views/next-brick').NextBrickView;
out$.Renderer = Renderer = (function(superclass){
  var prototype = extend$((import$(Renderer, superclass).displayName = 'Renderer', Renderer), superclass).prototype, constructor = Renderer;
  function Renderer(opts){
    var z;
    this.opts = opts;
    this.z = z = this.opts.z;
    Renderer.superclass.call(this, this.opts, 17 * z, 20 * z);
    this.arena = new ArenaView(this.opts, 10 * z + 2, 18 * z + 2);
    this.brick = new BrickView(this.opts, 4 * z, 4 * z);
    this.next = new NextBrickView(this.opts, 4 * z, 4 * z);
  }
  prototype.renderStartMenu = function(){
    return log('render-start-menu');
  };
  prototype.renderBlank = function(){
    return this.clear();
  };
  prototype.renderGame = function(gs){
    this.brick.render(gs.brick.current, this.opts);
    this.next.render(gs.brick.next, this.opts);
    this.arena.render(gs.arena, this.opts);
    return this.collapseAll(gs);
  };
  prototype.collapseAll = function(gs){
    var pos;
    pos = gs.brick.current.pos;
    this.ctx.fillStyle = Palette.neutral[3];
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.brick.blitTo(this.arena, pos[0] * this.z, pos[1] * this.z);
    this.arena.blitTo(this, this.opts.z, this.opts.z);
    return this.next.blitTo(this, (2 + gs.arena.width) * this.z, 1 * this.z);
  };
  return Renderer;
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
},{"./blitter":6,"./views/arena":12,"./views/brick":13,"./views/next-brick":14,"./views/palette.ls":15,"std":5}],12:[function(require,module,exports){
var ref$, id, log, Palette, Blitter, ArenaView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Palette = require('./palette.ls').Palette;
Blitter = require('../blitter').Blitter;
out$.ArenaView = ArenaView = (function(superclass){
  var prototype = extend$((import$(ArenaView, superclass).displayName = 'ArenaView', ArenaView), superclass).prototype, constructor = ArenaView;
  function ArenaView(){
    ArenaView.superclass.apply(this, arguments);
    this.grid = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args), t;
      return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(Blitter, arguments, function(){});
    this.cells = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args), t;
      return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(Blitter, arguments, function(){});
  }
  prototype.drawCells = function(cells, size){
    var i$, len$, y, row, lresult$, j$, len1$, x, tile, results$ = [];
    this.cells.clear();
    for (i$ = 0, len$ = cells.length; i$ < len$; ++i$) {
      y = i$;
      row = cells[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        tile = row[j$];
        if (tile) {
          this.cells.ctx.fillStyle = Palette.tileColors[tile];
          lresult$.push(this.cells.ctx.fillRect(1 + x * size, 1 + y * size, size - 1, size - 1));
        }
      }
      results$.push(lresult$);
    }
    return results$;
  };
  prototype.drawGrid = function(w, h, size){
    var i$, x, y;
    this.grid.clear();
    this.grid.ctx.strokeStyle = 'black';
    this.grid.ctx.beginPath();
    for (i$ = 0; i$ <= w; ++i$) {
      x = i$;
      this.grid.ctx.moveTo(x * size + 0.5, 0);
      this.grid.ctx.lineTo(x * size + 0.5, h * size + 0.5);
    }
    for (i$ = 0; i$ <= h; ++i$) {
      y = i$;
      this.grid.ctx.moveTo(0, y * size + 0.5);
      this.grid.ctx.lineTo(w * size + 0.5, y * size + 0.5);
    }
    return this.grid.ctx.stroke();
  };
  prototype.render = function(arg$, arg1$){
    var cells, width, height, z;
    cells = arg$.cells, width = arg$.width, height = arg$.height;
    z = arg1$.z;
    this.clear();
    this.ctx.fillStyle = Palette.neutral[3];
    this.ctx.fillRect(0, 0, width * z, height * z);
    this.ctx.strokeStyle = Palette.neutral[2];
    this.ctx.strokeRect(0.5, 0.5, width * z + 1, height * z + 1);
    this.drawCells(cells, z);
    this.grid.blitTo(this);
    return this.cells.blitTo(this, 0, 0, 0.9);
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
},{"../blitter":6,"./palette.ls":15,"std":5}],13:[function(require,module,exports){
var ref$, id, log, tileColors, Blitter, BrickView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
tileColors = require('./palette').tileColors;
Blitter = require('../blitter').Blitter;
out$.BrickView = BrickView = (function(superclass){
  var prototype = extend$((import$(BrickView, superclass).displayName = 'BrickView', BrickView), superclass).prototype, constructor = BrickView;
  function BrickView(){
    BrickView.superclass.apply(this, arguments);
  }
  prototype.render = function(brick){
    var i$, ref$, len$, y, row, j$, len1$, x, cell;
    this.clear();
    for (i$ = 0, len$ = (ref$ = brick.shape).length; i$ < len$; ++i$) {
      y = i$;
      row = ref$[i$];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          this.ctx.fillStyle = tileColors[cell];
          this.ctx.fillRect(x * this.opts.z + 1, y * this.opts.z + 1, this.opts.z - 1, this.opts.z - 1);
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
},{"../blitter":6,"./palette":15,"std":5}],14:[function(require,module,exports){
var ref$, id, log, BrickView, Blitter, Palette, NextBrickView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
BrickView = require('./brick').BrickView;
Blitter = require('../blitter').Blitter;
Palette = require('./palette.ls').Palette;
out$.NextBrickView = NextBrickView = (function(superclass){
  var prototype = extend$((import$(NextBrickView, superclass).displayName = 'NextBrickView', NextBrickView), superclass).prototype, constructor = NextBrickView;
  function NextBrickView(){
    NextBrickView.superclass.apply(this, arguments);
    this.brick = new BrickView(this.opts, this.width, this.height);
  }
  prototype.renderBg = function(){
    this.ctx.fillStyle = Palette.neutral[3];
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = Palette.neutral[2];
    return this.ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);
  };
  prototype.render = function(brick){
    this.clear();
    this.renderBg();
    this.brick.render(brick);
    return this.brick.blitTo(this);
  };
  return NextBrickView;
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
},{"../blitter":6,"./brick":13,"./palette.ls":15,"std":5}],15:[function(require,module,exports){
var neutral, red, orange, green, magenta, blue, brown, yellow, cyan, tileColors, Palette, out$ = typeof exports != 'undefined' && exports || this;
out$.neutral = neutral = ['#ffffff', '#cccccc', '#888888', '#212121'];
out$.red = red = ['#FF4444', '#FF7777', '#dd4444', '#551111'];
out$.orange = orange = ['#FFBB33', '#FFCC88', '#CC8800', '#553300'];
out$.green = green = ['#44ff66', '#88ffaa', '#22bb33', '#115511'];
out$.magenta = magenta = ['#ff33ff', '#ffaaff', '#bb22bb', '#551155'];
out$.blue = blue = ['#66bbff', '#aaddff', '#5588ee', '#111155'];
out$.brown = brown = ['#ffbb33', '#ffcc88', '#bb9900', '#555511'];
out$.yellow = yellow = ['#eeee11', '#ffffaa', '#ccbb00', '#555511'];
out$.cyan = cyan = ['#44ddff', '#aae3ff', '#00aacc', '#006699'];
out$.tileColors = tileColors = [neutral[2], red[0], orange[0], yellow[0], green[0], cyan[0], blue[2], magenta[0]];
out$.Palette = Palette = {
  neutral: neutral,
  red: red,
  orange: orange,
  yellow: yellow,
  green: green,
  cyan: cyan,
  blue: blue,
  magenta: magenta,
  tileColors: tileColors
};
},{}],16:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZ2FtZS1zdGF0ZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3JlbmRlcmVyLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS92aWV3cy9hcmVuYS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvdmlld3MvYnJpY2subHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3ZpZXdzL25leHQtYnJpY2subHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3ZpZXdzL3BhbGV0dGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RpbWVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIGRlbGF5LCBGcmFtZURyaXZlciwgSW5wdXRIYW5kbGVyLCBUZXRyaXNHYW1lLCBHYW1lU3RhdGUsIFRpbWVyLCBnYW1lU3RhdGUsIHJlbmRlck9wdHMsIGlucHV0SGFuZGxlciwgdGV0cmlzR2FtZSwgb3V0cHV0Q2FudmFzLCBEZWJ1Z091dHB1dCwgZGJvLCBkZWJ1Z091dHB1dCwgZnJhbWVEcml2ZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5GcmFtZURyaXZlciA9IHJlcXVpcmUoJy4vZnJhbWUtZHJpdmVyJykuRnJhbWVEcml2ZXI7XG5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2lucHV0LWhhbmRsZXInKS5JbnB1dEhhbmRsZXI7XG5yZWYkID0gcmVxdWlyZSgnLi90ZXRyaXMtZ2FtZScpLCBUZXRyaXNHYW1lID0gcmVmJC5UZXRyaXNHYW1lLCBHYW1lU3RhdGUgPSByZWYkLkdhbWVTdGF0ZTtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xuZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZSh7XG4gIHRpbGVTaXplOiAyMCxcbiAgdGlsZVdpZHRoOiAxMCxcbiAgdGlsZUhlaWdodDogMThcbn0pO1xucmVuZGVyT3B0cyA9IHtcbiAgejogMjBcbn07XG5pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xudGV0cmlzR2FtZSA9IG5ldyBUZXRyaXNHYW1lKGdhbWVTdGF0ZSwgcmVuZGVyT3B0cyk7XG5vdXRwdXRDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG5vdXRwdXRDYW52YXMud2lkdGggPSAxICsgMTcgKiByZW5kZXJPcHRzLno7XG5vdXRwdXRDYW52YXMuaGVpZ2h0ID0gMSArIDIwICogcmVuZGVyT3B0cy56O1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgaWYgKGZyYW1lRHJpdmVyLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xuICB9XG59KTtcbmRibyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkYm8pO1xuZGVidWdPdXRwdXQgPSBuZXcgRGVidWdPdXRwdXQoZGJvKTtcbmZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUpe1xuICB2YXIgb3V0cHV0QmxpdHRlcjtcbiAgZ2FtZVN0YXRlLmVsYXBzZWRUaW1lID0gdGltZTtcbiAgZ2FtZVN0YXRlLmVsYXBzZWRGcmFtZXMgPSBmcmFtZTtcbiAgZ2FtZVN0YXRlLmlucHV0U3RhdGUgPSBpbnB1dEhhbmRsZXIuY2hhbmdlc1NpbmNlTGFzdEZyYW1lKCk7XG4gIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUucnVuRnJhbWUoZ2FtZVN0YXRlLCDOlHQpO1xuICBUaW1lci51cGRhdGVBbGwozpR0KTtcbiAgb3V0cHV0QmxpdHRlciA9IHRldHJpc0dhbWUucmVuZGVyKGdhbWVTdGF0ZSwgcmVuZGVyT3B0cyk7XG4gIGlmIChkZWJ1Z091dHB1dCAhPSBudWxsKSB7XG4gICAgZGVidWdPdXRwdXQucmVuZGVyKGdhbWVTdGF0ZSwgZGJvKTtcbiAgfVxuICByZXR1cm4gb3V0cHV0QmxpdHRlci5ibGl0VG9DYW52YXMob3V0cHV0Q2FudmFzKTtcbn0pO1xuZnJhbWVEcml2ZXIuc3RhcnQoKTtcbmRlbGF5KDEwMDAsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnYW1lU3RhdGUuaW5wdXRTdGF0ZS5wdXNoKHtcbiAgICBrZXk6ICdsZWZ0JyxcbiAgICBhY3Rpb246ICdkb3duJ1xuICB9KTtcbn0pO1xuZGVsYXkoMTAwMCwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5pbnB1dFN0YXRlLnB1c2goe1xuICAgIGtleTogJ2xlZnQnLFxuICAgIGFjdGlvbjogJ3VwJ1xuICB9KTtcbn0pOyIsInZhciByZWYkLCBpZCwgbG9nLCB0ZW1wbGF0ZSwgRGVidWdPdXRwdXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG50ZW1wbGF0ZSA9IHtcbiAgY2VsbDogZnVuY3Rpb24oaXQpe1xuICAgIGlmIChpdCkge1xuICAgICAgcmV0dXJuIFwi4paS4paSXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIiAgXCI7XG4gICAgfVxuICB9LFxuICBicmljazogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm1hcCh0ZW1wbGF0ZS5jZWxsKS5qb2luKCcgJyk7XG4gICAgfSkuam9pbihcIlxcbiAgICAgICAgXCIpO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbGVuJCwga2V5U3VtbWFyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGhpcy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBrZXlTdW1tYXJ5ID0gdGhpc1tpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2goa2V5U3VtbWFyeS5rZXkgKyAnLScgKyBrZXlTdW1tYXJ5LmFjdGlvbiArIFwifFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiKG5vIGNoYW5nZSlcIjtcbiAgICB9XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgIE5FWFQgOlxcblwiICsgdGVtcGxhdGUuYnJpY2suYXBwbHkodGhpcy5icmljay5uZXh0KSArIFwiXFxuXFxuIHNjb3JlIC0gXCIgKyB0aGlzLnNjb3JlICsgXCJcXG4gbGluZXMgLSBcIiArIHRoaXMubGluZXMgKyBcIlxcblxcbiAgbWV0YSAtIFwiICsgdGhpcy5tZXRhZ2FtZVN0YXRlICsgXCJcXG4gIHRpbWUgLSBcIiArIHRoaXMuZWxhcHNlZFRpbWUgKyBcIlxcbiBmcmFtZSAtIFwiICsgdGhpcy5lbGFwc2VkRnJhbWVzICsgXCJcXG4gIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKSArIFwiXFxuICBkcm9wIC0gXCIgKyAodGhpcy5mb3JjZURvd25Nb2RlID8gJ2ZvcmNlJyA6ICdhdXRvJykgKyBcIlxcblxcblwiO1xuICB9XG59O1xub3V0JC5EZWJ1Z091dHB1dCA9IERlYnVnT3V0cHV0ID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnT3V0cHV0LmRpc3BsYXlOYW1lID0gJ0RlYnVnT3V0cHV0JztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnT3V0cHV0LnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z091dHB1dDtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHN0YXRlLCBvdXRwdXQpe1xuICAgIHJldHVybiBvdXRwdXQuaW5uZXJUZXh0ID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgfTtcbiAgZnVuY3Rpb24gRGVidWdPdXRwdXQoKXt9XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhZiwgRnJhbWVEcml2ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xub3V0JC5GcmFtZURyaXZlciA9IEZyYW1lRHJpdmVyID0gKGZ1bmN0aW9uKCl7XG4gIEZyYW1lRHJpdmVyLmRpc3BsYXlOYW1lID0gJ0ZyYW1lRHJpdmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEZyYW1lRHJpdmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZURyaXZlcjtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6ZXJvOiAwLFxuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgcnVubmluZzogZmFsc2VcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG5vdywgzpR0O1xuICAgIG5vdyA9IERhdGUubm93KCkgLSB0aGlzLnN0YXRlLnplcm87XG4gICAgzpR0ID0gbm93IC0gdGhpcy5zdGF0ZS50aW1lO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IG5vdztcbiAgICB0aGlzLnN0YXRlLmZyYW1lID0gdGhpcy5zdGF0ZS5mcmFtZSArIDE7XG4gICAgdGhpcy5vbkZyYW1lKM6UdCwgdGhpcy5zdGF0ZS50aW1lLCB0aGlzLnN0YXRlLmZyYW1lKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gcmFmKHRoaXMuZnJhbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdGFydCAtIHN0YXJ0aW5nXCIpO1xuICAgIHRoaXMuc3RhdGUuemVybyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gMDtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmZyYW1lKCk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RvcCAtIHN0b3BwaW5nXCIpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfTtcbiAgcmV0dXJuIEZyYW1lRHJpdmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBLRVksIEFDVElPTl9OQU1FLCBldmVudFN1bW1hcnksIElucHV0SGFuZGxlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbktFWSA9IHtcbiAgUkVUVVJOOiAxMyxcbiAgRVNDQVBFOiAyNyxcbiAgU1BBQ0U6IDMyLFxuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwXG59O1xuQUNUSU9OX05BTUUgPSAocmVmJCA9IHt9LCByZWYkW0tFWS5SRVRVUk4gKyBcIlwiXSA9ICdjb25maXJtJywgcmVmJFtLRVkuRVNDQVBFICsgXCJcIl0gPSAnYmFjaycsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnYWN0aW9uJywgcmVmJFtLRVkuTEVGVCArIFwiXCJdID0gJ2xlZnQnLCByZWYkW0tFWS5VUCArIFwiXCJdID0gJ3VwJywgcmVmJFtLRVkuUklHSFQgKyBcIlwiXSA9ICdyaWdodCcsIHJlZiRbS0VZLkRPV04gKyBcIlwiXSA9ICdkb3duJywgcmVmJCk7XG5ldmVudFN1bW1hcnkgPSBmdW5jdGlvbihldmVudFNhdmVyLCBrZXlEaXJlY3Rpb24pe1xuICByZXR1cm4gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHdoaWNoLCB0aGF0O1xuICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICBpZiAodGhhdCA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgcmV0dXJuIGV2ZW50U2F2ZXIoe1xuICAgICAgICBrZXk6IHRoYXQsXG4gICAgICAgIGFjdGlvbjoga2V5RGlyZWN0aW9uXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zYXZlRXZlbnQgPSBiaW5kJCh0aGlzLCAnc2F2ZUV2ZW50JywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJJbnB1dEhhbmRsZXI6Om5ld1wiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2F2ZWRFdmVudHM6IFtdXG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnRTdW1tYXJ5KHRoaXMuc2F2ZUV2ZW50LCAnZG93bicpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50U3VtbWFyeSh0aGlzLnNhdmVFdmVudCwgJ3VwJykpO1xuICB9XG4gIHByb3RvdHlwZS5zYXZlRXZlbnQgPSBmdW5jdGlvbihldmVudFN1bW1hcnkpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnNhdmVkRXZlbnRzLnB1c2goZXZlbnRTdW1tYXJ5KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNoYW5nZXM7XG4gICAgY2hhbmdlcyA9IHRoaXMuc3RhdGUuc2F2ZWRFdmVudHM7XG4gICAgdGhpcy5zdGF0ZS5zYXZlZEV2ZW50cyA9IFtdO1xuICAgIHJldHVybiBjaGFuZ2VzO1xuICB9O1xuICBJbnB1dEhhbmRsZXIuZGVidWdNb2RlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgcmV0dXJuIGxvZyhcIklucHV0SGFuZGxlcjo6ZGVidWdNb2RlIC1cIiwgd2hpY2gsIEFDVElPTl9OQU1FW3doaWNoXSB8fCAnW3VuYm91bmRdJyk7XG4gICAgfSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5vbiA9IGZ1bmN0aW9uKGNvZGUsIM67KXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgaWYgKHdoaWNoID09PSBjb2RlKSB7XG4gICAgICAgIHJldHVybiDOuygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICByZXR1cm4gSW5wdXRIYW5kbGVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciBpZCwgbG9nLCBmbGlwLCBkZWxheSwgZmxvb3IsIHJhbmRvbSwgcmFuZCwgcmFuZG9tRnJvbSwgYWRkVjIsIHJhZiwgdGhhdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5hZGRWMiA9IGFkZFYyID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBbYVswXSArIGJbMF0sIGFbMV0gKyBiWzFdXTtcbn07XG5vdXQkLnJhZiA9IHJhZiA9ICh0aGF0ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICA/IHRoYXRcbiAgOiAodGhhdCA9IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICA/IHRoYXRcbiAgICA6ICh0aGF0ID0gd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IGZ1bmN0aW9uKM67KXtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQozrssIDEwMDAgLyA2MCk7XG4gICAgICB9OyIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xub3V0JC5CbGl0dGVyID0gQmxpdHRlciA9IChmdW5jdGlvbigpe1xuICBCbGl0dGVyLmRpc3BsYXlOYW1lID0gJ0JsaXR0ZXInO1xuICB2YXIgcHJvdG90eXBlID0gQmxpdHRlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQmxpdHRlcjtcbiAgZnVuY3Rpb24gQmxpdHRlcihvcHRzLCB4LCB5KXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0geDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHk7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICB9XG4gIHByb3RvdHlwZS5ibGl0VG8gPSBmdW5jdGlvbihkZXN0LCB4LCB5LCBhbHBoYSl7XG4gICAgeCA9PSBudWxsICYmICh4ID0gMCk7XG4gICAgeSA9PSBudWxsICYmICh5ID0gMCk7XG4gICAgYWxwaGEgPT0gbnVsbCAmJiAoYWxwaGEgPSAxKTtcbiAgICBkZXN0LmN0eC5nbG9iYWxBbHBoYSA9IGFscGhhO1xuICAgIGRlc3QuY3R4LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgeCwgeSk7XG4gICAgcmV0dXJuIGRlc3QuY3R4Lmdsb2JhbEFscGhhID0gMTtcbiAgfTtcbiAgcHJvdG90eXBlLmJsaXRUb0NhbnZhcyA9IGZ1bmN0aW9uKGRlc3RDYW52YXMpe1xuICAgIHZhciBjdHg7XG4gICAgY3R4ID0gZGVzdENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgZGVzdENhbnZhcy53aWR0aCwgZGVzdENhbnZhcy5oZWlnaHQpO1xuICAgIHJldHVybiBjdHguZHJhd0ltYWdlKHRoaXMuY2FudmFzLCAwLCAwLCBkZXN0Q2FudmFzLndpZHRoLCBkZXN0Q2FudmFzLmhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH07XG4gIHJldHVybiBCbGl0dGVyO1xufSgpKTsiLCJ2YXIgc3F1YXJlLCB6aWcsIHphZywgbGVmdCwgcmlnaHQsIHRlZSwgdGV0cmlzLCBhbGwsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLnNxdWFyZSA9IHNxdWFyZSA9IFtbWzAsIDAsIDBdLCBbMCwgMSwgMV0sIFswLCAxLCAxXSwgWzAsIDAsIDBdXV07XG5vdXQkLnppZyA9IHppZyA9IFtbWzAsIDAsIDBdLCBbMiwgMiwgMF0sIFswLCAyLCAyXSwgWzAsIDAsIDBdXSwgW1swLCAyLCAwXSwgWzIsIDIsIDBdLCBbMiwgMCwgMF0sIFswLCAwLCAwXV1dO1xub3V0JC56YWcgPSB6YWcgPSBbW1swLCAwLCAwXSwgWzAsIDMsIDNdLCBbMywgMywgMF0sIFswLCAwLCAwXV0sIFtbMywgMCwgMF0sIFszLCAzLCAwXSwgWzAsIDMsIDBdLCBbMCwgMCwgMF1dXTtcbm91dCQubGVmdCA9IGxlZnQgPSBbW1swLCAwLCAwXSwgWzQsIDQsIDRdLCBbNCwgMCwgMF0sIFswLCAwLCAwXV0sIFtbNCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgMCwgMF1dLCBbWzAsIDAsIDRdLCBbNCwgNCwgNF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSwgW1swLCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgNF0sIFswLCAwLCAwXV1dO1xub3V0JC5yaWdodCA9IHJpZ2h0ID0gW1tbMCwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDVdLCBbMCwgMCwgMF1dLCBbWzAsIDUsIDBdLCBbMCwgNSwgMF0sIFs1LCA1LCAwXSwgWzAsIDAsIDBdXSwgW1s1LCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sIFtbMCwgNSwgNV0sIFswLCA1LCAwXSwgWzAsIDUsIDBdLCBbMCwgMCwgMF1dXTtcbm91dCQudGVlID0gdGVlID0gW1tbMCwgMCwgMF0sIFs2LCA2LCA2XSwgWzAsIDYsIDBdLCBbMCwgMCwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgMF0sIFswLCA2LCAwXSwgWzAsIDAsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDZdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sIFtbMCwgNiwgMF0sIFswLCA2LCA2XSwgWzAsIDYsIDBdLCBbMCwgMCwgMF1dXTtcbm91dCQudGV0cmlzID0gdGV0cmlzID0gW1tbMCwgMCwgMCwgMF0sIFswLCAwLCAwLCAwXSwgWzcsIDcsIDcsIDddLCBbMCwgMCwgMCwgMF1dLCBbWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdXV07XG5vdXQkLmFsbCA9IGFsbCA9IFtcbiAge1xuICAgIHR5cGU6ICdzcXVhcmUnLFxuICAgIHNoYXBlczogc3F1YXJlXG4gIH0sIHtcbiAgICB0eXBlOiAnemlnJyxcbiAgICBzaGFwZXM6IHppZ1xuICB9LCB7XG4gICAgdHlwZTogJ3phZycsXG4gICAgc2hhcGVzOiB6YWdcbiAgfSwge1xuICAgIHR5cGU6ICdsZWZ0JyxcbiAgICBzaGFwZXM6IGxlZnRcbiAgfSwge1xuICAgIHR5cGU6ICdyaWdodCcsXG4gICAgc2hhcGVzOiByaWdodFxuICB9LCB7XG4gICAgdHlwZTogJ3RlZScsXG4gICAgc2hhcGVzOiB0ZWVcbiAgfSwge1xuICAgIHR5cGU6ICd0ZXRyaXMnLFxuICAgIHNoYXBlczogdGV0cmlzXG4gIH1cbl07IiwidmFyIHJlZiQsIGlkLCBsb2csIGFkZFYyLCByYW5kLCByYW5kb21Gcm9tLCBCcmlja1NoYXBlcywgY2FuRHJvcCwgY2FuTW92ZSwgY2FuUm90YXRlLCBjb2xsaWRlcywgY29weUJyaWNrVG9BcmVuYSwgdG9wSXNSZWFjaGVkLCBpc0NvbXBsZXRlLCBuZXdCcmljaywgc3Bhd25OZXdCcmljaywgZHJvcEFyZW5hUm93LCBjbGVhckFyZW5hLCBnZXRTaGFwZU9mUm90YXRpb24sIG5vcm1hbGlzZVJvdGF0aW9uLCByb3RhdGVCcmljaywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kID0gcmVmJC5yYW5kLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLmNhbkRyb3AgPSBjYW5Ecm9wID0gZnVuY3Rpb24oYnJpY2ssIGFyZW5hKXtcbiAgcmV0dXJuIGNhbk1vdmUoYnJpY2ssIFswLCAxXSwgYXJlbmEpO1xufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuUm90YXRlID0gY2FuUm90YXRlID0gZnVuY3Rpb24oYnJpY2ssIGRpciwgYXJlbmEpe1xuICB2YXIgbmV3U2hhcGU7XG4gIG5ld1NoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBjb2xsaWRlcyhicmljay5wb3MsIG5ld1NoYXBlLCBhcmVuYSk7XG59O1xub3V0JC5jb2xsaWRlcyA9IGNvbGxpZGVzID0gZnVuY3Rpb24ocG9zLCBzaGFwZSwgYXJnJCl7XG4gIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGokLCByZWYxJCwgbGVuMSQsIHgsIHU7XG4gIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdID4gMCkge1xuICAgICAgICBpZiAodiA+PSAwKSB7XG4gICAgICAgICAgaWYgKHYgPj0gaGVpZ2h0IHx8IHUgPj0gd2lkdGggfHwgdSA8IDAgfHwgY2VsbHNbdl1bdV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLmNvcHlCcmlja1RvQXJlbmEgPSBjb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICB2YXIgcG9zLCBzaGFwZSwgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgY2VsbHMgPSBhcmcxJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gJiYgdiA+PSAwKSB7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY2VsbHNbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQudG9wSXNSZWFjaGVkID0gdG9wSXNSZWFjaGVkID0gZnVuY3Rpb24oYXJnJCl7XG4gIHZhciBjZWxscywgaSQsIHJlZiQsIGxlbiQsIGNlbGw7XG4gIGNlbGxzID0gYXJnJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLmlzQ29tcGxldGUgPSBpc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcm90YXRpb246IDAsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdLFxuICAgIHR5cGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0udHlwZSxcbiAgICBwb3M6IFswLCAwXVxuICB9O1xufTtcbm91dCQuc3Bhd25OZXdCcmljayA9IHNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihncyl7XG4gIGdzLmJyaWNrLmN1cnJlbnQgPSBncy5icmljay5uZXh0O1xuICBncy5icmljay5jdXJyZW50LnBvcyA9IFs0LCAtMV07XG4gIHJldHVybiBncy5icmljay5uZXh0ID0gbmV3QnJpY2soKTtcbn07XG5vdXQkLmRyb3BBcmVuYVJvdyA9IGRyb3BBcmVuYVJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQuY2xlYXJBcmVuYSA9IGNsZWFyQXJlbmEgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCBpLCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgcm93ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICBpID0gaiQ7XG4gICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2gocm93W2ldID0gMCk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmdldFNoYXBlT2ZSb3RhdGlvbiA9IGdldFNoYXBlT2ZSb3RhdGlvbiA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIHJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIEJyaWNrU2hhcGVzW2JyaWNrLnR5cGVdW3JvdGF0aW9uXTtcbn07XG5vdXQkLm5vcm1hbGlzZVJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24gPSBmdW5jdGlvbihhcmckLCByb3RhdGlvbil7XG4gIHZhciB0eXBlO1xuICB0eXBlID0gYXJnJC50eXBlO1xuICByZXR1cm4gcm90YXRpb24gJSBCcmlja1NoYXBlc1t0eXBlXS5sZW5ndGg7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIGRpcil7XG4gIHZhciByb3RhdGlvbiwgdHlwZTtcbiAgcm90YXRpb24gPSBicmljay5yb3RhdGlvbiwgdHlwZSA9IGJyaWNrLnR5cGU7XG4gIGJyaWNrLnJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uICsgZGlyKTtcbiAgcmV0dXJuIGJyaWNrLnNoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbik7XG59O1xuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgVGltZXIsIEdhbWVTdGF0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcblRpbWVyID0gcmVxdWlyZSgnLi4vdGltZXInKS5UaW1lcjtcbm91dCQuR2FtZVN0YXRlID0gR2FtZVN0YXRlID0gKGZ1bmN0aW9uKCl7XG4gIEdhbWVTdGF0ZS5kaXNwbGF5TmFtZSA9ICdHYW1lU3RhdGUnO1xuICB2YXIgZGVmYXVsdHMsIHByb3RvdHlwZSA9IEdhbWVTdGF0ZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR2FtZVN0YXRlO1xuICBkZWZhdWx0cyA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gICAgc2NvcmU6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgYnJpY2s6IHtcbiAgICAgIG5leHQ6IHZvaWQgOCxcbiAgICAgIGN1cnJlbnQ6IHZvaWQgOFxuICAgIH0sXG4gICAgaW5wdXRTdGF0ZTogW10sXG4gICAgZm9yY2VEb3duTW9kZTogZmFsc2UsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG4gICAgZWxhcHNlZEZyYW1lczogMCxcbiAgICB0aW1lcnM6IHt9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHRpbGVXaWR0aDogMTAsXG4gICAgICB0aWxlSGVpZ2h0OiAxOCxcbiAgICAgIGRyb3BTcGVlZDogNTAwLFxuICAgICAgZm9yY2VEcm9wV2FpdFRpbWU6IDEwMFxuICAgIH0sXG4gICAgYXJlbmE6IHtcbiAgICAgIGNlbGxzOiBbW11dLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIEdhbWVTdGF0ZShvcHRpb25zKXtcbiAgICBpbXBvcnQkKHRoaXMsIGRlZmF1bHRzKTtcbiAgICBpbXBvcnQkKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5kcm9wU3BlZWQpO1xuICAgIHRoaXMudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuZm9yY2VEcm9wV2FpdFRpbWUpO1xuICAgIHRoaXMuYXJlbmEgPSBjb25zdHJ1Y3Rvci5uZXdBcmVuYSh0aGlzLm9wdGlvbnMudGlsZVdpZHRoLCB0aGlzLm9wdGlvbnMudGlsZUhlaWdodCk7XG4gIH1cbiAgR2FtZVN0YXRlLm5ld0FyZW5hID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCl7XG4gICAgdmFyIHJvdywgY2VsbDtcbiAgICByZXR1cm4ge1xuICAgICAgY2VsbHM6IChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaSQsIHRvJCwgbHJlc3VsdCQsIGokLCB0bzEkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgICBmb3IgKGkkID0gMCwgdG8kID0gaGVpZ2h0OyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgICAgIHJvdyA9IGkkO1xuICAgICAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICAgICAgZm9yIChqJCA9IDAsIHRvMSQgPSB3aWR0aDsgaiQgPCB0bzEkOyArK2okKSB7XG4gICAgICAgICAgICBjZWxsID0gaiQ7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgICB9KCkpLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9O1xuICB9O1xuICByZXR1cm4gR2FtZVN0YXRlO1xufSgpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIEdhbWVTdGF0ZSwgUmVuZGVyZXIsIFRpbWVyLCBDb3JlLCBUZXRyaXNHYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kO1xucmFuZG9tRnJvbSA9IHJlcXVpcmUoJ3N0ZCcpLnJhbmRvbUZyb207XG5HYW1lU3RhdGUgPSByZXF1aXJlKCcuL2dhbWUtc3RhdGUnKS5HYW1lU3RhdGU7XG5SZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKS5SZW5kZXJlcjtcblRpbWVyID0gcmVxdWlyZSgnLi4vdGltZXInKS5UaW1lcjtcbkNvcmUgPSByZXF1aXJlKCcuL2dhbWUtY29yZScpO1xub3V0JC5UZXRyaXNHYW1lID0gVGV0cmlzR2FtZSA9IChmdW5jdGlvbigpe1xuICBUZXRyaXNHYW1lLmRpc3BsYXlOYW1lID0gJ1RldHJpc0dhbWUnO1xuICB2YXIgcHJvdG90eXBlID0gVGV0cmlzR2FtZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGV0cmlzR2FtZTtcbiAgZnVuY3Rpb24gVGV0cmlzR2FtZShnYW1lU3RhdGUsIHJlbmRlcmVyT3B0aW9ucyl7XG4gICAgbG9nKFwiVGV0cmlzR2FtZTo6bmV3XCIpO1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIocmVuZGVyZXJPcHRpb25zKTtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0ZhaWxTY3JlZW4gPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgY29uc29sZS5kZWJ1ZygnRkFJTEVEJyk7XG4gICAgcmV0dXJuIHRoaXMuYmVnaW5OZXdHYW1lKGdhbWVTdGF0ZSk7XG4gIH07XG4gIHByb3RvdHlwZS5iZWdpbk5ld0dhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIChmdW5jdGlvbigpe1xuICAgICAgQ29yZS5jbGVhckFyZW5hKHRoaXMuYXJlbmEpO1xuICAgICAgdGhpcy5icmljay5uZXh0ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5uZXh0LnBvcyA9IFszLCAtMV07XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQgPSBDb3JlLm5ld0JyaWNrKCk7XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQucG9zID0gWzMsIC0xXTtcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgdGhpcy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0KCk7XG4gICAgfS5jYWxsKGdhbWVTdGF0ZSkpO1xuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHByb3RvdHlwZS5hZHZhbmNlR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgYnJpY2ssIGFyZW5hLCBpbnB1dFN0YXRlLCByZWYkLCBrZXksIGFjdGlvbiwgcm93c0Ryb3BwZWQsIHJlcyQsIGkkLCBpeCwgcm93LCBsZW4kLCByb3dJeDtcbiAgICBicmljayA9IGdzLmJyaWNrLCBhcmVuYSA9IGdzLmFyZW5hLCBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZTtcbiAgICB3aGlsZSAoaW5wdXRTdGF0ZS5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dFN0YXRlLnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Nb3ZlKGJyaWNrLmN1cnJlbnQsIFstMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMF0gLT0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Nb3ZlKGJyaWNrLmN1cnJlbnQsIFsxLCAwXSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBicmljay5jdXJyZW50LnBvc1swXSArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgZ3MuZm9yY2VEb3duTW9kZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbic6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIDEsIGFyZW5hKSkge1xuICAgICAgICAgICAgQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ3MuZm9yY2VEb3duTW9kZSAmJiBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLmV4cGlyZWQpIHtcbiAgICAgIGlmIChDb3JlLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDb3JlLmNvcHlCcmlja1RvQXJlbmEoYnJpY2suY3VycmVudCwgYXJlbmEpO1xuICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICAgIGdzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIucmVzZXQoKTtcbiAgICAgICAgZ3MudGltZXJzLmRyb3BUaW1lci50aW1lVG9FeHBpcnkgPSBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLnRhcmdldFRpbWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChncy50aW1lcnMuZHJvcFRpbWVyLmV4cGlyZWQpIHtcbiAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIucmVzZXRXaXRoUmVtYWluZGVyKCk7XG4gICAgICBpZiAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ29yZS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgQ29yZS5zcGF3bk5ld0JyaWNrKGdzKTtcbiAgICAgIH1cbiAgICAgIHJlcyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICByb3dJeCA9IHJlZiRbaSRdO1xuICAgICAgICByZXMkLnB1c2goQ29yZS5kcm9wQXJlbmFSb3coZ3MuYXJlbmEsIHJvd0l4KSk7XG4gICAgICB9XG4gICAgICByb3dzRHJvcHBlZCA9IHJlcyQ7XG4gICAgICBncy5saW5lcyArPSByb3dzRHJvcHBlZC5sZW5ndGg7XG4gICAgICBpZiAoQ29yZS50b3BJc1JlYWNoZWQoYXJlbmEpKSB7XG4gICAgICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2ZhaWx1cmUnO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBmbiQoKXtcbiAgICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgaXggPSBpJDtcbiAgICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICAgIGlmIChDb3JlLmlzQ29tcGxldGUocm93KSkge1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goaXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucnVuRnJhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgdmFyIG1ldGFnYW1lU3RhdGU7XG4gICAgbWV0YWdhbWVTdGF0ZSA9IGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIHN3aXRjaCAobWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ2ZhaWx1cmUnOlxuICAgICAgdGhpcy5zaG93RmFpbFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICB0aGlzLmFkdmFuY2VHYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIHRoaXMuYmVnaW5OZXdHYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5kZWJ1ZygnVW5rbm93biBtZXRhZ2FtZS1zdGF0ZTonLCBtZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGdhbWVTdGF0ZTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgdmFyIG1ldGFnYW1lU3RhdGU7XG4gICAgbWV0YWdhbWVTdGF0ZSA9IGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIHN3aXRjaCAobWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXJTdGFydE1lbnUoZ2FtZVN0YXRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdXNlJzpcbiAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyUGF1c2VNZW51KGdhbWVTdGF0ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyR2FtZShnYW1lU3RhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnd2luJzpcbiAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyV2luU2NyZWVuKGdhbWVTdGF0ZSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXJCbGFuaygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlcjtcbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRldHJpc0dhbWU6IFRldHJpc0dhbWUsXG4gIEdhbWVTdGF0ZTogR2FtZVN0YXRlXG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCBQYWxldHRlLCBBcmVuYVZpZXcsIEJyaWNrVmlldywgTmV4dEJyaWNrVmlldywgUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3ZpZXdzL3BhbGV0dGUubHMnKS5QYWxldHRlO1xuQXJlbmFWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcmVuYScpLkFyZW5hVmlldztcbkJyaWNrVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYnJpY2snKS5Ccmlja1ZpZXc7XG5OZXh0QnJpY2tWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9uZXh0LWJyaWNrJykuTmV4dEJyaWNrVmlldztcbm91dCQuUmVuZGVyZXIgPSBSZW5kZXJlciA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUmVuZGVyZXIsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1JlbmRlcmVyJywgUmVuZGVyZXIpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIFJlbmRlcmVyKG9wdHMpe1xuICAgIHZhciB6O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy56ID0geiA9IHRoaXMub3B0cy56O1xuICAgIFJlbmRlcmVyLnN1cGVyY2xhc3MuY2FsbCh0aGlzLCB0aGlzLm9wdHMsIDE3ICogeiwgMjAgKiB6KTtcbiAgICB0aGlzLmFyZW5hID0gbmV3IEFyZW5hVmlldyh0aGlzLm9wdHMsIDEwICogeiArIDIsIDE4ICogeiArIDIpO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2tWaWV3KHRoaXMub3B0cywgNCAqIHosIDQgKiB6KTtcbiAgICB0aGlzLm5leHQgPSBuZXcgTmV4dEJyaWNrVmlldyh0aGlzLm9wdHMsIDQgKiB6LCA0ICogeik7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlclN0YXJ0TWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGxvZygncmVuZGVyLXN0YXJ0LW1lbnUnKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckJsYW5rID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jbGVhcigpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihncy5icmljay5jdXJyZW50LCB0aGlzLm9wdHMpO1xuICAgIHRoaXMubmV4dC5yZW5kZXIoZ3MuYnJpY2submV4dCwgdGhpcy5vcHRzKTtcbiAgICB0aGlzLmFyZW5hLnJlbmRlcihncy5hcmVuYSwgdGhpcy5vcHRzKTtcbiAgICByZXR1cm4gdGhpcy5jb2xsYXBzZUFsbChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5jb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcG9zO1xuICAgIHBvcyA9IGdzLmJyaWNrLmN1cnJlbnQucG9zO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5icmljay5ibGl0VG8odGhpcy5hcmVuYSwgcG9zWzBdICogdGhpcy56LCBwb3NbMV0gKiB0aGlzLnopO1xuICAgIHRoaXMuYXJlbmEuYmxpdFRvKHRoaXMsIHRoaXMub3B0cy56LCB0aGlzLm9wdHMueik7XG4gICAgcmV0dXJuIHRoaXMubmV4dC5ibGl0VG8odGhpcywgKDIgKyBncy5hcmVuYS53aWR0aCkgKiB0aGlzLnosIDEgKiB0aGlzLnopO1xuICB9O1xuICByZXR1cm4gUmVuZGVyZXI7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBQYWxldHRlLCBCbGl0dGVyLCBBcmVuYVZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlLmxzJykuUGFsZXR0ZTtcbkJsaXR0ZXIgPSByZXF1aXJlKCcuLi9ibGl0dGVyJykuQmxpdHRlcjtcbm91dCQuQXJlbmFWaWV3ID0gQXJlbmFWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYVZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0FyZW5hVmlldycsIEFyZW5hVmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYVZpZXc7XG4gIGZ1bmN0aW9uIEFyZW5hVmlldygpe1xuICAgIEFyZW5hVmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5ncmlkID0gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShCbGl0dGVyLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gICAgdGhpcy5jZWxscyA9IChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoQmxpdHRlciwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pO1xuICB9XG4gIHByb3RvdHlwZS5kcmF3Q2VsbHMgPSBmdW5jdGlvbihjZWxscywgc2l6ZSl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIHRpbGUsIHJlc3VsdHMkID0gW107XG4gICAgdGhpcy5jZWxscy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY2VsbHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGNlbGxzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgIGlmICh0aWxlKSB7XG4gICAgICAgICAgdGhpcy5jZWxscy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS50aWxlQ29sb3JzW3RpbGVdO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2godGhpcy5jZWxscy5jdHguZmlsbFJlY3QoMSArIHggKiBzaXplLCAxICsgeSAqIHNpemUsIHNpemUgLSAxLCBzaXplIC0gMSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuZHJhd0dyaWQgPSBmdW5jdGlvbih3LCBoLCBzaXplKXtcbiAgICB2YXIgaSQsIHgsIHk7XG4gICAgdGhpcy5ncmlkLmNsZWFyKCk7XG4gICAgdGhpcy5ncmlkLmN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgdGhpcy5ncmlkLmN0eC5iZWdpblBhdGgoKTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gdzsgKytpJCkge1xuICAgICAgeCA9IGkkO1xuICAgICAgdGhpcy5ncmlkLmN0eC5tb3ZlVG8oeCAqIHNpemUgKyAwLjUsIDApO1xuICAgICAgdGhpcy5ncmlkLmN0eC5saW5lVG8oeCAqIHNpemUgKyAwLjUsIGggKiBzaXplICsgMC41KTtcbiAgICB9XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IGg7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHRoaXMuZ3JpZC5jdHgubW92ZVRvKDAsIHkgKiBzaXplICsgMC41KTtcbiAgICAgIHRoaXMuZ3JpZC5jdHgubGluZVRvKHcgKiBzaXplICsgMC41LCB5ICogc2l6ZSArIDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdyaWQuY3R4LnN0cm9rZSgpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICAgIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgejtcbiAgICBjZWxscyA9IGFyZyQuY2VsbHMsIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQ7XG4gICAgeiA9IGFyZzEkLno7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCAqIHosIGhlaWdodCAqIHopO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzJdO1xuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoMC41LCAwLjUsIHdpZHRoICogeiArIDEsIGhlaWdodCAqIHogKyAxKTtcbiAgICB0aGlzLmRyYXdDZWxscyhjZWxscywgeik7XG4gICAgdGhpcy5ncmlkLmJsaXRUbyh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5jZWxscy5ibGl0VG8odGhpcywgMCwgMCwgMC45KTtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHRpbGVDb2xvcnMsIEJsaXR0ZXIsIEJyaWNrVmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbnRpbGVDb2xvcnMgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS50aWxlQ29sb3JzO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4uL2JsaXR0ZXInKS5CbGl0dGVyO1xub3V0JC5Ccmlja1ZpZXcgPSBCcmlja1ZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2tWaWV3JywgQnJpY2tWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrVmlldztcbiAgZnVuY3Rpb24gQnJpY2tWaWV3KCl7XG4gICAgQnJpY2tWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgeSwgcm93LCBqJCwgbGVuMSQsIHgsIGNlbGw7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBicmljay5zaGFwZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRpbGVDb2xvcnNbY2VsbF07XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoeCAqIHRoaXMub3B0cy56ICsgMSwgeSAqIHRoaXMub3B0cy56ICsgMSwgdGhpcy5vcHRzLnogLSAxLCB0aGlzLm9wdHMueiAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICByZXR1cm4gQnJpY2tWaWV3O1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQnJpY2tWaWV3LCBCbGl0dGVyLCBQYWxldHRlLCBOZXh0QnJpY2tWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQnJpY2tWaWV3ID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrVmlldztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuLi9ibGl0dGVyJykuQmxpdHRlcjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUubHMnKS5QYWxldHRlO1xub3V0JC5OZXh0QnJpY2tWaWV3ID0gTmV4dEJyaWNrVmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTmV4dEJyaWNrVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTmV4dEJyaWNrVmlldycsIE5leHRCcmlja1ZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTmV4dEJyaWNrVmlldztcbiAgZnVuY3Rpb24gTmV4dEJyaWNrVmlldygpe1xuICAgIE5leHRCcmlja1ZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2tWaWV3KHRoaXMub3B0cywgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXJCZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzNdO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFsyXTtcbiAgICByZXR1cm4gdGhpcy5jdHguc3Ryb2tlUmVjdCgwLjUsIDAuNSwgdGhpcy53aWR0aCAtIDEsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihicmljayl7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMucmVuZGVyQmcoKTtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihicmljayk7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2suYmxpdFRvKHRoaXMpO1xuICB9O1xuICByZXR1cm4gTmV4dEJyaWNrVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIG5ldXRyYWwsIHJlZCwgb3JhbmdlLCBncmVlbiwgbWFnZW50YSwgYmx1ZSwgYnJvd24sIHllbGxvdywgY3lhbiwgdGlsZUNvbG9ycywgUGFsZXR0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQubmV1dHJhbCA9IG5ldXRyYWwgPSBbJyNmZmZmZmYnLCAnI2NjY2NjYycsICcjODg4ODg4JywgJyMyMTIxMjEnXTtcbm91dCQucmVkID0gcmVkID0gWycjRkY0NDQ0JywgJyNGRjc3NzcnLCAnI2RkNDQ0NCcsICcjNTUxMTExJ107XG5vdXQkLm9yYW5nZSA9IG9yYW5nZSA9IFsnI0ZGQkIzMycsICcjRkZDQzg4JywgJyNDQzg4MDAnLCAnIzU1MzMwMCddO1xub3V0JC5ncmVlbiA9IGdyZWVuID0gWycjNDRmZjY2JywgJyM4OGZmYWEnLCAnIzIyYmIzMycsICcjMTE1NTExJ107XG5vdXQkLm1hZ2VudGEgPSBtYWdlbnRhID0gWycjZmYzM2ZmJywgJyNmZmFhZmYnLCAnI2JiMjJiYicsICcjNTUxMTU1J107XG5vdXQkLmJsdWUgPSBibHVlID0gWycjNjZiYmZmJywgJyNhYWRkZmYnLCAnIzU1ODhlZScsICcjMTExMTU1J107XG5vdXQkLmJyb3duID0gYnJvd24gPSBbJyNmZmJiMzMnLCAnI2ZmY2M4OCcsICcjYmI5OTAwJywgJyM1NTU1MTEnXTtcbm91dCQueWVsbG93ID0geWVsbG93ID0gWycjZWVlZTExJywgJyNmZmZmYWEnLCAnI2NjYmIwMCcsICcjNTU1NTExJ107XG5vdXQkLmN5YW4gPSBjeWFuID0gWycjNDRkZGZmJywgJyNhYWUzZmYnLCAnIzAwYWFjYycsICcjMDA2Njk5J107XG5vdXQkLnRpbGVDb2xvcnMgPSB0aWxlQ29sb3JzID0gW25ldXRyYWxbMl0sIHJlZFswXSwgb3JhbmdlWzBdLCB5ZWxsb3dbMF0sIGdyZWVuWzBdLCBjeWFuWzBdLCBibHVlWzJdLCBtYWdlbnRhWzBdXTtcbm91dCQuUGFsZXR0ZSA9IFBhbGV0dGUgPSB7XG4gIG5ldXRyYWw6IG5ldXRyYWwsXG4gIHJlZDogcmVkLFxuICBvcmFuZ2U6IG9yYW5nZSxcbiAgeWVsbG93OiB5ZWxsb3csXG4gIGdyZWVuOiBncmVlbixcbiAgY3lhbjogY3lhbixcbiAgYmx1ZTogYmx1ZSxcbiAgbWFnZW50YTogbWFnZW50YSxcbiAgdGlsZUNvbG9yczogdGlsZUNvbG9yc1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSBiZWdpbiA/IFRJTUVSX0FDVElWRSA6IFRJTUVSX0VYUElSRUQ7XG4gICAgdGhpcy5hY3RpdmUgPSBiZWdpbjtcbiAgICB0aGlzLmV4cGlyZWQgPSAhYmVnaW47XG4gICAgYWxsVGltZXJzLnB1c2godGhpcyk7XG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2FjdGl2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfQUNUSVZFO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdleHBpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9FWFBJUkVEO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICd0aW1lVG9FeHBpcnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGV4cFRpbWUpe1xuICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZSAtIGV4cFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lICs9IM6UdDtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMudGFyZ2V0VGltZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldFdpdGhSZW1haW5kZXIgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lIC0gdGltZTtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfQUNUSVZFO1xuICB9O1xuICBwcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5zcGxpY2UoYWxsVGltZXJzLmluZGV4T2YodGhpcyksIDEpO1xuICB9O1xuICBwcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIlRJTUVSOiBcIiArIHRoaXMudGFyZ2V0VGltZSArIFwiXFxuU1RBVEU6IFwiICsgdGhpcy5zdGF0ZSArIFwiIChcIiArIHRoaXMuYWN0aXZlICsgXCJ8XCIgKyB0aGlzLmV4cGlyZWQgKyBcIilcXG5cIiArIHByb2diYXIodGhpcy5jdXJyZW50VGltZSwgdGhpcy50YXJnZXRUaW1lKTtcbiAgfTtcbiAgVGltZXIudXBkYXRlQWxsID0gZnVuY3Rpb24ozpR0KXtcbiAgICByZXR1cm4gYWxsVGltZXJzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudXBkYXRlKM6UdCk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBUaW1lcjtcbn0oKSk7XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
