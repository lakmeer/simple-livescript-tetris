(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, Timer, TetrisGame, GameState, CanvasRenderer, DomRenderer, DebugOutput, gameOpts, renderOpts, inputHandler, gameState, tetrisGame, renderers, i$, len$, renderer, debugOutput, frameDriver;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
FrameDriver = require('./frame-driver').FrameDriver;
InputHandler = require('./input-handler').InputHandler;
Timer = require('./timer').Timer;
TetrisGame = require('./tetris-game').TetrisGame;
GameState = require('./game-state').GameState;
CanvasRenderer = require('./renderers/canvas').CanvasRenderer;
DomRenderer = require('./renderers/dom').DomRenderer;
DebugOutput = require('./debug-output').DebugOutput;
gameOpts = {
  tileWidth: 10,
  tileHeight: 18
};
renderOpts = {
  z: 20
};
inputHandler = new InputHandler;
gameState = new GameState(gameOpts);
tetrisGame = new TetrisGame(gameState);
renderers = [new CanvasRenderer(renderOpts), new DomRenderer(renderOpts)];
for (i$ = 0, len$ = renderers.length; i$ < len$; ++i$) {
  renderer = renderers[i$];
  renderer.appendTo(document.body);
}
debugOutput = new DebugOutput;
InputHandler.on(192, function(){
  if (frameDriver.state.running) {
    return frameDriver.stop();
  } else {
    return frameDriver.start();
  }
});
frameDriver = new FrameDriver(function(Δt, time, frame){
  var i$, ref$, len$, renderer;
  gameState.elapsedTime = time;
  gameState.elapsedFrames = frame;
  gameState.inputState = inputHandler.changesSinceLastFrame();
  Timer.updateAll(Δt);
  gameState = tetrisGame.runFrame(gameState, Δt);
  for (i$ = 0, len$ = (ref$ = renderers).length; i$ < len$; ++i$) {
    renderer = ref$[i$];
    renderer.render(gameState, renderOpts);
  }
  if (debugOutput) {
    return debugOutput.render(gameState);
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
},{"./debug-output":2,"./frame-driver":3,"./game-state":4,"./input-handler":5,"./renderers/canvas":9,"./renderers/dom":14,"./tetris-game":18,"./timer":20,"std":15}],2:[function(require,module,exports){
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
  score: function(){
    return JSON.stringify(this, null, 2);
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
    return "score - " + template.score.apply(this.score) + "\nlines - " + this.lines + "\n\n meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\n keys - " + template.keys.apply(this.inputState) + "\n drop - " + (this.forceDownMode ? 'soft' : 'auto');
  }
};
out$.DebugOutput = DebugOutput = (function(){
  DebugOutput.displayName = 'DebugOutput';
  var prototype = DebugOutput.prototype, constructor = DebugOutput;
  function DebugOutput(){
    this.dbo = document.createElement('pre');
    document.body.appendChild(this.dbo);
  }
  prototype.render = function(state){
    switch (state.metagameState) {
    case 'game':
      return this.dbo.innerText = template.normal.apply(state);
    case 'start-menu':
      return this.dbo.innerText = "Start menu";
    case 'remove-lines':
      return this.dbo.innerText = template.normal.apply(state);
    default:
      return this.dbo.innerText = "Unknown metagame state: " + state.metagameState;
    }
  };
  return DebugOutput;
}());
},{"std":15}],3:[function(require,module,exports){
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
},{"std":15}],4:[function(require,module,exports){
var ref$, id, log, rand, Timer, GameState, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
Timer = require('./timer').Timer;
out$.GameState = GameState = (function(){
  GameState.displayName = 'GameState';
  var defaults, prototype = GameState.prototype, constructor = GameState;
  defaults = {
    metagameState: 'no-game',
    score: {
      points: 0,
      lines: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetris: 0
    },
    brick: {
      next: void 8,
      current: void 8
    },
    inputState: [],
    forceDownMode: false,
    elapsedTime: 0,
    elapsedFrames: 0,
    timers: {
      dropTimer: null,
      forceDropWaitTiemr: null,
      keyRepeatTimer: null,
      removalAnimation: null
    },
    options: {
      tileWidth: 10,
      tileHeight: 18,
      dropSpeed: 500,
      forceDropWaitTime: 100,
      removalAnimationTime: 500,
      keyRepeatTime: 100
    },
    arena: {
      cells: [[]],
      width: 0,
      height: 0
    },
    rowsToRemove: []
  };
  function GameState(options){
    import$(this, defaults);
    import$(this.options, options);
    this.timers.dropTimer = new Timer(this.options.dropSpeed);
    this.timers.forceDropWaitTimer = new Timer(this.options.forceDropWaitTime);
    this.timers.keyRepeatTimer = new Timer(this.options.keyRepeatTime);
    this.timers.removalAnimation = new Timer(this.options.removalAnimationTime);
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
},{"./timer":20,"std":15}],5:[function(require,module,exports){
var ref$, id, log, filter, Timer, keyRepeatTime, KEY, ACTION_NAME, eventSummary, newBlankKeystate, InputHandler, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, filter = ref$.filter;
Timer = require('./timer').Timer;
keyRepeatTime = 150;
KEY = {
  RETURN: 13,
  ESCAPE: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  Z: 90,
  X: 88,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53
};
ACTION_NAME = (ref$ = {}, ref$[KEY.RETURN + ""] = 'confirm', ref$[KEY.ESCAPE + ""] = 'cancel', ref$[KEY.SPACE + ""] = 'hard-drop', ref$[KEY.X + ""] = 'cw', ref$[KEY.Z + ""] = 'ccw', ref$[KEY.UP + ""] = 'cw', ref$[KEY.LEFT + ""] = 'left', ref$[KEY.RIGHT + ""] = 'right', ref$[KEY.DOWN + ""] = 'down', ref$[KEY.ONE + ""] = 'debug-1', ref$[KEY.TWO + ""] = 'debug-2', ref$[KEY.THREE + ""] = 'debug-3', ref$[KEY.FOUR + ""] = 'debug-4', ref$[KEY.FIVE + ""] = 'debug-5', ref$);
eventSummary = function(key, state){
  return {
    key: key,
    action: state ? 'down' : 'up'
  };
};
newBlankKeystate = function(){
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    actionA: false,
    actionB: false,
    confirm: false,
    cancel: false
  };
};
out$.InputHandler = InputHandler = (function(){
  InputHandler.displayName = 'InputHandler';
  var prototype = InputHandler.prototype, constructor = InputHandler;
  function InputHandler(){
    this.stateSetter = bind$(this, 'stateSetter', prototype);
    log("InputHandler::new");
    document.addEventListener('keydown', this.stateSetter(true));
    document.addEventListener('keyup', this.stateSetter(false));
    this.currKeystate = newBlankKeystate();
    this.lastKeystate = newBlankKeystate();
    this.keyRepeatTimer = new Timer(keyRepeatTime, true);
    this.lastHeldKey = void 8;
  }
  prototype.stateSetter = curry$((function(state, arg$){
    var which, key;
    which = arg$.which;
    if (key = ACTION_NAME[which]) {
      this.currKeystate[key] = state;
      if (state === true && this.lastHeldKey !== key) {
        this.lastHeldKey = key;
        return this.keyRepeatTimer.reset();
      }
    }
  }), true);
  prototype.changesSinceLastFrame = function(){
    var key, state, wasDifferent;
    if (this.keyRepeatTimer.expired && this.currKeystate[this.lastHeldKey] === true) {
      this.lastKeystate[this.lastHeldKey] = false;
      this.keyRepeatTimer.resetWithRemainder();
    }
    return filter(id, (function(){
      var ref$, results$ = [];
      for (key in ref$ = this.currKeystate) {
        state = ref$[key];
        wasDifferent = state !== this.lastKeystate[key];
        this.lastKeystate[key] = state;
        if (wasDifferent) {
          results$.push(eventSummary(key, state));
        }
      }
      return results$;
    }.call(this)));
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
},{"./timer":20,"std":15}],6:[function(require,module,exports){
var ref$, id, log, rand, floor, Palette, Blitter, ArenaView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand, floor = ref$.floor;
Palette = require('./palette').Palette;
Blitter = require('./blitter').Blitter;
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
  prototype.drawRowRemoval = function(width, size, y, mode){
    var i$, x, results$ = [];
    mode == null && (mode = 1);
    for (i$ = 0; i$ <= width; ++i$) {
      x = i$;
      this.cells.ctx.fillStyle = mode
        ? Palette.neutral[0]
        : Palette.neutral[3];
      results$.push(this.cells.ctx.fillRect(1 + x * size, 1 + y * size, size - 1, size - 1));
    }
    return results$;
  };
  prototype.render = function(arg$, arg1$){
    var arena, cells, width, height, rowsToRemove, timers, z, zz, p, i$, len$, rowIx, blitJitter;
    arena = arg$.arena, cells = arena.cells, width = arena.width, height = arena.height, rowsToRemove = arg$.rowsToRemove, timers = arg$.timers;
    z = arg1$.z;
    this.clear();
    zz = rowsToRemove.length;
    p = 33 + floor((255 - 33) / 4 * zz * (1 - timers.removalAnimation.progress));
    if (rowsToRemove.length > 0) {
      this.ctx.fillStyle = "rgb(" + p + "," + p + "," + p + ")";
    } else {
      this.ctx.fillStyle = Palette.neutral[3];
    }
    this.ctx.fillRect(0, 0, width * z, height * z);
    this.ctx.strokeStyle = Palette.neutral[2];
    this.ctx.strokeRect(0.5, 0.5, width * z + 1, height * z + 1);
    this.drawCells(cells, z);
    for (i$ = 0, len$ = rowsToRemove.length; i$ < len$; ++i$) {
      rowIx = rowsToRemove[i$];
      if (floor(timers.removalAnimation.currentTime) % 2) {
        this.drawRowRemoval(width, z, rowIx, 1);
      } else {
        this.drawRowRemoval(width, z, rowIx, 0);
      }
    }
    blitJitter = [rand(-zz, zz), rand(-zz, zz)];
    this.grid.blitTo(this, blitJitter[0], blitJitter[1]);
    return this.cells.blitTo(this, blitJitter[0], blitJitter[1], 0.9);
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
},{"./blitter":7,"./palette":11,"std":15}],7:[function(require,module,exports){
var ref$, id, log, Blitter, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Blitter = Blitter = (function(){
  Blitter.displayName = 'Blitter';
  var prototype = Blitter.prototype, constructor = Blitter;
  function Blitter(opts, w, h){
    this.opts = opts;
    this.w = w;
    this.h = h;
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = this.w;
    this.height = this.canvas.height = this.h;
    this.ctx = this.canvas.getContext('2d');
  }
  prototype.showDebug = function(){
    this.canvas.style.background = '#f0f';
    this.canvas.style.margin = '10px';
    this.canvas.style.border = "2px solid #0f0";
    return document.body.appendChild(this.canvas);
  };
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
  prototype.clear = function(color){
    if (color != null) {
      this.ctx.fillColor = color;
      return this.ctx.fillRect(0, 0, this.width, this.height);
    } else {
      return this.ctx.clearRect(0, 0, this.width, this.height);
    }
  };
  return Blitter;
}());
},{"std":15}],8:[function(require,module,exports){
var ref$, id, log, tileColors, Blitter, BrickView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
tileColors = require('./palette').tileColors;
Blitter = require('./blitter').Blitter;
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
},{"./blitter":7,"./palette":11,"std":15}],9:[function(require,module,exports){
var ref$, id, log, Blitter, Palette, ArenaView, BrickView, NextBrickView, StartMenuView, CanvasRenderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = require('./blitter').Blitter;
Palette = require('./palette').Palette;
ArenaView = require('./arena').ArenaView;
BrickView = require('./brick').BrickView;
NextBrickView = require('./next-brick').NextBrickView;
StartMenuView = require('./start-menu').StartMenuView;
out$.CanvasRenderer = CanvasRenderer = (function(superclass){
  var prototype = extend$((import$(CanvasRenderer, superclass).displayName = 'CanvasRenderer', CanvasRenderer), superclass).prototype, constructor = CanvasRenderer;
  function CanvasRenderer(opts){
    var z;
    this.opts = opts;
    this.z = z = this.opts.z;
    CanvasRenderer.superclass.call(this, this.opts, 17 * z, 20 * z);
    this.arena = new ArenaView(this.opts, 10 * z + 2, 18 * z + 2);
    this.brick = new BrickView(this.opts, 4 * z, 4 * z);
    this.next = new NextBrickView(this.opts, 4 * z, 4 * z);
    this.start = new StartMenuView(this.opts, 17 * z, 20 * z);
    this.outputCanvas = document.getElementById('canvas');
    this.outputCanvas.width = 17 * this.opts.z;
    this.outputCanvas.height = 20 * this.opts.z;
    this.state = {};
  }
  prototype.renderStartMenu = function(gs){
    var startMenuState;
    startMenuState = gs.startMenuState;
    this.clear();
    if (this.state.lastStartMenuIndex !== gs.startMenuState.currentIndex) {
      this.start.render(startMenuState);
    }
    this.start.blitTo(this, 0, 0);
    return this.state.lastStartMenuIndex = gs.startMenuState.currentIndex;
  };
  prototype.renderBlank = function(){
    return this.clear();
  };
  prototype.renderGame = function(gs){
    this.brick.render(gs.brick.current, this.opts);
    this.next.render(gs.brick.next, this.opts);
    this.arena.render(gs, this.opts);
    return this.collapseAll(gs);
  };
  prototype.collapseAll = function(gs){
    var pos;
    pos = gs.brick.current.pos;
    this.ctx.fillStyle = Palette.neutral[3];
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.brick.blitTo(this.arena, pos[0] * this.z, pos[1] * this.z);
    this.arena.blitTo(this, this.opts.z, this.opts.z);
    if (gs.metagameState === 'removal-animation') {
      this.flashing.blitTo(this, this.opts.z, this.opts.z);
    }
    return this.next.blitTo(this, (2 + gs.arena.width) * this.z, 1 * this.z);
  };
  prototype.render = function(gameState){
    var metagameState;
    metagameState = gameState.metagameState;
    switch (metagameState) {
    case 'start-menu':
      this.renderStartMenu(gameState);
      break;
    case 'pause':
      this.renderPauseMenu(gameState);
      break;
    case 'game':
      this.renderGame(gameState);
      break;
    case 'win':
      this.renderWinScreen(gameState);
      break;
    case 'remove-lines':
      this.renderGame(gameState);
      break;
    default:
      this.renderBlank();
    }
    return this.blitToCanvas(this.outputCanvas);
  };
  prototype.appendTo = function(host){
    return host.appendChild(this.outputCanvas);
  };
  return CanvasRenderer;
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
},{"./arena":6,"./blitter":7,"./brick":8,"./next-brick":10,"./palette":11,"./start-menu":12,"std":15}],10:[function(require,module,exports){
var ref$, id, log, BrickView, Blitter, Palette, NextBrickView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
BrickView = require('./brick').BrickView;
Blitter = require('./blitter').Blitter;
Palette = require('./palette').Palette;
out$.NextBrickView = NextBrickView = (function(superclass){
  var prototype = extend$((import$(NextBrickView, superclass).displayName = 'NextBrickView', NextBrickView), superclass).prototype, constructor = NextBrickView;
  function NextBrickView(){
    NextBrickView.superclass.apply(this, arguments);
    this.brick = new BrickView(this.opts, this.width, this.height);
  }
  prototype.prettyOffset = function(type){
    switch (type) {
    case 'square':
      return [0, 0];
    case 'zig':
      return [0.5, 0];
    case 'zag':
      return [0.5, 0];
    case 'left':
      return [0.5, 0];
    case 'right':
      return [0.5, 0];
    case 'tee':
      return [0.5, 0];
    case 'tetris':
      return [0, -0.5];
    }
  };
  prototype.renderBg = function(){
    this.ctx.fillStyle = Palette.neutral[3];
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = Palette.neutral[2];
    return this.ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);
  };
  prototype.render = function(brick){
    var ref$, x, y;
    this.clear();
    this.renderBg();
    this.brick.render(brick);
    ref$ = this.prettyOffset(brick.type), x = ref$[0], y = ref$[1];
    return this.brick.blitTo(this, x * this.opts.z, y * this.opts.z);
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
},{"./blitter":7,"./brick":8,"./palette":11,"std":15}],11:[function(require,module,exports){
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
out$.tileColors = tileColors = [neutral[2], red[0], orange[0], yellow[0], green[0], cyan[0], blue[2], magenta[0], 'white'];
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
},{}],12:[function(require,module,exports){
var ref$, id, log, floor, Blitter, TextBlitter, StartMenuView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
Blitter = require('./blitter').Blitter;
TextBlitter = require('./text-blitter').TextBlitter;
out$.StartMenuView = StartMenuView = (function(superclass){
  var prototype = extend$((import$(StartMenuView, superclass).displayName = 'StartMenuView', StartMenuView), superclass).prototype, constructor = StartMenuView;
  function StartMenuView(){
    StartMenuView.superclass.apply(this, arguments);
    this.text = new TextBlitter({}, this.w * 2 / 3, this.h / 20);
    this.title = new TextBlitter({}, this.w * 2 / 3, this.h / 10);
  }
  prototype.render = function(arg$){
    var menuData, currentIndex, i$, len$, i, entry, results$ = [];
    menuData = arg$.menuData, currentIndex = arg$.currentIndex;
    this.clear();
    for (i$ = 0, len$ = menuData.length; i$ < len$; ++i$) {
      i = i$;
      entry = menuData[i$];
      this.text.render(entry.text);
      if (i === currentIndex) {
        this.text.renderFrame();
      }
      this.text.blitTo(this, floor(this.w / 6), floor(this.h / 2 + this.h / 15 * i));
      this.title.render('TETRIS');
      results$.push(this.title.blitTo(this, this.w / 6, this.h / 6));
    }
    return results$;
  };
  return StartMenuView;
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
},{"./blitter":7,"./text-blitter":13,"std":15}],13:[function(require,module,exports){
var ref$, id, log, Blitter, TextBlitter, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = require('./blitter').Blitter;
out$.TextBlitter = TextBlitter = (function(superclass){
  var defaultFontOptions, prototype = extend$((import$(TextBlitter, superclass).displayName = 'TextBlitter', TextBlitter), superclass).prototype, constructor = TextBlitter;
  defaultFontOptions = {
    font: "14px monospace",
    textAlign: 'center'
  };
  function TextBlitter(opts, x, y){
    this.opts = opts;
    TextBlitter.superclass.apply(this, arguments);
    this.font = {
      size: y,
      family: 'monospace'
    };
    this.setFont(this.font);
    this.setAlignment('center');
    this.ctx.textBaseline = 'middle';
  }
  prototype.setFont = function(settings){
    import$(this.font, settings);
    return this.ctx.font = this.font.size + "px " + this.font.family;
  };
  prototype.setAlignment = function(alignString){
    return this.ctx.textAlign = alignString;
  };
  prototype.render = function(text, color){
    color == null && (color = 'black');
    this.clear();
    this.ctx.fillStyle = color;
    return this.ctx.fillText(text, this.w / 2, this.font.size / 2, this.w);
  };
  prototype.renderFrame = function(){
    return this.ctx.strokeRect(0.5, 0.5, this.w - 1, this.h - 1);
  };
  return TextBlitter;
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
},{"./blitter":7,"std":15}],14:[function(require,module,exports){
var ref$, id, log, el, DomRenderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
el = bind$(document, 'createElement');
out$.DomRenderer = DomRenderer = (function(){
  DomRenderer.displayName = 'DomRenderer';
  var prototype = DomRenderer.prototype, constructor = DomRenderer;
  function DomRenderer(opts){
    this.opts = opts;
    this.dom = {
      main: el('div')
    };
  }
  prototype.render = function(gameState){};
  prototype.appendTo = function(host){
    return host.appendChild(this.dom.main);
  };
  return DomRenderer;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"std":15}],15:[function(require,module,exports){
var id, log, flip, delay, floor, random, rand, randomFrom, addV2, filter, wrap, limit, raf, that, out$ = typeof exports != 'undefined' && exports || this;
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
out$.filter = filter = curry$(function(λ, list){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    x = list[i$];
    if (λ(x)) {
      results$.push(x);
    }
  }
  return results$;
});
out$.wrap = wrap = curry$(function(min, max, n){
  if (n > max) {
    return min;
  } else if (n < min) {
    return max;
  } else {
    return n;
  }
});
out$.limit = limit = curry$(function(min, max, n){
  if (n > max) {
    return max;
  } else if (n < min) {
    return min;
  } else {
    return n;
  }
});
out$.raf = raf = (that = window.requestAnimationFrame) != null
  ? that
  : (that = window.webkitRequestAnimationFrame) != null
    ? that
    : (that = window.mozRequestAnimationFrame) != null
      ? that
      : function(λ){
        return setTimeout(λ, 1000 / 60);
      };
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
},{}],16:[function(require,module,exports){
var square, zig, zag, left, right, tee, tetris, all, out$ = typeof exports != 'undefined' && exports || this;
out$.square = square = [[[0, 0, 0], [0, 1, 1], [0, 1, 1]]];
out$.zig = zig = [[[0, 0, 0], [2, 2, 0], [0, 2, 2]], [[0, 2, 0], [2, 2, 0], [2, 0, 0]]];
out$.zag = zag = [[[0, 0, 0], [0, 3, 3], [3, 3, 0]], [[3, 0, 0], [3, 3, 0], [0, 3, 0]]];
out$.left = left = [[[0, 0, 0], [4, 4, 4], [4, 0, 0]], [[4, 4, 0], [0, 4, 0], [0, 4, 0]], [[0, 0, 4], [4, 4, 4], [0, 0, 0]], [[0, 4, 0], [0, 4, 0], [0, 4, 4]]];
out$.right = right = [[[0, 0, 0], [5, 5, 5], [0, 0, 5]], [[0, 5, 0], [0, 5, 0], [5, 5, 0]], [[5, 0, 0], [5, 5, 5], [0, 0, 0]], [[0, 5, 5], [0, 5, 0], [0, 5, 0]]];
out$.tee = tee = [[[0, 0, 0], [6, 6, 6], [0, 6, 0]], [[0, 6, 0], [6, 6, 0], [0, 6, 0]], [[0, 6, 0], [6, 6, 6], [0, 0, 0]], [[0, 6, 0], [0, 6, 6], [0, 6, 0]]];
out$.tetris = tetris = [[[0, 0, 0, 0], [0, 0, 0, 0], [7, 7, 7, 7]], [[0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0]]];
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
},{}],17:[function(require,module,exports){
var ref$, id, log, addV2, rand, wrap, randomFrom, BrickShapes, canDrop, canMove, canRotate, collides, copyBrickToArena, topIsReached, isComplete, newBrick, spawnNewBrick, dropArenaRow, removeRows, clearArena, getShapeOfRotation, normaliseRotation, rotateBrick, computeScore, resetScore, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, rand = ref$.rand, wrap = ref$.wrap, randomFrom = ref$.randomFrom;
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
out$.removeRows = removeRows = function(rows, arena){
  var i$, len$, rowIx, results$ = [];
  for (i$ = 0, len$ = rows.length; i$ < len$; ++i$) {
    rowIx = rows[i$];
    results$.push(dropArenaRow(arena, rowIx));
  }
  return results$;
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
  return wrap(0, BrickShapes[type].length - 1, rotation);
};
out$.rotateBrick = rotateBrick = function(brick, dir){
  var rotation, type;
  rotation = brick.rotation, type = brick.type;
  brick.rotation = normaliseRotation(brick, brick.rotation + dir);
  return brick.shape = getShapeOfRotation(brick, brick.rotation);
};
out$.computeScore = computeScore = function(score, rows, lvl){
  lvl == null && (lvl = 0);
  switch (rows.length) {
  case 1:
    score.singles += 1;
    score.points += 40 * (lvl + 1);
    break;
  case 2:
    score.doubles += 1;
    score.points += 100 * (lvl + 1);
    break;
  case 3:
    score.triples += 1;
    score.points += 300 * (lvl + 1);
    break;
  case 4:
    score.tetris += 1;
    score.points += 1200 * (lvl + 1);
  }
  return score.lines += rows.length;
};
out$.resetScore = resetScore = function(score){
  return import$(score, {
    points: 0,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetris: 0
  });
};
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./data/brick-shapes":16,"std":15}],18:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, Core, StartMenu, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
randomFrom = require('std').randomFrom;
Core = require('./game-core');
StartMenu = require('./start-menu');
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(gameState){
    log("TetrisGame::new");
    StartMenu.primeGameState(gameState);
  }
  prototype.showFailScreen = function(gameState, Δt){
    console.debug('FAILED');
    gameState.metagameState = 'start-menu';
    return StartMenu.primeGameState(gameState);
  };
  prototype.beginNewGame = function(gameState){
    (function(){
      Core.clearArena(this.arena);
      this.brick.next = Core.newBrick();
      this.brick.next.pos = [3, -1];
      this.brick.current = Core.newBrick();
      this.brick.current.pos = [3, -1];
      Core.resetScore(this.score);
      this.metagameState = 'game';
      this.timers.dropTimer.reset();
      this.timers.keyRepeatTimer.reset();
    }.call(gameState));
    return gameState;
  };
  prototype.advanceRemovalAnimation = function(gs){
    var timers, animationState;
    timers = gs.timers, animationState = gs.animationState;
    if (timers.removalAnimation.expired) {
      Core.removeRows(gs.rowsToRemove, gs.arena);
      gs.rowsToRemove = [];
      return gs.metagameState = 'game';
    }
  };
  prototype.advanceGame = function(gs){
    var brick, arena, inputState, ref$, key, action, amt, i, completeRows, res$, i$, len$, ix, row;
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
        case 'cw':
          if (Core.canRotate(brick.current, 1, arena)) {
            Core.rotateBrick(brick.current, 1);
          }
          break;
        case 'ccw':
          if (Core.canRotate(brick.current, -1, arena)) {
            Core.rotateBrick(brick.current, -1);
          }
          break;
        case 'hard-drop':
          while (Core.canDrop(brick.current, arena)) {
            brick.current.pos[1] += 1;
          }
          gs.inputState = [];
          gs.timers.dropTimer.timeToExpiry = -1;
          break;
        case 'debug-1':
        case 'debug-2':
        case 'debug-3':
        case 'debug-4':
          amt = parseInt(key.replace(/\D/g, ''));
          log("DEBUG: Destroying rows:", amt);
          log(gs.rowsToRemove = (fn$()));
          gs.metagameState = 'remove-lines';
          gs.timers.removalAnimation.runFor(amt * 100);
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
    }
    res$ = [];
    for (i$ = 0, len$ = (ref$ = arena.cells).length; i$ < len$; ++i$) {
      ix = i$;
      row = ref$[i$];
      if (Core.isComplete(row)) {
        res$.push(ix);
      }
    }
    completeRows = res$;
    if (completeRows.length) {
      gs.metagameState = 'remove-lines';
      gs.timers.removalAnimation.runFor(completeRows.length * 100);
      gs.rowsToRemove = completeRows;
      Core.computeScore(gs.score, gs.rowsToRemove);
    }
    if (Core.topIsReached(arena)) {
      return gs.metagameState = 'failure';
    }
    function fn$(){
      var i$, to$, results$ = [];
      for (i$ = gs.arena.height - amt, to$ = gs.arena.height - 1; i$ <= to$; ++i$) {
        i = i$;
        results$.push(i);
      }
      return results$;
    }
  };
  prototype.showStartScreen = function(gs){
    var inputState, startMenuState, ref$, key, action, results$ = [];
    inputState = gs.inputState, startMenuState = gs.startMenuState;
    while (inputState.length) {
      ref$ = inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'up':
          results$.push(StartMenu.selectPrevItem(startMenuState));
          break;
        case 'down':
          results$.push(StartMenu.selectNextItem(startMenuState));
          break;
        case 'action-a':
        case 'confirm':
          if (startMenuState.currentState.state === 'start-game') {
            results$.push(this.beginNewGame(gs));
          }
        }
      } else if (action === 'up') {
        switch (key) {
        case 'down':
          results$.push(gs.forceDownMode = false);
        }
      }
    }
    return results$;
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
      gameState.metagameState = 'start-menu';
      break;
    case 'start-menu':
      this.showStartScreen.apply(this, arguments);
      break;
    case 'remove-lines':
      this.advanceRemovalAnimation.apply(this, arguments);
      break;
    default:
      console.debug('Unknown metagame-state:', metagameState);
    }
    return gameState;
  };
  return TetrisGame;
}());
module.exports = {
  TetrisGame: TetrisGame
};
},{"./game-core":17,"./start-menu":19,"std":15}],19:[function(require,module,exports){
var ref$, id, log, wrap, menuData, limiter, primeGameState, chooseOption, selectPrevItem, selectNextItem, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, wrap = ref$.wrap;
menuData = [
  {
    state: 'start-game',
    text: "Start Game"
  }, {
    state: 'nothing',
    text: "Don't Start Game"
  }
];
limiter = wrap(0, menuData.length - 1);
out$.primeGameState = primeGameState = function(gamestate){
  return gamestate.startMenuState = {
    currentIndex: 0,
    currentState: menuData[0],
    menuData: menuData
  };
};
out$.chooseOption = chooseOption = function(sms, index){
  sms.currentIndex = limiter(index);
  return sms.currentState = menuData[sms.currentIndex];
};
out$.selectPrevItem = selectPrevItem = function(sms){
  var currentIndex;
  currentIndex = sms.currentIndex;
  return chooseOption(sms, currentIndex - 1);
};
out$.selectNextItem = selectNextItem = function(sms){
  var currentIndex;
  currentIndex = sms.currentIndex;
  return chooseOption(sms, currentIndex + 1);
};
},{"std":15}],20:[function(require,module,exports){
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
  Object.defineProperty(prototype, 'progress', {
    get: function(){
      return this.currentTime / this.targetTime;
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
  prototype.stop = function(){
    this.currentTime = 0;
    return this.state = TIMER_EXPIRED;
  };
  prototype.destroy = function(){
    return allTimers.splice(allTimers.indexOf(this), 1);
  };
  prototype.runFor = function(time){
    this.timeToExpiry = time;
    return this.state = TIMER_ACTIVE;
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
},{"std":15}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2dhbWUtc3RhdGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYXJlbmEubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9uZXh0LWJyaWNrLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9yZW5kZXJlcnMvY2FudmFzL3BhbGV0dGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvc3RhcnQtbWVudS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy90ZXh0LWJsaXR0ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9kb20ubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3N0YXJ0LW1lbnUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RpbWVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgbG9nLCBkZWxheSwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGltZXIsIFRldHJpc0dhbWUsIEdhbWVTdGF0ZSwgQ2FudmFzUmVuZGVyZXIsIERvbVJlbmRlcmVyLCBEZWJ1Z091dHB1dCwgZ2FtZU9wdHMsIHJlbmRlck9wdHMsIGlucHV0SGFuZGxlciwgZ2FtZVN0YXRlLCB0ZXRyaXNHYW1lLCByZW5kZXJlcnMsIGkkLCBsZW4kLCByZW5kZXJlciwgZGVidWdPdXRwdXQsIGZyYW1lRHJpdmVyO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBsb2cgPSByZWYkLmxvZywgZGVsYXkgPSByZWYkLmRlbGF5O1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5UZXRyaXNHYW1lID0gcmVxdWlyZSgnLi90ZXRyaXMtZ2FtZScpLlRldHJpc0dhbWU7XG5HYW1lU3RhdGUgPSByZXF1aXJlKCcuL2dhbWUtc3RhdGUnKS5HYW1lU3RhdGU7XG5DYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXJzL2NhbnZhcycpLkNhbnZhc1JlbmRlcmVyO1xuRG9tUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVycy9kb20nKS5Eb21SZW5kZXJlcjtcbkRlYnVnT3V0cHV0ID0gcmVxdWlyZSgnLi9kZWJ1Zy1vdXRwdXQnKS5EZWJ1Z091dHB1dDtcbmdhbWVPcHRzID0ge1xuICB0aWxlV2lkdGg6IDEwLFxuICB0aWxlSGVpZ2h0OiAxOFxufTtcbnJlbmRlck9wdHMgPSB7XG4gIHo6IDIwXG59O1xuaW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcjtcbmdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoZ2FtZU9wdHMpO1xudGV0cmlzR2FtZSA9IG5ldyBUZXRyaXNHYW1lKGdhbWVTdGF0ZSk7XG5yZW5kZXJlcnMgPSBbbmV3IENhbnZhc1JlbmRlcmVyKHJlbmRlck9wdHMpLCBuZXcgRG9tUmVuZGVyZXIocmVuZGVyT3B0cyldO1xuZm9yIChpJCA9IDAsIGxlbiQgPSByZW5kZXJlcnMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgcmVuZGVyZXIgPSByZW5kZXJlcnNbaSRdO1xuICByZW5kZXJlci5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbn1cbmRlYnVnT3V0cHV0ID0gbmV3IERlYnVnT3V0cHV0O1xuSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgaWYgKGZyYW1lRHJpdmVyLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xuICB9XG59KTtcbmZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlbmRlcmVyO1xuICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICBnYW1lU3RhdGUuaW5wdXRTdGF0ZSA9IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKTtcbiAgVGltZXIudXBkYXRlQWxsKM6UdCk7XG4gIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUucnVuRnJhbWUoZ2FtZVN0YXRlLCDOlHQpO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gcmVuZGVyZXJzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJlbmRlcmVyID0gcmVmJFtpJF07XG4gICAgcmVuZGVyZXIucmVuZGVyKGdhbWVTdGF0ZSwgcmVuZGVyT3B0cyk7XG4gIH1cbiAgaWYgKGRlYnVnT3V0cHV0KSB7XG4gICAgcmV0dXJuIGRlYnVnT3V0cHV0LnJlbmRlcihnYW1lU3RhdGUpO1xuICB9XG59KTtcbmZyYW1lRHJpdmVyLnN0YXJ0KCk7XG5kZWxheSgxMDAwLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZ2FtZVN0YXRlLmlucHV0U3RhdGUucHVzaCh7XG4gICAga2V5OiAnbGVmdCcsXG4gICAgYWN0aW9uOiAnZG93bidcbiAgfSk7XG59KTtcbmRlbGF5KDEwMDAsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnYW1lU3RhdGUuaW5wdXRTdGF0ZS5wdXNoKHtcbiAgICBrZXk6ICdsZWZ0JyxcbiAgICBhY3Rpb246ICd1cCdcbiAgfSk7XG59KTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgdGVtcGxhdGUsIERlYnVnT3V0cHV0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xudGVtcGxhdGUgPSB7XG4gIGNlbGw6IGZ1bmN0aW9uKGl0KXtcbiAgICBpZiAoaXQpIHtcbiAgICAgIHJldHVybiBcIuKWkuKWklwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIgIFwiO1xuICAgIH1cbiAgfSxcbiAgc2NvcmU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMsIG51bGwsIDIpO1xuICB9LFxuICBicmljazogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm1hcCh0ZW1wbGF0ZS5jZWxsKS5qb2luKCcgJyk7XG4gICAgfSkuam9pbihcIlxcbiAgICAgICAgXCIpO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbGVuJCwga2V5U3VtbWFyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGhpcy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBrZXlTdW1tYXJ5ID0gdGhpc1tpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2goa2V5U3VtbWFyeS5rZXkgKyAnLScgKyBrZXlTdW1tYXJ5LmFjdGlvbiArIFwifFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiKG5vIGNoYW5nZSlcIjtcbiAgICB9XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJzY29yZSAtIFwiICsgdGVtcGxhdGUuc2NvcmUuYXBwbHkodGhpcy5zY29yZSkgKyBcIlxcbmxpbmVzIC0gXCIgKyB0aGlzLmxpbmVzICsgXCJcXG5cXG4gbWV0YSAtIFwiICsgdGhpcy5tZXRhZ2FtZVN0YXRlICsgXCJcXG4gdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuZnJhbWUgLSBcIiArIHRoaXMuZWxhcHNlZEZyYW1lcyArIFwiXFxuIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKSArIFwiXFxuIGRyb3AgLSBcIiArICh0aGlzLmZvcmNlRG93bk1vZGUgPyAnc29mdCcgOiAnYXV0bycpO1xuICB9XG59O1xub3V0JC5EZWJ1Z091dHB1dCA9IERlYnVnT3V0cHV0ID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnT3V0cHV0LmRpc3BsYXlOYW1lID0gJ0RlYnVnT3V0cHV0JztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnT3V0cHV0LnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z091dHB1dDtcbiAgZnVuY3Rpb24gRGVidWdPdXRwdXQoKXtcbiAgICB0aGlzLmRibyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kYm8pO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgc3dpdGNoIChzdGF0ZS5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJUZXh0ID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lclRleHQgPSBcIlN0YXJ0IG1lbnVcIjtcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVyVGV4dCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lclRleHQgPSBcIlVua25vd24gbWV0YWdhbWUgc3RhdGU6IFwiICsgc3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhZiwgRnJhbWVEcml2ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xub3V0JC5GcmFtZURyaXZlciA9IEZyYW1lRHJpdmVyID0gKGZ1bmN0aW9uKCl7XG4gIEZyYW1lRHJpdmVyLmRpc3BsYXlOYW1lID0gJ0ZyYW1lRHJpdmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEZyYW1lRHJpdmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZURyaXZlcjtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6ZXJvOiAwLFxuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgcnVubmluZzogZmFsc2VcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG5vdywgzpR0O1xuICAgIG5vdyA9IERhdGUubm93KCkgLSB0aGlzLnN0YXRlLnplcm87XG4gICAgzpR0ID0gbm93IC0gdGhpcy5zdGF0ZS50aW1lO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IG5vdztcbiAgICB0aGlzLnN0YXRlLmZyYW1lID0gdGhpcy5zdGF0ZS5mcmFtZSArIDE7XG4gICAgdGhpcy5vbkZyYW1lKM6UdCwgdGhpcy5zdGF0ZS50aW1lLCB0aGlzLnN0YXRlLmZyYW1lKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gcmFmKHRoaXMuZnJhbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdGFydCAtIHN0YXJ0aW5nXCIpO1xuICAgIHRoaXMuc3RhdGUuemVybyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gMDtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmZyYW1lKCk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RvcCAtIHN0b3BwaW5nXCIpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfTtcbiAgcmV0dXJuIEZyYW1lRHJpdmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCBUaW1lciwgR2FtZVN0YXRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5vdXQkLkdhbWVTdGF0ZSA9IEdhbWVTdGF0ZSA9IChmdW5jdGlvbigpe1xuICBHYW1lU3RhdGUuZGlzcGxheU5hbWUgPSAnR2FtZVN0YXRlJztcbiAgdmFyIGRlZmF1bHRzLCBwcm90b3R5cGUgPSBHYW1lU3RhdGUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEdhbWVTdGF0ZTtcbiAgZGVmYXVsdHMgPSB7XG4gICAgbWV0YWdhbWVTdGF0ZTogJ25vLWdhbWUnLFxuICAgIHNjb3JlOiB7XG4gICAgICBwb2ludHM6IDAsXG4gICAgICBsaW5lczogMCxcbiAgICAgIHNpbmdsZXM6IDAsXG4gICAgICBkb3VibGVzOiAwLFxuICAgICAgdHJpcGxlczogMCxcbiAgICAgIHRldHJpczogMFxuICAgIH0sXG4gICAgYnJpY2s6IHtcbiAgICAgIG5leHQ6IHZvaWQgOCxcbiAgICAgIGN1cnJlbnQ6IHZvaWQgOFxuICAgIH0sXG4gICAgaW5wdXRTdGF0ZTogW10sXG4gICAgZm9yY2VEb3duTW9kZTogZmFsc2UsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG4gICAgZWxhcHNlZEZyYW1lczogMCxcbiAgICB0aW1lcnM6IHtcbiAgICAgIGRyb3BUaW1lcjogbnVsbCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaWVtcjogbnVsbCxcbiAgICAgIGtleVJlcGVhdFRpbWVyOiBudWxsLFxuICAgICAgcmVtb3ZhbEFuaW1hdGlvbjogbnVsbFxuICAgIH0sXG4gICAgb3B0aW9uczoge1xuICAgICAgdGlsZVdpZHRoOiAxMCxcbiAgICAgIHRpbGVIZWlnaHQ6IDE4LFxuICAgICAgZHJvcFNwZWVkOiA1MDAsXG4gICAgICBmb3JjZURyb3BXYWl0VGltZTogMTAwLFxuICAgICAgcmVtb3ZhbEFuaW1hdGlvblRpbWU6IDUwMCxcbiAgICAgIGtleVJlcGVhdFRpbWU6IDEwMFxuICAgIH0sXG4gICAgYXJlbmE6IHtcbiAgICAgIGNlbGxzOiBbW11dLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9LFxuICAgIHJvd3NUb1JlbW92ZTogW11cbiAgfTtcbiAgZnVuY3Rpb24gR2FtZVN0YXRlKG9wdGlvbnMpe1xuICAgIGltcG9ydCQodGhpcywgZGVmYXVsdHMpO1xuICAgIGltcG9ydCQodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmRyb3BTcGVlZCk7XG4gICAgdGhpcy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5mb3JjZURyb3BXYWl0VGltZSk7XG4gICAgdGhpcy50aW1lcnMua2V5UmVwZWF0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmtleVJlcGVhdFRpbWUpO1xuICAgIHRoaXMudGltZXJzLnJlbW92YWxBbmltYXRpb24gPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLnJlbW92YWxBbmltYXRpb25UaW1lKTtcbiAgICB0aGlzLmFyZW5hID0gY29uc3RydWN0b3IubmV3QXJlbmEodGhpcy5vcHRpb25zLnRpbGVXaWR0aCwgdGhpcy5vcHRpb25zLnRpbGVIZWlnaHQpO1xuICB9XG4gIEdhbWVTdGF0ZS5uZXdBcmVuYSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpe1xuICAgIHZhciByb3csIGNlbGw7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNlbGxzOiAoZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGkkLCB0byQsIGxyZXN1bHQkLCBqJCwgdG8xJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgICAgZm9yIChpJCA9IDAsIHRvJCA9IGhlaWdodDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgICAgICByb3cgPSBpJDtcbiAgICAgICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgICAgIGZvciAoaiQgPSAwLCB0bzEkID0gd2lkdGg7IGokIDwgdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgY2VsbCA9IGokO1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCgwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgICAgfSgpKSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIEdhbWVTdGF0ZTtcbn0oKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBmaWx0ZXIsIFRpbWVyLCBrZXlSZXBlYXRUaW1lLCBLRVksIEFDVElPTl9OQU1FLCBldmVudFN1bW1hcnksIG5ld0JsYW5rS2V5c3RhdGUsIElucHV0SGFuZGxlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmlsdGVyID0gcmVmJC5maWx0ZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcbmtleVJlcGVhdFRpbWUgPSAxNTA7XG5LRVkgPSB7XG4gIFJFVFVSTjogMTMsXG4gIEVTQ0FQRTogMjcsXG4gIFNQQUNFOiAzMixcbiAgTEVGVDogMzcsXG4gIFVQOiAzOCxcbiAgUklHSFQ6IDM5LFxuICBET1dOOiA0MCxcbiAgWjogOTAsXG4gIFg6IDg4LFxuICBPTkU6IDQ5LFxuICBUV086IDUwLFxuICBUSFJFRTogNTEsXG4gIEZPVVI6IDUyLFxuICBGSVZFOiA1M1xufTtcbkFDVElPTl9OQU1FID0gKHJlZiQgPSB7fSwgcmVmJFtLRVkuUkVUVVJOICsgXCJcIl0gPSAnY29uZmlybScsIHJlZiRbS0VZLkVTQ0FQRSArIFwiXCJdID0gJ2NhbmNlbCcsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnaGFyZC1kcm9wJywgcmVmJFtLRVkuWCArIFwiXCJdID0gJ2N3JywgcmVmJFtLRVkuWiArIFwiXCJdID0gJ2NjdycsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAnY3cnLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlJJR0hUICsgXCJcIl0gPSAncmlnaHQnLCByZWYkW0tFWS5ET1dOICsgXCJcIl0gPSAnZG93bicsIHJlZiRbS0VZLk9ORSArIFwiXCJdID0gJ2RlYnVnLTEnLCByZWYkW0tFWS5UV08gKyBcIlwiXSA9ICdkZWJ1Zy0yJywgcmVmJFtLRVkuVEhSRUUgKyBcIlwiXSA9ICdkZWJ1Zy0zJywgcmVmJFtLRVkuRk9VUiArIFwiXCJdID0gJ2RlYnVnLTQnLCByZWYkW0tFWS5GSVZFICsgXCJcIl0gPSAnZGVidWctNScsIHJlZiQpO1xuZXZlbnRTdW1tYXJ5ID0gZnVuY3Rpb24oa2V5LCBzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgYWN0aW9uOiBzdGF0ZSA/ICdkb3duJyA6ICd1cCdcbiAgfTtcbn07XG5uZXdCbGFua0tleXN0YXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICB1cDogZmFsc2UsXG4gICAgZG93bjogZmFsc2UsXG4gICAgbGVmdDogZmFsc2UsXG4gICAgcmlnaHQ6IGZhbHNlLFxuICAgIGFjdGlvbkE6IGZhbHNlLFxuICAgIGFjdGlvbkI6IGZhbHNlLFxuICAgIGNvbmZpcm06IGZhbHNlLFxuICAgIGNhbmNlbDogZmFsc2VcbiAgfTtcbn07XG5vdXQkLklucHV0SGFuZGxlciA9IElucHV0SGFuZGxlciA9IChmdW5jdGlvbigpe1xuICBJbnB1dEhhbmRsZXIuZGlzcGxheU5hbWUgPSAnSW5wdXRIYW5kbGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IElucHV0SGFuZGxlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gSW5wdXRIYW5kbGVyO1xuICBmdW5jdGlvbiBJbnB1dEhhbmRsZXIoKXtcbiAgICB0aGlzLnN0YXRlU2V0dGVyID0gYmluZCQodGhpcywgJ3N0YXRlU2V0dGVyJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJJbnB1dEhhbmRsZXI6Om5ld1wiKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zdGF0ZVNldHRlcih0cnVlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnN0YXRlU2V0dGVyKGZhbHNlKSk7XG4gICAgdGhpcy5jdXJyS2V5c3RhdGUgPSBuZXdCbGFua0tleXN0YXRlKCk7XG4gICAgdGhpcy5sYXN0S2V5c3RhdGUgPSBuZXdCbGFua0tleXN0YXRlKCk7XG4gICAgdGhpcy5rZXlSZXBlYXRUaW1lciA9IG5ldyBUaW1lcihrZXlSZXBlYXRUaW1lLCB0cnVlKTtcbiAgICB0aGlzLmxhc3RIZWxkS2V5ID0gdm9pZCA4O1xuICB9XG4gIHByb3RvdHlwZS5zdGF0ZVNldHRlciA9IGN1cnJ5JCgoZnVuY3Rpb24oc3RhdGUsIGFyZyQpe1xuICAgIHZhciB3aGljaCwga2V5O1xuICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICBpZiAoa2V5ID0gQUNUSU9OX05BTUVbd2hpY2hdKSB7XG4gICAgICB0aGlzLmN1cnJLZXlzdGF0ZVtrZXldID0gc3RhdGU7XG4gICAgICBpZiAoc3RhdGUgPT09IHRydWUgJiYgdGhpcy5sYXN0SGVsZEtleSAhPT0ga2V5KSB7XG4gICAgICAgIHRoaXMubGFzdEhlbGRLZXkgPSBrZXk7XG4gICAgICAgIHJldHVybiB0aGlzLmtleVJlcGVhdFRpbWVyLnJlc2V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9KSwgdHJ1ZSk7XG4gIHByb3RvdHlwZS5jaGFuZ2VzU2luY2VMYXN0RnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBrZXksIHN0YXRlLCB3YXNEaWZmZXJlbnQ7XG4gICAgaWYgKHRoaXMua2V5UmVwZWF0VGltZXIuZXhwaXJlZCAmJiB0aGlzLmN1cnJLZXlzdGF0ZVt0aGlzLmxhc3RIZWxkS2V5XSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5sYXN0S2V5c3RhdGVbdGhpcy5sYXN0SGVsZEtleV0gPSBmYWxzZTtcbiAgICAgIHRoaXMua2V5UmVwZWF0VGltZXIucmVzZXRXaXRoUmVtYWluZGVyKCk7XG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXIoaWQsIChmdW5jdGlvbigpe1xuICAgICAgdmFyIHJlZiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGtleSBpbiByZWYkID0gdGhpcy5jdXJyS2V5c3RhdGUpIHtcbiAgICAgICAgc3RhdGUgPSByZWYkW2tleV07XG4gICAgICAgIHdhc0RpZmZlcmVudCA9IHN0YXRlICE9PSB0aGlzLmxhc3RLZXlzdGF0ZVtrZXldO1xuICAgICAgICB0aGlzLmxhc3RLZXlzdGF0ZVtrZXldID0gc3RhdGU7XG4gICAgICAgIGlmICh3YXNEaWZmZXJlbnQpIHtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGV2ZW50U3VtbWFyeShrZXksIHN0YXRlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9LmNhbGwodGhpcykpKTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIHJldHVybiBsb2coXCJJbnB1dEhhbmRsZXI6OmRlYnVnTW9kZSAtXCIsIHdoaWNoLCBBQ1RJT05fTkFNRVt3aGljaF0gfHwgJ1t1bmJvdW5kXScpO1xuICAgIH0pO1xuICB9O1xuICBJbnB1dEhhbmRsZXIub24gPSBmdW5jdGlvbihjb2RlLCDOuyl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIGlmICh3aGljaCA9PT0gY29kZSkge1xuICAgICAgICByZXR1cm4gzrsoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIElucHV0SGFuZGxlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCBmbG9vciwgUGFsZXR0ZSwgQmxpdHRlciwgQXJlbmFWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xub3V0JC5BcmVuYVZpZXcgPSBBcmVuYVZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEFyZW5hVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFWaWV3JywgQXJlbmFWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEFyZW5hVmlldztcbiAgZnVuY3Rpb24gQXJlbmFWaWV3KCl7XG4gICAgQXJlbmFWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmdyaWQgPSAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKEJsaXR0ZXIsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KTtcbiAgICB0aGlzLmNlbGxzID0gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShCbGl0dGVyLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gIH1cbiAgcHJvdG90eXBlLmRyYXdDZWxscyA9IGZ1bmN0aW9uKGNlbGxzLCBzaXplKXtcbiAgICB2YXIgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgdGlsZSwgcmVzdWx0cyQgPSBbXTtcbiAgICB0aGlzLmNlbGxzLmNsZWFyKCk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjZWxscy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gY2VsbHNbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICB0aWxlID0gcm93W2okXTtcbiAgICAgICAgaWYgKHRpbGUpIHtcbiAgICAgICAgICB0aGlzLmNlbGxzLmN0eC5maWxsU3R5bGUgPSBQYWxldHRlLnRpbGVDb2xvcnNbdGlsZV07XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmNlbGxzLmN0eC5maWxsUmVjdCgxICsgeCAqIHNpemUsIDEgKyB5ICogc2l6ZSwgc2l6ZSAtIDEsIHNpemUgLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5kcmF3R3JpZCA9IGZ1bmN0aW9uKHcsIGgsIHNpemUpe1xuICAgIHZhciBpJCwgeCwgeTtcbiAgICB0aGlzLmdyaWQuY2xlYXIoKTtcbiAgICB0aGlzLmdyaWQuY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICB0aGlzLmdyaWQuY3R4LmJlZ2luUGF0aCgpO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSB3OyArK2kkKSB7XG4gICAgICB4ID0gaSQ7XG4gICAgICB0aGlzLmdyaWQuY3R4Lm1vdmVUbyh4ICogc2l6ZSArIDAuNSwgMCk7XG4gICAgICB0aGlzLmdyaWQuY3R4LmxpbmVUbyh4ICogc2l6ZSArIDAuNSwgaCAqIHNpemUgKyAwLjUpO1xuICAgIH1cbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gaDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgdGhpcy5ncmlkLmN0eC5tb3ZlVG8oMCwgeSAqIHNpemUgKyAwLjUpO1xuICAgICAgdGhpcy5ncmlkLmN0eC5saW5lVG8odyAqIHNpemUgKyAwLjUsIHkgKiBzaXplICsgMC41KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ3JpZC5jdHguc3Ryb2tlKCk7XG4gIH07XG4gIHByb3RvdHlwZS5kcmF3Um93UmVtb3ZhbCA9IGZ1bmN0aW9uKHdpZHRoLCBzaXplLCB5LCBtb2RlKXtcbiAgICB2YXIgaSQsIHgsIHJlc3VsdHMkID0gW107XG4gICAgbW9kZSA9PSBudWxsICYmIChtb2RlID0gMSk7XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IHdpZHRoOyArK2kkKSB7XG4gICAgICB4ID0gaSQ7XG4gICAgICB0aGlzLmNlbGxzLmN0eC5maWxsU3R5bGUgPSBtb2RlXG4gICAgICAgID8gUGFsZXR0ZS5uZXV0cmFsWzBdXG4gICAgICAgIDogUGFsZXR0ZS5uZXV0cmFsWzNdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmNlbGxzLmN0eC5maWxsUmVjdCgxICsgeCAqIHNpemUsIDEgKyB5ICogc2l6ZSwgc2l6ZSAtIDEsIHNpemUgLSAxKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGFyZyQsIGFyZzEkKXtcbiAgICB2YXIgYXJlbmEsIGNlbGxzLCB3aWR0aCwgaGVpZ2h0LCByb3dzVG9SZW1vdmUsIHRpbWVycywgeiwgenosIHAsIGkkLCBsZW4kLCByb3dJeCwgYmxpdEppdHRlcjtcbiAgICBhcmVuYSA9IGFyZyQuYXJlbmEsIGNlbGxzID0gYXJlbmEuY2VsbHMsIHdpZHRoID0gYXJlbmEud2lkdGgsIGhlaWdodCA9IGFyZW5hLmhlaWdodCwgcm93c1RvUmVtb3ZlID0gYXJnJC5yb3dzVG9SZW1vdmUsIHRpbWVycyA9IGFyZyQudGltZXJzO1xuICAgIHogPSBhcmcxJC56O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB6eiA9IHJvd3NUb1JlbW92ZS5sZW5ndGg7XG4gICAgcCA9IDMzICsgZmxvb3IoKDI1NSAtIDMzKSAvIDQgKiB6eiAqICgxIC0gdGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3MpKTtcbiAgICBpZiAocm93c1RvUmVtb3ZlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwicmdiKFwiICsgcCArIFwiLFwiICsgcCArIFwiLFwiICsgcCArIFwiKVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBQYWxldHRlLm5ldXRyYWxbM107XG4gICAgfVxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoICogeiwgaGVpZ2h0ICogeik7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBQYWxldHRlLm5ldXRyYWxbMl07XG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCgwLjUsIDAuNSwgd2lkdGggKiB6ICsgMSwgaGVpZ2h0ICogeiArIDEpO1xuICAgIHRoaXMuZHJhd0NlbGxzKGNlbGxzLCB6KTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3NUb1JlbW92ZS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93SXggPSByb3dzVG9SZW1vdmVbaSRdO1xuICAgICAgaWYgKGZsb29yKHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLmN1cnJlbnRUaW1lKSAlIDIpIHtcbiAgICAgICAgdGhpcy5kcmF3Um93UmVtb3ZhbCh3aWR0aCwgeiwgcm93SXgsIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kcmF3Um93UmVtb3ZhbCh3aWR0aCwgeiwgcm93SXgsIDApO1xuICAgICAgfVxuICAgIH1cbiAgICBibGl0Sml0dGVyID0gW3JhbmQoLXp6LCB6eiksIHJhbmQoLXp6LCB6eildO1xuICAgIHRoaXMuZ3JpZC5ibGl0VG8odGhpcywgYmxpdEppdHRlclswXSwgYmxpdEppdHRlclsxXSk7XG4gICAgcmV0dXJuIHRoaXMuY2VsbHMuYmxpdFRvKHRoaXMsIGJsaXRKaXR0ZXJbMF0sIGJsaXRKaXR0ZXJbMV0sIDAuOSk7XG4gIH07XG4gIHJldHVybiBBcmVuYVZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xub3V0JC5CbGl0dGVyID0gQmxpdHRlciA9IChmdW5jdGlvbigpe1xuICBCbGl0dGVyLmRpc3BsYXlOYW1lID0gJ0JsaXR0ZXInO1xuICB2YXIgcHJvdG90eXBlID0gQmxpdHRlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQmxpdHRlcjtcbiAgZnVuY3Rpb24gQmxpdHRlcihvcHRzLCB3LCBoKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMudyA9IHc7XG4gICAgdGhpcy5oID0gaDtcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMudztcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaDtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dEZWJ1ZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuYmFja2dyb3VuZCA9ICcjZjBmJztcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5tYXJnaW4gPSAnMTBweCc7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuYm9yZGVyID0gXCIycHggc29saWQgIzBmMFwiO1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmJsaXRUbyA9IGZ1bmN0aW9uKGRlc3QsIHgsIHksIGFscGhhKXtcbiAgICB4ID09IG51bGwgJiYgKHggPSAwKTtcbiAgICB5ID09IG51bGwgJiYgKHkgPSAwKTtcbiAgICBhbHBoYSA9PSBudWxsICYmIChhbHBoYSA9IDEpO1xuICAgIGRlc3QuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgZGVzdC5jdHguZHJhd0ltYWdlKHRoaXMuY2FudmFzLCB4LCB5KTtcbiAgICByZXR1cm4gZGVzdC5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICB9O1xuICBwcm90b3R5cGUuYmxpdFRvQ2FudmFzID0gZnVuY3Rpb24oZGVzdENhbnZhcyl7XG4gICAgdmFyIGN0eDtcbiAgICBjdHggPSBkZXN0Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBkZXN0Q2FudmFzLndpZHRoLCBkZXN0Q2FudmFzLmhlaWdodCk7XG4gICAgcmV0dXJuIGN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIDAsIDAsIGRlc3RDYW52YXMud2lkdGgsIGRlc3RDYW52YXMuaGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY29sb3Ipe1xuICAgIGlmIChjb2xvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmN0eC5maWxsQ29sb3IgPSBjb2xvcjtcbiAgICAgIHJldHVybiB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIEJsaXR0ZXI7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCB0aWxlQ29sb3JzLCBCbGl0dGVyLCBCcmlja1ZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG50aWxlQ29sb3JzID0gcmVxdWlyZSgnLi9wYWxldHRlJykudGlsZUNvbG9ycztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xub3V0JC5Ccmlja1ZpZXcgPSBCcmlja1ZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2tWaWV3JywgQnJpY2tWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrVmlldztcbiAgZnVuY3Rpb24gQnJpY2tWaWV3KCl7XG4gICAgQnJpY2tWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgeSwgcm93LCBqJCwgbGVuMSQsIHgsIGNlbGw7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBicmljay5zaGFwZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRpbGVDb2xvcnNbY2VsbF07XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoeCAqIHRoaXMub3B0cy56ICsgMSwgeSAqIHRoaXMub3B0cy56ICsgMSwgdGhpcy5vcHRzLnogLSAxLCB0aGlzLm9wdHMueiAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICByZXR1cm4gQnJpY2tWaWV3O1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmxpdHRlciwgUGFsZXR0ZSwgQXJlbmFWaWV3LCBCcmlja1ZpZXcsIE5leHRCcmlja1ZpZXcsIFN0YXJ0TWVudVZpZXcsIENhbnZhc1JlbmRlcmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcbkFyZW5hVmlldyA9IHJlcXVpcmUoJy4vYXJlbmEnKS5BcmVuYVZpZXc7XG5Ccmlja1ZpZXcgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2tWaWV3O1xuTmV4dEJyaWNrVmlldyA9IHJlcXVpcmUoJy4vbmV4dC1icmljaycpLk5leHRCcmlja1ZpZXc7XG5TdGFydE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zdGFydC1tZW51JykuU3RhcnRNZW51Vmlldztcbm91dCQuQ2FudmFzUmVuZGVyZXIgPSBDYW52YXNSZW5kZXJlciA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQ2FudmFzUmVuZGVyZXIsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0NhbnZhc1JlbmRlcmVyJywgQ2FudmFzUmVuZGVyZXIpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQ2FudmFzUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIENhbnZhc1JlbmRlcmVyKG9wdHMpe1xuICAgIHZhciB6O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy56ID0geiA9IHRoaXMub3B0cy56O1xuICAgIENhbnZhc1JlbmRlcmVyLnN1cGVyY2xhc3MuY2FsbCh0aGlzLCB0aGlzLm9wdHMsIDE3ICogeiwgMjAgKiB6KTtcbiAgICB0aGlzLmFyZW5hID0gbmV3IEFyZW5hVmlldyh0aGlzLm9wdHMsIDEwICogeiArIDIsIDE4ICogeiArIDIpO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2tWaWV3KHRoaXMub3B0cywgNCAqIHosIDQgKiB6KTtcbiAgICB0aGlzLm5leHQgPSBuZXcgTmV4dEJyaWNrVmlldyh0aGlzLm9wdHMsIDQgKiB6LCA0ICogeik7XG4gICAgdGhpcy5zdGFydCA9IG5ldyBTdGFydE1lbnVWaWV3KHRoaXMub3B0cywgMTcgKiB6LCAyMCAqIHopO1xuICAgIHRoaXMub3V0cHV0Q2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICAgIHRoaXMub3V0cHV0Q2FudmFzLndpZHRoID0gMTcgKiB0aGlzLm9wdHMuejtcbiAgICB0aGlzLm91dHB1dENhbnZhcy5oZWlnaHQgPSAyMCAqIHRoaXMub3B0cy56O1xuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyU3RhcnRNZW51ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBzdGFydE1lbnVTdGF0ZTtcbiAgICBzdGFydE1lbnVTdGF0ZSA9IGdzLnN0YXJ0TWVudVN0YXRlO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5sYXN0U3RhcnRNZW51SW5kZXggIT09IGdzLnN0YXJ0TWVudVN0YXRlLmN1cnJlbnRJbmRleCkge1xuICAgICAgdGhpcy5zdGFydC5yZW5kZXIoc3RhcnRNZW51U3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLnN0YXJ0LmJsaXRUbyh0aGlzLCAwLCAwKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5sYXN0U3RhcnRNZW51SW5kZXggPSBncy5zdGFydE1lbnVTdGF0ZS5jdXJyZW50SW5kZXg7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXJCbGFuayA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY2xlYXIoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckdhbWUgPSBmdW5jdGlvbihncyl7XG4gICAgdGhpcy5icmljay5yZW5kZXIoZ3MuYnJpY2suY3VycmVudCwgdGhpcy5vcHRzKTtcbiAgICB0aGlzLm5leHQucmVuZGVyKGdzLmJyaWNrLm5leHQsIHRoaXMub3B0cyk7XG4gICAgdGhpcy5hcmVuYS5yZW5kZXIoZ3MsIHRoaXMub3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuY29sbGFwc2VBbGwoZ3MpO1xuICB9O1xuICBwcm90b3R5cGUuY29sbGFwc2VBbGwgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHBvcztcbiAgICBwb3MgPSBncy5icmljay5jdXJyZW50LnBvcztcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBQYWxldHRlLm5ldXRyYWxbM107XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuYnJpY2suYmxpdFRvKHRoaXMuYXJlbmEsIHBvc1swXSAqIHRoaXMueiwgcG9zWzFdICogdGhpcy56KTtcbiAgICB0aGlzLmFyZW5hLmJsaXRUbyh0aGlzLCB0aGlzLm9wdHMueiwgdGhpcy5vcHRzLnopO1xuICAgIGlmIChncy5tZXRhZ2FtZVN0YXRlID09PSAncmVtb3ZhbC1hbmltYXRpb24nKSB7XG4gICAgICB0aGlzLmZsYXNoaW5nLmJsaXRUbyh0aGlzLCB0aGlzLm9wdHMueiwgdGhpcy5vcHRzLnopO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZXh0LmJsaXRUbyh0aGlzLCAoMiArIGdzLmFyZW5hLndpZHRoKSAqIHRoaXMueiwgMSAqIHRoaXMueik7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMucmVuZGVyU3RhcnRNZW51KGdhbWVTdGF0ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXVzZSc6XG4gICAgICB0aGlzLnJlbmRlclBhdXNlTWVudShnYW1lU3RhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICB0aGlzLnJlbmRlckdhbWUoZ2FtZVN0YXRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3dpbic6XG4gICAgICB0aGlzLnJlbmRlcldpblNjcmVlbihnYW1lU3RhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHRoaXMucmVuZGVyR2FtZShnYW1lU3RhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMucmVuZGVyQmxhbmsoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmxpdFRvQ2FudmFzKHRoaXMub3V0cHV0Q2FudmFzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFwcGVuZFRvID0gZnVuY3Rpb24oaG9zdCl7XG4gICAgcmV0dXJuIGhvc3QuYXBwZW5kQ2hpbGQodGhpcy5vdXRwdXRDYW52YXMpO1xuICB9O1xuICByZXR1cm4gQ2FudmFzUmVuZGVyZXI7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCcmlja1ZpZXcsIEJsaXR0ZXIsIFBhbGV0dGUsIE5leHRCcmlja1ZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5Ccmlja1ZpZXcgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2tWaWV3O1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcbm91dCQuTmV4dEJyaWNrVmlldyA9IE5leHRCcmlja1ZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5leHRCcmlja1ZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ05leHRCcmlja1ZpZXcnLCBOZXh0QnJpY2tWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5leHRCcmlja1ZpZXc7XG4gIGZ1bmN0aW9uIE5leHRCcmlja1ZpZXcoKXtcbiAgICBOZXh0QnJpY2tWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmJyaWNrID0gbmV3IEJyaWNrVmlldyh0aGlzLm9wdHMsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgfVxuICBwcm90b3R5cGUucHJldHR5T2Zmc2V0ID0gZnVuY3Rpb24odHlwZSl7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgY2FzZSAnemlnJzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICd6YWcnOlxuICAgICAgcmV0dXJuIFswLjUsIDBdO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIFswLjUsIDBdO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICd0ZWUnOlxuICAgICAgcmV0dXJuIFswLjUsIDBdO1xuICAgIGNhc2UgJ3RldHJpcyc6XG4gICAgICByZXR1cm4gWzAsIC0wLjVdO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckJnID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBQYWxldHRlLm5ldXRyYWxbM107XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzJdO1xuICAgIHJldHVybiB0aGlzLmN0eC5zdHJva2VSZWN0KDAuNSwgMC41LCB0aGlzLndpZHRoIC0gMSwgdGhpcy5oZWlnaHQgLSAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICB2YXIgcmVmJCwgeCwgeTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5yZW5kZXJCZygpO1xuICAgIHRoaXMuYnJpY2sucmVuZGVyKGJyaWNrKTtcbiAgICByZWYkID0gdGhpcy5wcmV0dHlPZmZzZXQoYnJpY2sudHlwZSksIHggPSByZWYkWzBdLCB5ID0gcmVmJFsxXTtcbiAgICByZXR1cm4gdGhpcy5icmljay5ibGl0VG8odGhpcywgeCAqIHRoaXMub3B0cy56LCB5ICogdGhpcy5vcHRzLnopO1xuICB9O1xuICByZXR1cm4gTmV4dEJyaWNrVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIG5ldXRyYWwsIHJlZCwgb3JhbmdlLCBncmVlbiwgbWFnZW50YSwgYmx1ZSwgYnJvd24sIHllbGxvdywgY3lhbiwgdGlsZUNvbG9ycywgUGFsZXR0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQubmV1dHJhbCA9IG5ldXRyYWwgPSBbJyNmZmZmZmYnLCAnI2NjY2NjYycsICcjODg4ODg4JywgJyMyMTIxMjEnXTtcbm91dCQucmVkID0gcmVkID0gWycjRkY0NDQ0JywgJyNGRjc3NzcnLCAnI2RkNDQ0NCcsICcjNTUxMTExJ107XG5vdXQkLm9yYW5nZSA9IG9yYW5nZSA9IFsnI0ZGQkIzMycsICcjRkZDQzg4JywgJyNDQzg4MDAnLCAnIzU1MzMwMCddO1xub3V0JC5ncmVlbiA9IGdyZWVuID0gWycjNDRmZjY2JywgJyM4OGZmYWEnLCAnIzIyYmIzMycsICcjMTE1NTExJ107XG5vdXQkLm1hZ2VudGEgPSBtYWdlbnRhID0gWycjZmYzM2ZmJywgJyNmZmFhZmYnLCAnI2JiMjJiYicsICcjNTUxMTU1J107XG5vdXQkLmJsdWUgPSBibHVlID0gWycjNjZiYmZmJywgJyNhYWRkZmYnLCAnIzU1ODhlZScsICcjMTExMTU1J107XG5vdXQkLmJyb3duID0gYnJvd24gPSBbJyNmZmJiMzMnLCAnI2ZmY2M4OCcsICcjYmI5OTAwJywgJyM1NTU1MTEnXTtcbm91dCQueWVsbG93ID0geWVsbG93ID0gWycjZWVlZTExJywgJyNmZmZmYWEnLCAnI2NjYmIwMCcsICcjNTU1NTExJ107XG5vdXQkLmN5YW4gPSBjeWFuID0gWycjNDRkZGZmJywgJyNhYWUzZmYnLCAnIzAwYWFjYycsICcjMDA2Njk5J107XG5vdXQkLnRpbGVDb2xvcnMgPSB0aWxlQ29sb3JzID0gW25ldXRyYWxbMl0sIHJlZFswXSwgb3JhbmdlWzBdLCB5ZWxsb3dbMF0sIGdyZWVuWzBdLCBjeWFuWzBdLCBibHVlWzJdLCBtYWdlbnRhWzBdLCAnd2hpdGUnXTtcbm91dCQuUGFsZXR0ZSA9IFBhbGV0dGUgPSB7XG4gIG5ldXRyYWw6IG5ldXRyYWwsXG4gIHJlZDogcmVkLFxuICBvcmFuZ2U6IG9yYW5nZSxcbiAgeWVsbG93OiB5ZWxsb3csXG4gIGdyZWVuOiBncmVlbixcbiAgY3lhbjogY3lhbixcbiAgYmx1ZTogYmx1ZSxcbiAgbWFnZW50YTogbWFnZW50YSxcbiAgdGlsZUNvbG9yczogdGlsZUNvbG9yc1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIEJsaXR0ZXIsIFRleHRCbGl0dGVyLCBTdGFydE1lbnVWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcblRleHRCbGl0dGVyID0gcmVxdWlyZSgnLi90ZXh0LWJsaXR0ZXInKS5UZXh0QmxpdHRlcjtcbm91dCQuU3RhcnRNZW51VmlldyA9IFN0YXJ0TWVudVZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFN0YXJ0TWVudVZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1N0YXJ0TWVudVZpZXcnLCBTdGFydE1lbnVWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFN0YXJ0TWVudVZpZXc7XG4gIGZ1bmN0aW9uIFN0YXJ0TWVudVZpZXcoKXtcbiAgICBTdGFydE1lbnVWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnRleHQgPSBuZXcgVGV4dEJsaXR0ZXIoe30sIHRoaXMudyAqIDIgLyAzLCB0aGlzLmggLyAyMCk7XG4gICAgdGhpcy50aXRsZSA9IG5ldyBUZXh0QmxpdHRlcih7fSwgdGhpcy53ICogMiAvIDMsIHRoaXMuaCAvIDEwKTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIG1lbnVEYXRhLCBjdXJyZW50SW5kZXgsIGkkLCBsZW4kLCBpLCBlbnRyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBtZW51RGF0YSA9IGFyZyQubWVudURhdGEsIGN1cnJlbnRJbmRleCA9IGFyZyQuY3VycmVudEluZGV4O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IG1lbnVEYXRhLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBlbnRyeSA9IG1lbnVEYXRhW2kkXTtcbiAgICAgIHRoaXMudGV4dC5yZW5kZXIoZW50cnkudGV4dCk7XG4gICAgICBpZiAoaSA9PT0gY3VycmVudEluZGV4KSB7XG4gICAgICAgIHRoaXMudGV4dC5yZW5kZXJGcmFtZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy50ZXh0LmJsaXRUbyh0aGlzLCBmbG9vcih0aGlzLncgLyA2KSwgZmxvb3IodGhpcy5oIC8gMiArIHRoaXMuaCAvIDE1ICogaSkpO1xuICAgICAgdGhpcy50aXRsZS5yZW5kZXIoJ1RFVFJJUycpO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnRpdGxlLmJsaXRUbyh0aGlzLCB0aGlzLncgLyA2LCB0aGlzLmggLyA2KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIFN0YXJ0TWVudVZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCBUZXh0QmxpdHRlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xub3V0JC5UZXh0QmxpdHRlciA9IFRleHRCbGl0dGVyID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgZGVmYXVsdEZvbnRPcHRpb25zLCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFRleHRCbGl0dGVyLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUZXh0QmxpdHRlcicsIFRleHRCbGl0dGVyKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRleHRCbGl0dGVyO1xuICBkZWZhdWx0Rm9udE9wdGlvbnMgPSB7XG4gICAgZm9udDogXCIxNHB4IG1vbm9zcGFjZVwiLFxuICAgIHRleHRBbGlnbjogJ2NlbnRlcidcbiAgfTtcbiAgZnVuY3Rpb24gVGV4dEJsaXR0ZXIob3B0cywgeCwgeSl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBUZXh0QmxpdHRlci5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5mb250ID0ge1xuICAgICAgc2l6ZTogeSxcbiAgICAgIGZhbWlseTogJ21vbm9zcGFjZSdcbiAgICB9O1xuICAgIHRoaXMuc2V0Rm9udCh0aGlzLmZvbnQpO1xuICAgIHRoaXMuc2V0QWxpZ25tZW50KCdjZW50ZXInKTtcbiAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgfVxuICBwcm90b3R5cGUuc2V0Rm9udCA9IGZ1bmN0aW9uKHNldHRpbmdzKXtcbiAgICBpbXBvcnQkKHRoaXMuZm9udCwgc2V0dGluZ3MpO1xuICAgIHJldHVybiB0aGlzLmN0eC5mb250ID0gdGhpcy5mb250LnNpemUgKyBcInB4IFwiICsgdGhpcy5mb250LmZhbWlseTtcbiAgfTtcbiAgcHJvdG90eXBlLnNldEFsaWdubWVudCA9IGZ1bmN0aW9uKGFsaWduU3RyaW5nKXtcbiAgICByZXR1cm4gdGhpcy5jdHgudGV4dEFsaWduID0gYWxpZ25TdHJpbmc7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih0ZXh0LCBjb2xvcil7XG4gICAgY29sb3IgPT0gbnVsbCAmJiAoY29sb3IgPSAnYmxhY2snKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmZpbGxUZXh0KHRleHQsIHRoaXMudyAvIDIsIHRoaXMuZm9udC5zaXplIC8gMiwgdGhpcy53KTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jdHguc3Ryb2tlUmVjdCgwLjUsIDAuNSwgdGhpcy53IC0gMSwgdGhpcy5oIC0gMSk7XG4gIH07XG4gIHJldHVybiBUZXh0QmxpdHRlcjtcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGVsLCBEb21SZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbmVsID0gYmluZCQoZG9jdW1lbnQsICdjcmVhdGVFbGVtZW50Jyk7XG5vdXQkLkRvbVJlbmRlcmVyID0gRG9tUmVuZGVyZXIgPSAoZnVuY3Rpb24oKXtcbiAgRG9tUmVuZGVyZXIuZGlzcGxheU5hbWUgPSAnRG9tUmVuZGVyZXInO1xuICB2YXIgcHJvdG90eXBlID0gRG9tUmVuZGVyZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERvbVJlbmRlcmVyO1xuICBmdW5jdGlvbiBEb21SZW5kZXJlcihvcHRzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMuZG9tID0ge1xuICAgICAgbWFpbjogZWwoJ2RpdicpXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXt9O1xuICBwcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLmRvbS5tYWluKTtcbiAgfTtcbiAgcmV0dXJuIERvbVJlbmRlcmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciBpZCwgbG9nLCBmbGlwLCBkZWxheSwgZmxvb3IsIHJhbmRvbSwgcmFuZCwgcmFuZG9tRnJvbSwgYWRkVjIsIGZpbHRlciwgd3JhcCwgbGltaXQsIHJhZiwgdGhhdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5hZGRWMiA9IGFkZFYyID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBbYVswXSArIGJbMF0sIGFbMV0gKyBiWzFdXTtcbn07XG5vdXQkLmZpbHRlciA9IGZpbHRlciA9IGN1cnJ5JChmdW5jdGlvbijOuywgbGlzdCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsaXN0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxpc3RbaSRdO1xuICAgIGlmICjOuyh4KSkge1xuICAgICAgcmVzdWx0cyQucHVzaCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLndyYXAgPSB3cmFwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQubGltaXQgPSBsaW1pdCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLnJhZiA9IHJhZiA9ICh0aGF0ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICA/IHRoYXRcbiAgOiAodGhhdCA9IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICA/IHRoYXRcbiAgICA6ICh0aGF0ID0gd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IGZ1bmN0aW9uKM67KXtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQozrssIDEwMDAgLyA2MCk7XG4gICAgICB9O1xuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHNxdWFyZSwgemlnLCB6YWcsIGxlZnQsIHJpZ2h0LCB0ZWUsIHRldHJpcywgYWxsLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5zcXVhcmUgPSBzcXVhcmUgPSBbW1swLCAwLCAwXSwgWzAsIDEsIDFdLCBbMCwgMSwgMV1dXTtcbm91dCQuemlnID0gemlnID0gW1tbMCwgMCwgMF0sIFsyLCAyLCAwXSwgWzAsIDIsIDJdXSwgW1swLCAyLCAwXSwgWzIsIDIsIDBdLCBbMiwgMCwgMF1dXTtcbm91dCQuemFnID0gemFnID0gW1tbMCwgMCwgMF0sIFswLCAzLCAzXSwgWzMsIDMsIDBdXSwgW1szLCAwLCAwXSwgWzMsIDMsIDBdLCBbMCwgMywgMF1dXTtcbm91dCQubGVmdCA9IGxlZnQgPSBbW1swLCAwLCAwXSwgWzQsIDQsIDRdLCBbNCwgMCwgMF1dLCBbWzQsIDQsIDBdLCBbMCwgNCwgMF0sIFswLCA0LCAwXV0sIFtbMCwgMCwgNF0sIFs0LCA0LCA0XSwgWzAsIDAsIDBdXSwgW1swLCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgNF1dXTtcbm91dCQucmlnaHQgPSByaWdodCA9IFtbWzAsIDAsIDBdLCBbNSwgNSwgNV0sIFswLCAwLCA1XV0sIFtbMCwgNSwgMF0sIFswLCA1LCAwXSwgWzUsIDUsIDBdXSwgW1s1LCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgMF1dLCBbWzAsIDUsIDVdLCBbMCwgNSwgMF0sIFswLCA1LCAwXV1dO1xub3V0JC50ZWUgPSB0ZWUgPSBbW1swLCAwLCAwXSwgWzYsIDYsIDZdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgMF0sIFswLCA2LCAwXV0sIFtbMCwgNiwgMF0sIFs2LCA2LCA2XSwgWzAsIDAsIDBdXSwgW1swLCA2LCAwXSwgWzAsIDYsIDZdLCBbMCwgNiwgMF1dXTtcbm91dCQudGV0cmlzID0gdGV0cmlzID0gW1tbMCwgMCwgMCwgMF0sIFswLCAwLCAwLCAwXSwgWzcsIDcsIDcsIDddXSwgW1swLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXV1dO1xub3V0JC5hbGwgPSBhbGwgPSBbXG4gIHtcbiAgICB0eXBlOiAnc3F1YXJlJyxcbiAgICBzaGFwZXM6IHNxdWFyZVxuICB9LCB7XG4gICAgdHlwZTogJ3ppZycsXG4gICAgc2hhcGVzOiB6aWdcbiAgfSwge1xuICAgIHR5cGU6ICd6YWcnLFxuICAgIHNoYXBlczogemFnXG4gIH0sIHtcbiAgICB0eXBlOiAnbGVmdCcsXG4gICAgc2hhcGVzOiBsZWZ0XG4gIH0sIHtcbiAgICB0eXBlOiAncmlnaHQnLFxuICAgIHNoYXBlczogcmlnaHRcbiAgfSwge1xuICAgIHR5cGU6ICd0ZWUnLFxuICAgIHNoYXBlczogdGVlXG4gIH0sIHtcbiAgICB0eXBlOiAndGV0cmlzJyxcbiAgICBzaGFwZXM6IHRldHJpc1xuICB9XG5dOyIsInZhciByZWYkLCBpZCwgbG9nLCBhZGRWMiwgcmFuZCwgd3JhcCwgcmFuZG9tRnJvbSwgQnJpY2tTaGFwZXMsIGNhbkRyb3AsIGNhbk1vdmUsIGNhblJvdGF0ZSwgY29sbGlkZXMsIGNvcHlCcmlja1RvQXJlbmEsIHRvcElzUmVhY2hlZCwgaXNDb21wbGV0ZSwgbmV3QnJpY2ssIHNwYXduTmV3QnJpY2ssIGRyb3BBcmVuYVJvdywgcmVtb3ZlUm93cywgY2xlYXJBcmVuYSwgZ2V0U2hhcGVPZlJvdGF0aW9uLCBub3JtYWxpc2VSb3RhdGlvbiwgcm90YXRlQnJpY2ssIGNvbXB1dGVTY29yZSwgcmVzZXRTY29yZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kID0gcmVmJC5yYW5kLCB3cmFwID0gcmVmJC53cmFwLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLmNhbkRyb3AgPSBjYW5Ecm9wID0gZnVuY3Rpb24oYnJpY2ssIGFyZW5hKXtcbiAgcmV0dXJuIGNhbk1vdmUoYnJpY2ssIFswLCAxXSwgYXJlbmEpO1xufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuUm90YXRlID0gY2FuUm90YXRlID0gZnVuY3Rpb24oYnJpY2ssIGRpciwgYXJlbmEpe1xuICB2YXIgbmV3U2hhcGU7XG4gIG5ld1NoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBjb2xsaWRlcyhicmljay5wb3MsIG5ld1NoYXBlLCBhcmVuYSk7XG59O1xub3V0JC5jb2xsaWRlcyA9IGNvbGxpZGVzID0gZnVuY3Rpb24ocG9zLCBzaGFwZSwgYXJnJCl7XG4gIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGokLCByZWYxJCwgbGVuMSQsIHgsIHU7XG4gIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdID4gMCkge1xuICAgICAgICBpZiAodiA+PSAwKSB7XG4gICAgICAgICAgaWYgKHYgPj0gaGVpZ2h0IHx8IHUgPj0gd2lkdGggfHwgdSA8IDAgfHwgY2VsbHNbdl1bdV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLmNvcHlCcmlja1RvQXJlbmEgPSBjb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICB2YXIgcG9zLCBzaGFwZSwgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgY2VsbHMgPSBhcmcxJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gJiYgdiA+PSAwKSB7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY2VsbHNbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQudG9wSXNSZWFjaGVkID0gdG9wSXNSZWFjaGVkID0gZnVuY3Rpb24oYXJnJCl7XG4gIHZhciBjZWxscywgaSQsIHJlZiQsIGxlbiQsIGNlbGw7XG4gIGNlbGxzID0gYXJnJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLmlzQ29tcGxldGUgPSBpc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcm90YXRpb246IDAsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdLFxuICAgIHR5cGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0udHlwZSxcbiAgICBwb3M6IFswLCAwXVxuICB9O1xufTtcbm91dCQuc3Bhd25OZXdCcmljayA9IHNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihncyl7XG4gIGdzLmJyaWNrLmN1cnJlbnQgPSBncy5icmljay5uZXh0O1xuICBncy5icmljay5jdXJyZW50LnBvcyA9IFs0LCAtMV07XG4gIHJldHVybiBncy5icmljay5uZXh0ID0gbmV3QnJpY2soKTtcbn07XG5vdXQkLmRyb3BBcmVuYVJvdyA9IGRyb3BBcmVuYVJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQucmVtb3ZlUm93cyA9IHJlbW92ZVJvd3MgPSBmdW5jdGlvbihyb3dzLCBhcmVuYSl7XG4gIHZhciBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgcmVzdWx0cyQucHVzaChkcm9wQXJlbmFSb3coYXJlbmEsIHJvd0l4KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuY2xlYXJBcmVuYSA9IGNsZWFyQXJlbmEgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCBpLCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgcm93ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICBpID0gaiQ7XG4gICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2gocm93W2ldID0gMCk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmdldFNoYXBlT2ZSb3RhdGlvbiA9IGdldFNoYXBlT2ZSb3RhdGlvbiA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIHJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIEJyaWNrU2hhcGVzW2JyaWNrLnR5cGVdW3JvdGF0aW9uXTtcbn07XG5vdXQkLm5vcm1hbGlzZVJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24gPSBmdW5jdGlvbihhcmckLCByb3RhdGlvbil7XG4gIHZhciB0eXBlO1xuICB0eXBlID0gYXJnJC50eXBlO1xuICByZXR1cm4gd3JhcCgwLCBCcmlja1NoYXBlc1t0eXBlXS5sZW5ndGggLSAxLCByb3RhdGlvbik7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIGRpcil7XG4gIHZhciByb3RhdGlvbiwgdHlwZTtcbiAgcm90YXRpb24gPSBicmljay5yb3RhdGlvbiwgdHlwZSA9IGJyaWNrLnR5cGU7XG4gIGJyaWNrLnJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uICsgZGlyKTtcbiAgcmV0dXJuIGJyaWNrLnNoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbik7XG59O1xub3V0JC5jb21wdXRlU2NvcmUgPSBjb21wdXRlU2NvcmUgPSBmdW5jdGlvbihzY29yZSwgcm93cywgbHZsKXtcbiAgbHZsID09IG51bGwgJiYgKGx2bCA9IDApO1xuICBzd2l0Y2ggKHJvd3MubGVuZ3RoKSB7XG4gIGNhc2UgMTpcbiAgICBzY29yZS5zaW5nbGVzICs9IDE7XG4gICAgc2NvcmUucG9pbnRzICs9IDQwICogKGx2bCArIDEpO1xuICAgIGJyZWFrO1xuICBjYXNlIDI6XG4gICAgc2NvcmUuZG91YmxlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAxMDAgKiAobHZsICsgMSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMzpcbiAgICBzY29yZS50cmlwbGVzICs9IDE7XG4gICAgc2NvcmUucG9pbnRzICs9IDMwMCAqIChsdmwgKyAxKTtcbiAgICBicmVhaztcbiAgY2FzZSA0OlxuICAgIHNjb3JlLnRldHJpcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAxMjAwICogKGx2bCArIDEpO1xuICB9XG4gIHJldHVybiBzY29yZS5saW5lcyArPSByb3dzLmxlbmd0aDtcbn07XG5vdXQkLnJlc2V0U2NvcmUgPSByZXNldFNjb3JlID0gZnVuY3Rpb24oc2NvcmUpe1xuICByZXR1cm4gaW1wb3J0JChzY29yZSwge1xuICAgIHBvaW50czogMCxcbiAgICBsaW5lczogMCxcbiAgICBzaW5nbGVzOiAwLFxuICAgIGRvdWJsZXM6IDAsXG4gICAgdHJpcGxlczogMCxcbiAgICB0ZXRyaXM6IDBcbiAgfSk7XG59O1xuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIENvcmUsIFN0YXJ0TWVudSwgVGV0cmlzR2FtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcbnJhbmRvbUZyb20gPSByZXF1aXJlKCdzdGQnKS5yYW5kb21Gcm9tO1xuQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJyk7XG5TdGFydE1lbnUgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKTtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoZ2FtZVN0YXRlKXtcbiAgICBsb2coXCJUZXRyaXNHYW1lOjpuZXdcIik7XG4gICAgU3RhcnRNZW51LnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSk7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dGYWlsU2NyZWVuID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIGNvbnNvbGUuZGVidWcoJ0ZBSUxFRCcpO1xuICAgIGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlID0gJ3N0YXJ0LW1lbnUnO1xuICAgIHJldHVybiBTdGFydE1lbnUucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlKTtcbiAgfTtcbiAgcHJvdG90eXBlLmJlZ2luTmV3R2FtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgKGZ1bmN0aW9uKCl7XG4gICAgICBDb3JlLmNsZWFyQXJlbmEodGhpcy5hcmVuYSk7XG4gICAgICB0aGlzLmJyaWNrLm5leHQgPSBDb3JlLm5ld0JyaWNrKCk7XG4gICAgICB0aGlzLmJyaWNrLm5leHQucG9zID0gWzMsIC0xXTtcbiAgICAgIHRoaXMuYnJpY2suY3VycmVudCA9IENvcmUubmV3QnJpY2soKTtcbiAgICAgIHRoaXMuYnJpY2suY3VycmVudC5wb3MgPSBbMywgLTFdO1xuICAgICAgQ29yZS5yZXNldFNjb3JlKHRoaXMuc2NvcmUpO1xuICAgICAgdGhpcy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0KCk7XG4gICAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lci5yZXNldCgpO1xuICAgIH0uY2FsbChnYW1lU3RhdGUpKTtcbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZVJlbW92YWxBbmltYXRpb24gPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHRpbWVycywgYW5pbWF0aW9uU3RhdGU7XG4gICAgdGltZXJzID0gZ3MudGltZXJzLCBhbmltYXRpb25TdGF0ZSA9IGdzLmFuaW1hdGlvblN0YXRlO1xuICAgIGlmICh0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5leHBpcmVkKSB7XG4gICAgICBDb3JlLnJlbW92ZVJvd3MoZ3Mucm93c1RvUmVtb3ZlLCBncy5hcmVuYSk7XG4gICAgICBncy5yb3dzVG9SZW1vdmUgPSBbXTtcbiAgICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLmFkdmFuY2VHYW1lID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBicmljaywgYXJlbmEsIGlucHV0U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCBhbXQsIGksIGNvbXBsZXRlUm93cywgcmVzJCwgaSQsIGxlbiQsIGl4LCByb3c7XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzBdIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjdyc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIDEsIGFyZW5hKSkge1xuICAgICAgICAgICAgQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Njdyc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIC0xLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIENvcmUucm90YXRlQnJpY2soYnJpY2suY3VycmVudCwgLTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaGFyZC1kcm9wJzpcbiAgICAgICAgICB3aGlsZSAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMV0gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZ3MuaW5wdXRTdGF0ZSA9IFtdO1xuICAgICAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gLTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTEnOlxuICAgICAgICBjYXNlICdkZWJ1Zy0yJzpcbiAgICAgICAgY2FzZSAnZGVidWctMyc6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTQnOlxuICAgICAgICAgIGFtdCA9IHBhcnNlSW50KGtleS5yZXBsYWNlKC9cXEQvZywgJycpKTtcbiAgICAgICAgICBsb2coXCJERUJVRzogRGVzdHJveWluZyByb3dzOlwiLCBhbXQpO1xuICAgICAgICAgIGxvZyhncy5yb3dzVG9SZW1vdmUgPSAoZm4kKCkpKTtcbiAgICAgICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICAgICAgZ3MudGltZXJzLnJlbW92YWxBbmltYXRpb24ucnVuRm9yKGFtdCAqIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ3MuZm9yY2VEb3duTW9kZSAmJiBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLmV4cGlyZWQpIHtcbiAgICAgIGlmIChDb3JlLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDb3JlLmNvcHlCcmlja1RvQXJlbmEoYnJpY2suY3VycmVudCwgYXJlbmEpO1xuICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICAgIGdzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIucmVzZXQoKTtcbiAgICAgICAgZ3MudGltZXJzLmRyb3BUaW1lci50aW1lVG9FeHBpcnkgPSBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLnRhcmdldFRpbWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChncy50aW1lcnMuZHJvcFRpbWVyLmV4cGlyZWQpIHtcbiAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIucmVzZXRXaXRoUmVtYWluZGVyKCk7XG4gICAgICBpZiAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ29yZS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgQ29yZS5zcGF3bk5ld0JyaWNrKGdzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGlmIChDb3JlLmlzQ29tcGxldGUocm93KSkge1xuICAgICAgICByZXMkLnB1c2goaXgpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb21wbGV0ZVJvd3MgPSByZXMkO1xuICAgIGlmIChjb21wbGV0ZVJvd3MubGVuZ3RoKSB7XG4gICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICBncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5ydW5Gb3IoY29tcGxldGVSb3dzLmxlbmd0aCAqIDEwMCk7XG4gICAgICBncy5yb3dzVG9SZW1vdmUgPSBjb21wbGV0ZVJvd3M7XG4gICAgICBDb3JlLmNvbXB1dGVTY29yZShncy5zY29yZSwgZ3Mucm93c1RvUmVtb3ZlKTtcbiAgICB9XG4gICAgaWYgKENvcmUudG9wSXNSZWFjaGVkKGFyZW5hKSkge1xuICAgICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnZmFpbHVyZSc7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZuJCgpe1xuICAgICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gZ3MuYXJlbmEuaGVpZ2h0IC0gYW10LCB0byQgPSBncy5hcmVuYS5oZWlnaHQgLSAxOyBpJCA8PSB0byQ7ICsraSQpIHtcbiAgICAgICAgaSA9IGkkO1xuICAgICAgICByZXN1bHRzJC5wdXNoKGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNob3dTdGFydFNjcmVlbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgaW5wdXRTdGF0ZSwgc3RhcnRNZW51U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlLCBzdGFydE1lbnVTdGF0ZSA9IGdzLnN0YXJ0TWVudVN0YXRlO1xuICAgIHdoaWxlIChpbnB1dFN0YXRlLmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3RQcmV2SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3ROZXh0SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIGlmIChzdGFydE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdzdGFydC1nYW1lJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChncy5mb3JjZURvd25Nb2RlID0gZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZyYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuc2hvd0ZhaWxTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5hZHZhbmNlR2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZSA9ICdzdGFydC1tZW51JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgdGhpcy5zaG93U3RhcnRTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICB0aGlzLmFkdmFuY2VSZW1vdmFsQW5pbWF0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5kZWJ1ZygnVW5rbm93biBtZXRhZ2FtZS1zdGF0ZTonLCBtZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGdhbWVTdGF0ZTtcbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRldHJpc0dhbWU6IFRldHJpc0dhbWVcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIG1lbnVEYXRhLCBsaW1pdGVyLCBwcmltZUdhbWVTdGF0ZSwgY2hvb3NlT3B0aW9uLCBzZWxlY3RQcmV2SXRlbSwgc2VsZWN0TmV4dEl0ZW0sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHdyYXAgPSByZWYkLndyYXA7XG5tZW51RGF0YSA9IFtcbiAge1xuICAgIHN0YXRlOiAnc3RhcnQtZ2FtZScsXG4gICAgdGV4dDogXCJTdGFydCBHYW1lXCJcbiAgfSwge1xuICAgIHN0YXRlOiAnbm90aGluZycsXG4gICAgdGV4dDogXCJEb24ndCBTdGFydCBHYW1lXCJcbiAgfVxuXTtcbmxpbWl0ZXIgPSB3cmFwKDAsIG1lbnVEYXRhLmxlbmd0aCAtIDEpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ2FtZXN0YXRlKXtcbiAgcmV0dXJuIGdhbWVzdGF0ZS5zdGFydE1lbnVTdGF0ZSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGFcbiAgfTtcbn07XG5vdXQkLmNob29zZU9wdGlvbiA9IGNob29zZU9wdGlvbiA9IGZ1bmN0aW9uKHNtcywgaW5kZXgpe1xuICBzbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBzbXMuY3VycmVudFN0YXRlID0gbWVudURhdGFbc21zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCAtIDEpO1xufTtcbm91dCQuc2VsZWN0TmV4dEl0ZW0gPSBzZWxlY3ROZXh0SXRlbSA9IGZ1bmN0aW9uKHNtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IHNtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oc21zLCBjdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGZsb29yLCBhc2NpaVByb2dyZXNzQmFyLCBUaW1lciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yO1xuYXNjaWlQcm9ncmVzc0JhciA9IGN1cnJ5JChmdW5jdGlvbihsZW4sIHZhbCwgbWF4KXtcbiAgdmFyIHZhbHVlQ2hhcnMsIGVtcHR5Q2hhcnM7XG4gIHZhbCA9IHZhbCA+IG1heCA/IG1heCA6IHZhbDtcbiAgdmFsdWVDaGFycyA9IGZsb29yKGxlbiAqIHZhbCAvIG1heCk7XG4gIGVtcHR5Q2hhcnMgPSBsZW4gLSB2YWx1ZUNoYXJzO1xuICByZXR1cm4gcmVwZWF0U3RyaW5nJChcIuKWklwiLCB2YWx1ZUNoYXJzKSArIHJlcGVhdFN0cmluZyQoXCItXCIsIGVtcHR5Q2hhcnMpO1xufSk7XG5vdXQkLlRpbWVyID0gVGltZXIgPSAoZnVuY3Rpb24oKXtcbiAgVGltZXIuZGlzcGxheU5hbWUgPSAnVGltZXInO1xuICB2YXIgYWxsVGltZXJzLCBwcm9nYmFyLCByZWYkLCBUSU1FUl9BQ1RJVkUsIFRJTUVSX0VYUElSRUQsIHByb3RvdHlwZSA9IFRpbWVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaW1lcjtcbiAgYWxsVGltZXJzID0gW107XG4gIHByb2diYXIgPSBhc2NpaVByb2dyZXNzQmFyKDIxKTtcbiAgcmVmJCA9IFswLCAxXSwgVElNRVJfQUNUSVZFID0gcmVmJFswXSwgVElNRVJfRVhQSVJFRCA9IHJlZiRbMV07XG4gIGZ1bmN0aW9uIFRpbWVyKHRhcmdldFRpbWUsIGJlZ2luKXtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0YXJnZXRUaW1lICE9IG51bGwgPyB0YXJnZXRUaW1lIDogMTAwMDtcbiAgICBiZWdpbiA9PSBudWxsICYmIChiZWdpbiA9IGZhbHNlKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLnN0YXRlID0gYmVnaW4gPyBUSU1FUl9BQ1RJVkUgOiBUSU1FUl9FWFBJUkVEO1xuICAgIHRoaXMuYWN0aXZlID0gYmVnaW47XG4gICAgdGhpcy5leHBpcmVkID0gIWJlZ2luO1xuICAgIGFsbFRpbWVycy5wdXNoKHRoaXMpO1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdhY3RpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFRJTUVSX0FDVElWRTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAnZXhwaXJlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfRVhQSVJFRDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAncHJvZ3Jlc3MnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWUgLyB0aGlzLnRhcmdldFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3RpbWVUb0V4cGlyeScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRUaW1lIC0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oZXhwVGltZSl7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy50YXJnZXRUaW1lIC0gZXhwVGltZTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ozpR0KXtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUgKz0gzpR0O1xuICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWUgPj0gdGhpcy50YXJnZXRUaW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfRVhQSVJFRDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRoaXMudGFyZ2V0VGltZSk7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0V2l0aFJlbWFpbmRlciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRoaXMudGFyZ2V0VGltZSk7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWUgLSB0aW1lO1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gIH07XG4gIHByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gYWxsVGltZXJzLnNwbGljZShhbGxUaW1lcnMuaW5kZXhPZih0aGlzKSwgMSk7XG4gIH07XG4gIHByb3RvdHlwZS5ydW5Gb3IgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLnRpbWVUb0V4cGlyeSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiVElNRVI6IFwiICsgdGhpcy50YXJnZXRUaW1lICsgXCJcXG5TVEFURTogXCIgKyB0aGlzLnN0YXRlICsgXCIgKFwiICsgdGhpcy5hY3RpdmUgKyBcInxcIiArIHRoaXMuZXhwaXJlZCArIFwiKVxcblwiICsgcHJvZ2Jhcih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLnRhcmdldFRpbWUpO1xuICB9O1xuICBUaW1lci51cGRhdGVBbGwgPSBmdW5jdGlvbijOlHQpe1xuICAgIHJldHVybiBhbGxUaW1lcnMubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC51cGRhdGUozpR0KTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIFRpbWVyO1xufSgpKTtcbmZ1bmN0aW9uIHJlcGVhdFN0cmluZyQoc3RyLCBuKXtcbiAgZm9yICh2YXIgciA9ICcnOyBuID4gMDsgKG4gPj49IDEpICYmIChzdHIgKz0gc3RyKSkgaWYgKG4gJiAxKSByICs9IHN0cjtcbiAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iXX0=
