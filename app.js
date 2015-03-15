(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, Timer, TetrisGame, GameState, CanvasRenderer, DomRenderer, DebugOutput, gameOpts, renderOpts, inputHandler, gameState, tetrisGame, renderers, i$, len$, renderer, frameDriver;
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
InputHandler.on(192, function(){
  if (frameDriver.state.running) {
    return frameDriver.stop();
  } else {
    return frameDriver.start();
  }
});
frameDriver = new FrameDriver(function(Δt, time, frame){
  var i$, ref$, len$, renderer, results$ = [];
  gameState.elapsedTime = time;
  gameState.elapsedFrames = frame;
  gameState.inputState = inputHandler.changesSinceLastFrame();
  Timer.updateAll(Δt);
  gameState = tetrisGame.runFrame(gameState, Δt);
  for (i$ = 0, len$ = (ref$ = renderers).length; i$ < len$; ++i$) {
    renderer = ref$[i$];
    results$.push(renderer.render(gameState, renderOpts));
  }
  return results$;
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
  function DebugOutput(){
    this.dbo = document.createElement('pre');
    document.body.appendChild(this.dbo);
  }
  prototype.render = function(state){
    return this.dbo.innerText = template.normal.apply(state);
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
    timers: {
      dropTimer: null,
      forceDropWaitTiemr: null,
      keyRepeatTimer: null
    },
    options: {
      tileWidth: 10,
      tileHeight: 18,
      dropSpeed: 500,
      forceDropWaitTime: 100,
      keyRepeatTime: 100
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
    this.timers.keyRepeatTimer = new Timer(this.options.keyRepeatTime);
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
  X: 88
};
ACTION_NAME = (ref$ = {}, ref$[KEY.RETURN + ""] = 'confirm', ref$[KEY.ESCAPE + ""] = 'cancel', ref$[KEY.SPACE + ""] = 'action-a', ref$[KEY.X + ""] = 'action-a', ref$[KEY.Z + ""] = 'action-b', ref$[KEY.LEFT + ""] = 'left', ref$[KEY.UP + ""] = 'up', ref$[KEY.RIGHT + ""] = 'right', ref$[KEY.DOWN + ""] = 'down', ref$);
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
var ref$, id, log, Palette, Blitter, ArenaView, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
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
  prototype.clear = function(){
    return this.ctx.clearRect(0, 0, this.width, this.height);
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
var ref$, id, log, addV2, rand, wrap, randomFrom, BrickShapes, canDrop, canMove, canRotate, collides, copyBrickToArena, topIsReached, isComplete, newBrick, spawnNewBrick, dropArenaRow, clearArena, getShapeOfRotation, normaliseRotation, rotateBrick, out$ = typeof exports != 'undefined' && exports || this;
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
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
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
      this.score = 0;
      this.metagameState = 'game';
      this.timers.dropTimer.reset();
      this.timers.keyRepeatTimer.reset();
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
        case 'action-a':
          if (Core.canRotate(brick.current, 1, arena)) {
            Core.rotateBrick(brick.current, 1);
          }
          break;
        case 'action-b':
          if (Core.canRotate(brick.current, -1, arena)) {
            Core.rotateBrick(brick.current, -1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2dhbWUtc3RhdGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYXJlbmEubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9uZXh0LWJyaWNrLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9yZW5kZXJlcnMvY2FudmFzL3BhbGV0dGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvc3RhcnQtbWVudS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy90ZXh0LWJsaXR0ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9kb20ubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3N0YXJ0LW1lbnUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RpbWVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgbG9nLCBkZWxheSwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGltZXIsIFRldHJpc0dhbWUsIEdhbWVTdGF0ZSwgQ2FudmFzUmVuZGVyZXIsIERvbVJlbmRlcmVyLCBEZWJ1Z091dHB1dCwgZ2FtZU9wdHMsIHJlbmRlck9wdHMsIGlucHV0SGFuZGxlciwgZ2FtZVN0YXRlLCB0ZXRyaXNHYW1lLCByZW5kZXJlcnMsIGkkLCBsZW4kLCByZW5kZXJlciwgZnJhbWVEcml2ZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5GcmFtZURyaXZlciA9IHJlcXVpcmUoJy4vZnJhbWUtZHJpdmVyJykuRnJhbWVEcml2ZXI7XG5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2lucHV0LWhhbmRsZXInKS5JbnB1dEhhbmRsZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcblRldHJpc0dhbWUgPSByZXF1aXJlKCcuL3RldHJpcy1nYW1lJykuVGV0cmlzR2FtZTtcbkdhbWVTdGF0ZSA9IHJlcXVpcmUoJy4vZ2FtZS1zdGF0ZScpLkdhbWVTdGF0ZTtcbkNhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcnMvY2FudmFzJykuQ2FudmFzUmVuZGVyZXI7XG5Eb21SZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXJzL2RvbScpLkRvbVJlbmRlcmVyO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuZ2FtZU9wdHMgPSB7XG4gIHRpbGVXaWR0aDogMTAsXG4gIHRpbGVIZWlnaHQ6IDE4XG59O1xucmVuZGVyT3B0cyA9IHtcbiAgejogMjBcbn07XG5pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xuZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZShnYW1lT3B0cyk7XG50ZXRyaXNHYW1lID0gbmV3IFRldHJpc0dhbWUoZ2FtZVN0YXRlKTtcbnJlbmRlcmVycyA9IFtuZXcgQ2FudmFzUmVuZGVyZXIocmVuZGVyT3B0cyksIG5ldyBEb21SZW5kZXJlcihyZW5kZXJPcHRzKV07XG5mb3IgKGkkID0gMCwgbGVuJCA9IHJlbmRlcmVycy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICByZW5kZXJlciA9IHJlbmRlcmVyc1tpJF07XG4gIHJlbmRlcmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xufVxuSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgaWYgKGZyYW1lRHJpdmVyLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xuICB9XG59KTtcbmZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlbmRlcmVyLCByZXN1bHRzJCA9IFtdO1xuICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICBnYW1lU3RhdGUuaW5wdXRTdGF0ZSA9IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKTtcbiAgVGltZXIudXBkYXRlQWxsKM6UdCk7XG4gIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUucnVuRnJhbWUoZ2FtZVN0YXRlLCDOlHQpO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gcmVuZGVyZXJzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJlbmRlcmVyID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChyZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlLCByZW5kZXJPcHRzKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5mcmFtZURyaXZlci5zdGFydCgpO1xuZGVsYXkoMTAwMCwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5pbnB1dFN0YXRlLnB1c2goe1xuICAgIGtleTogJ2xlZnQnLFxuICAgIGFjdGlvbjogJ2Rvd24nXG4gIH0pO1xufSk7XG5kZWxheSgxMDAwLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZ2FtZVN0YXRlLmlucHV0U3RhdGUucHVzaCh7XG4gICAga2V5OiAnbGVmdCcsXG4gICAgYWN0aW9uOiAndXAnXG4gIH0pO1xufSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHRlbXBsYXRlLCBEZWJ1Z091dHB1dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbnRlbXBsYXRlID0ge1xuICBjZWxsOiBmdW5jdGlvbihpdCl7XG4gICAgaWYgKGl0KSB7XG4gICAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiICBcIjtcbiAgICB9XG4gIH0sXG4gIGJyaWNrOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQubWFwKHRlbXBsYXRlLmNlbGwpLmpvaW4oJyAnKTtcbiAgICB9KS5qb2luKFwiXFxuICAgICAgICBcIik7XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBrZXlTdW1tYXJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0aGlzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGtleVN1bW1hcnkgPSB0aGlzW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChrZXlTdW1tYXJ5LmtleSArICctJyArIGtleVN1bW1hcnkuYWN0aW9uICsgXCJ8XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIobm8gY2hhbmdlKVwiO1xuICAgIH1cbiAgfSxcbiAgbm9ybWFsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIiAgTkVYVCA6XFxuXCIgKyB0ZW1wbGF0ZS5icmljay5hcHBseSh0aGlzLmJyaWNrLm5leHQpICsgXCJcXG5cXG4gc2NvcmUgLSBcIiArIHRoaXMuc2NvcmUgKyBcIlxcbiBsaW5lcyAtIFwiICsgdGhpcy5saW5lcyArIFwiXFxuXFxuICBtZXRhIC0gXCIgKyB0aGlzLm1ldGFnYW1lU3RhdGUgKyBcIlxcbiAgdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuIGZyYW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRGcmFtZXMgKyBcIlxcbiAga2V5cyAtIFwiICsgdGVtcGxhdGUua2V5cy5hcHBseSh0aGlzLmlucHV0U3RhdGUpICsgXCJcXG4gIGRyb3AgLSBcIiArICh0aGlzLmZvcmNlRG93bk1vZGUgPyAnZm9yY2UnIDogJ2F1dG8nKSArIFwiXFxuXFxuXCI7XG4gIH1cbn07XG5vdXQkLkRlYnVnT3V0cHV0ID0gRGVidWdPdXRwdXQgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdPdXRwdXQuZGlzcGxheU5hbWUgPSAnRGVidWdPdXRwdXQnO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdPdXRwdXQucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnT3V0cHV0O1xuICBmdW5jdGlvbiBEZWJ1Z091dHB1dCgpe1xuICAgIHRoaXMuZGJvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRibyk7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJUZXh0ID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgfTtcbiAgcmV0dXJuIERlYnVnT3V0cHV0O1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFmLCBGcmFtZURyaXZlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFmID0gcmVmJC5yYWY7XG5vdXQkLkZyYW1lRHJpdmVyID0gRnJhbWVEcml2ZXIgPSAoZnVuY3Rpb24oKXtcbiAgRnJhbWVEcml2ZXIuZGlzcGxheU5hbWUgPSAnRnJhbWVEcml2ZXInO1xuICB2YXIgcHJvdG90eXBlID0gRnJhbWVEcml2ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lRHJpdmVyO1xuICBmdW5jdGlvbiBGcmFtZURyaXZlcihvbkZyYW1lKXtcbiAgICB0aGlzLm9uRnJhbWUgPSBvbkZyYW1lO1xuICAgIHRoaXMuZnJhbWUgPSBiaW5kJCh0aGlzLCAnZnJhbWUnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpuZXdcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHplcm86IDAsXG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICBydW5uaW5nOiBmYWxzZVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbm93LCDOlHQ7XG4gICAgbm93ID0gRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuemVybztcbiAgICDOlHQgPSBub3cgLSB0aGlzLnN0YXRlLnRpbWU7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gbm93O1xuICAgIHRoaXMuc3RhdGUuZnJhbWUgPSB0aGlzLnN0YXRlLmZyYW1lICsgMTtcbiAgICB0aGlzLm9uRnJhbWUozpR0LCB0aGlzLnN0YXRlLnRpbWUsIHRoaXMuc3RhdGUuZnJhbWUpO1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICAgIHJldHVybiByYWYodGhpcy5mcmFtZSk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS56ZXJvID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUucnVubmluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdG9wIC0gc3RvcHBpbmdcIik7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucnVubmluZyA9IGZhbHNlO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIFRpbWVyLCBHYW1lU3RhdGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcbm91dCQuR2FtZVN0YXRlID0gR2FtZVN0YXRlID0gKGZ1bmN0aW9uKCl7XG4gIEdhbWVTdGF0ZS5kaXNwbGF5TmFtZSA9ICdHYW1lU3RhdGUnO1xuICB2YXIgZGVmYXVsdHMsIHByb3RvdHlwZSA9IEdhbWVTdGF0ZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR2FtZVN0YXRlO1xuICBkZWZhdWx0cyA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gICAgc2NvcmU6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgYnJpY2s6IHtcbiAgICAgIG5leHQ6IHZvaWQgOCxcbiAgICAgIGN1cnJlbnQ6IHZvaWQgOFxuICAgIH0sXG4gICAgaW5wdXRTdGF0ZTogW10sXG4gICAgZm9yY2VEb3duTW9kZTogZmFsc2UsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG4gICAgZWxhcHNlZEZyYW1lczogMCxcbiAgICB0aW1lcnM6IHtcbiAgICAgIGRyb3BUaW1lcjogbnVsbCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaWVtcjogbnVsbCxcbiAgICAgIGtleVJlcGVhdFRpbWVyOiBudWxsXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICB0aWxlV2lkdGg6IDEwLFxuICAgICAgdGlsZUhlaWdodDogMTgsXG4gICAgICBkcm9wU3BlZWQ6IDUwMCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaW1lOiAxMDAsXG4gICAgICBrZXlSZXBlYXRUaW1lOiAxMDBcbiAgICB9LFxuICAgIGFyZW5hOiB7XG4gICAgICBjZWxsczogW1tdXSxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBHYW1lU3RhdGUob3B0aW9ucyl7XG4gICAgaW1wb3J0JCh0aGlzLCBkZWZhdWx0cyk7XG4gICAgaW1wb3J0JCh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIHRoaXMudGltZXJzLmRyb3BUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuZHJvcFNwZWVkKTtcbiAgICB0aGlzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmZvcmNlRHJvcFdhaXRUaW1lKTtcbiAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMua2V5UmVwZWF0VGltZSk7XG4gICAgdGhpcy5hcmVuYSA9IGNvbnN0cnVjdG9yLm5ld0FyZW5hKHRoaXMub3B0aW9ucy50aWxlV2lkdGgsIHRoaXMub3B0aW9ucy50aWxlSGVpZ2h0KTtcbiAgfVxuICBHYW1lU3RhdGUubmV3QXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KXtcbiAgICB2YXIgcm93LCBjZWxsO1xuICAgIHJldHVybiB7XG4gICAgICBjZWxsczogKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpJCwgdG8kLCBscmVzdWx0JCwgaiQsIHRvMSQsIHJlc3VsdHMkID0gW107XG4gICAgICAgIGZvciAoaSQgPSAwLCB0byQgPSBoZWlnaHQ7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICAgICAgcm93ID0gaSQ7XG4gICAgICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IHdpZHRoOyBqJCA8IHRvMSQ7ICsraiQpIHtcbiAgICAgICAgICAgIGNlbGwgPSBqJDtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICAgIH0oKSksXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH07XG4gIH07XG4gIHJldHVybiBHYW1lU3RhdGU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmlsdGVyLCBUaW1lciwga2V5UmVwZWF0VGltZSwgS0VZLCBBQ1RJT05fTkFNRSwgZXZlbnRTdW1tYXJ5LCBuZXdCbGFua0tleXN0YXRlLCBJbnB1dEhhbmRsZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZpbHRlciA9IHJlZiQuZmlsdGVyO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5rZXlSZXBlYXRUaW1lID0gMTUwO1xuS0VZID0ge1xuICBSRVRVUk46IDEzLFxuICBFU0NBUEU6IDI3LFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDAsXG4gIFo6IDkwLFxuICBYOiA4OFxufTtcbkFDVElPTl9OQU1FID0gKHJlZiQgPSB7fSwgcmVmJFtLRVkuUkVUVVJOICsgXCJcIl0gPSAnY29uZmlybScsIHJlZiRbS0VZLkVTQ0FQRSArIFwiXCJdID0gJ2NhbmNlbCcsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnYWN0aW9uLWEnLCByZWYkW0tFWS5YICsgXCJcIl0gPSAnYWN0aW9uLWEnLCByZWYkW0tFWS5aICsgXCJcIl0gPSAnYWN0aW9uLWInLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAndXAnLCByZWYkW0tFWS5SSUdIVCArIFwiXCJdID0gJ3JpZ2h0JywgcmVmJFtLRVkuRE9XTiArIFwiXCJdID0gJ2Rvd24nLCByZWYkKTtcbmV2ZW50U3VtbWFyeSA9IGZ1bmN0aW9uKGtleSwgc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIGFjdGlvbjogc3RhdGUgPyAnZG93bicgOiAndXAnXG4gIH07XG59O1xubmV3QmxhbmtLZXlzdGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgdXA6IGZhbHNlLFxuICAgIGRvd246IGZhbHNlLFxuICAgIGxlZnQ6IGZhbHNlLFxuICAgIHJpZ2h0OiBmYWxzZSxcbiAgICBhY3Rpb25BOiBmYWxzZSxcbiAgICBhY3Rpb25COiBmYWxzZSxcbiAgICBjb25maXJtOiBmYWxzZSxcbiAgICBjYW5jZWw6IGZhbHNlXG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zdGF0ZVNldHRlciA9IGJpbmQkKHRoaXMsICdzdGF0ZVNldHRlcicsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiSW5wdXRIYW5kbGVyOjpuZXdcIik7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc3RhdGVTZXR0ZXIodHJ1ZSkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5zdGF0ZVNldHRlcihmYWxzZSkpO1xuICAgIHRoaXMuY3VycktleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICAgIHRoaXMubGFzdEtleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICAgIHRoaXMua2V5UmVwZWF0VGltZXIgPSBuZXcgVGltZXIoa2V5UmVwZWF0VGltZSwgdHJ1ZSk7XG4gICAgdGhpcy5sYXN0SGVsZEtleSA9IHZvaWQgODtcbiAgfVxuICBwcm90b3R5cGUuc3RhdGVTZXR0ZXIgPSBjdXJyeSQoKGZ1bmN0aW9uKHN0YXRlLCBhcmckKXtcbiAgICB2YXIgd2hpY2gsIGtleTtcbiAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgaWYgKGtleSA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgdGhpcy5jdXJyS2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgaWYgKHN0YXRlID09PSB0cnVlICYmIHRoaXMubGFzdEhlbGRLZXkgIT09IGtleSkge1xuICAgICAgICB0aGlzLmxhc3RIZWxkS2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlSZXBlYXRUaW1lci5yZXNldCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSksIHRydWUpO1xuICBwcm90b3R5cGUuY2hhbmdlc1NpbmNlTGFzdEZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIga2V5LCBzdGF0ZSwgd2FzRGlmZmVyZW50O1xuICAgIGlmICh0aGlzLmtleVJlcGVhdFRpbWVyLmV4cGlyZWQgJiYgdGhpcy5jdXJyS2V5c3RhdGVbdGhpcy5sYXN0SGVsZEtleV0gPT09IHRydWUpIHtcbiAgICAgIHRoaXMubGFzdEtleXN0YXRlW3RoaXMubGFzdEhlbGRLZXldID0gZmFsc2U7XG4gICAgICB0aGlzLmtleVJlcGVhdFRpbWVyLnJlc2V0V2l0aFJlbWFpbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyKGlkLCAoZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZWYkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gcmVmJCA9IHRoaXMuY3VycktleXN0YXRlKSB7XG4gICAgICAgIHN0YXRlID0gcmVmJFtrZXldO1xuICAgICAgICB3YXNEaWZmZXJlbnQgPSBzdGF0ZSAhPT0gdGhpcy5sYXN0S2V5c3RhdGVba2V5XTtcbiAgICAgICAgdGhpcy5sYXN0S2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgICBpZiAod2FzRGlmZmVyZW50KSB7XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChldmVudFN1bW1hcnkoa2V5LCBzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5kZWJ1Z01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICByZXR1cm4gbG9nKFwiSW5wdXRIYW5kbGVyOjpkZWJ1Z01vZGUgLVwiLCB3aGljaCwgQUNUSU9OX05BTUVbd2hpY2hdIHx8ICdbdW5ib3VuZF0nKTtcbiAgICB9KTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLm9uID0gZnVuY3Rpb24oY29kZSwgzrspe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICBpZiAod2hpY2ggPT09IGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIM67KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBJbnB1dEhhbmRsZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgUGFsZXR0ZSwgQmxpdHRlciwgQXJlbmFWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcbm91dCQuQXJlbmFWaWV3ID0gQXJlbmFWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYVZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0FyZW5hVmlldycsIEFyZW5hVmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYVZpZXc7XG4gIGZ1bmN0aW9uIEFyZW5hVmlldygpe1xuICAgIEFyZW5hVmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5ncmlkID0gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShCbGl0dGVyLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gICAgdGhpcy5jZWxscyA9IChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoQmxpdHRlciwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pO1xuICB9XG4gIHByb3RvdHlwZS5kcmF3Q2VsbHMgPSBmdW5jdGlvbihjZWxscywgc2l6ZSl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIHRpbGUsIHJlc3VsdHMkID0gW107XG4gICAgdGhpcy5jZWxscy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY2VsbHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGNlbGxzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgIGlmICh0aWxlKSB7XG4gICAgICAgICAgdGhpcy5jZWxscy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS50aWxlQ29sb3JzW3RpbGVdO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2godGhpcy5jZWxscy5jdHguZmlsbFJlY3QoMSArIHggKiBzaXplLCAxICsgeSAqIHNpemUsIHNpemUgLSAxLCBzaXplIC0gMSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuZHJhd0dyaWQgPSBmdW5jdGlvbih3LCBoLCBzaXplKXtcbiAgICB2YXIgaSQsIHgsIHk7XG4gICAgdGhpcy5ncmlkLmNsZWFyKCk7XG4gICAgdGhpcy5ncmlkLmN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgdGhpcy5ncmlkLmN0eC5iZWdpblBhdGgoKTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gdzsgKytpJCkge1xuICAgICAgeCA9IGkkO1xuICAgICAgdGhpcy5ncmlkLmN0eC5tb3ZlVG8oeCAqIHNpemUgKyAwLjUsIDApO1xuICAgICAgdGhpcy5ncmlkLmN0eC5saW5lVG8oeCAqIHNpemUgKyAwLjUsIGggKiBzaXplICsgMC41KTtcbiAgICB9XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IGg7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHRoaXMuZ3JpZC5jdHgubW92ZVRvKDAsIHkgKiBzaXplICsgMC41KTtcbiAgICAgIHRoaXMuZ3JpZC5jdHgubGluZVRvKHcgKiBzaXplICsgMC41LCB5ICogc2l6ZSArIDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdyaWQuY3R4LnN0cm9rZSgpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICAgIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgejtcbiAgICBjZWxscyA9IGFyZyQuY2VsbHMsIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQ7XG4gICAgeiA9IGFyZzEkLno7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCAqIHosIGhlaWdodCAqIHopO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzJdO1xuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoMC41LCAwLjUsIHdpZHRoICogeiArIDEsIGhlaWdodCAqIHogKyAxKTtcbiAgICB0aGlzLmRyYXdDZWxscyhjZWxscywgeik7XG4gICAgdGhpcy5ncmlkLmJsaXRUbyh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5jZWxscy5ibGl0VG8odGhpcywgMCwgMCwgMC45KTtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJsaXR0ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5vdXQkLkJsaXR0ZXIgPSBCbGl0dGVyID0gKGZ1bmN0aW9uKCl7XG4gIEJsaXR0ZXIuZGlzcGxheU5hbWUgPSAnQmxpdHRlcic7XG4gIHZhciBwcm90b3R5cGUgPSBCbGl0dGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCbGl0dGVyO1xuICBmdW5jdGlvbiBCbGl0dGVyKG9wdHMsIHcsIGgpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy53ID0gdztcbiAgICB0aGlzLmggPSBoO1xuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0RlYnVnID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmMGYnO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLm1hcmdpbiA9ICcxMHB4JztcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5ib3JkZXIgPSBcIjJweCBzb2xpZCAjMGYwXCI7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuICB9O1xuICBwcm90b3R5cGUuYmxpdFRvID0gZnVuY3Rpb24oZGVzdCwgeCwgeSwgYWxwaGEpe1xuICAgIHggPT0gbnVsbCAmJiAoeCA9IDApO1xuICAgIHkgPT0gbnVsbCAmJiAoeSA9IDApO1xuICAgIGFscGhhID09IG51bGwgJiYgKGFscGhhID0gMSk7XG4gICAgZGVzdC5jdHguZ2xvYmFsQWxwaGEgPSBhbHBoYTtcbiAgICBkZXN0LmN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIHgsIHkpO1xuICAgIHJldHVybiBkZXN0LmN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gIH07XG4gIHByb3RvdHlwZS5ibGl0VG9DYW52YXMgPSBmdW5jdGlvbihkZXN0Q2FudmFzKXtcbiAgICB2YXIgY3R4O1xuICAgIGN0eCA9IGRlc3RDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGRlc3RDYW52YXMud2lkdGgsIGRlc3RDYW52YXMuaGVpZ2h0KTtcbiAgICByZXR1cm4gY3R4LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgMCwgMCwgZGVzdENhbnZhcy53aWR0aCwgZGVzdENhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICB9O1xuICByZXR1cm4gQmxpdHRlcjtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHRpbGVDb2xvcnMsIEJsaXR0ZXIsIEJyaWNrVmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbnRpbGVDb2xvcnMgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS50aWxlQ29sb3JzO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5vdXQkLkJyaWNrVmlldyA9IEJyaWNrVmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQnJpY2tWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmlja1ZpZXcnLCBCcmlja1ZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQnJpY2tWaWV3O1xuICBmdW5jdGlvbiBCcmlja1ZpZXcoKXtcbiAgICBCcmlja1ZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCB5LCByb3csIGokLCBsZW4xJCwgeCwgY2VsbDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGJyaWNrLnNoYXBlKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGlsZUNvbG9yc1tjZWxsXTtcbiAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh4ICogdGhpcy5vcHRzLnogKyAxLCB5ICogdGhpcy5vcHRzLnogKyAxLCB0aGlzLm9wdHMueiAtIDEsIHRoaXMub3B0cy56IC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHJldHVybiBCcmlja1ZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCBQYWxldHRlLCBBcmVuYVZpZXcsIEJyaWNrVmlldywgTmV4dEJyaWNrVmlldywgU3RhcnRNZW51VmlldywgQ2FudmFzUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuQXJlbmFWaWV3ID0gcmVxdWlyZSgnLi9hcmVuYScpLkFyZW5hVmlldztcbkJyaWNrVmlldyA9IHJlcXVpcmUoJy4vYnJpY2snKS5Ccmlja1ZpZXc7XG5OZXh0QnJpY2tWaWV3ID0gcmVxdWlyZSgnLi9uZXh0LWJyaWNrJykuTmV4dEJyaWNrVmlldztcblN0YXJ0TWVudVZpZXcgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKS5TdGFydE1lbnVWaWV3O1xub3V0JC5DYW52YXNSZW5kZXJlciA9IENhbnZhc1JlbmRlcmVyID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChDYW52YXNSZW5kZXJlciwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQ2FudmFzUmVuZGVyZXInLCBDYW52YXNSZW5kZXJlciksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBDYW52YXNSZW5kZXJlcjtcbiAgZnVuY3Rpb24gQ2FudmFzUmVuZGVyZXIob3B0cyl7XG4gICAgdmFyIHo7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnogPSB6ID0gdGhpcy5vcHRzLno7XG4gICAgQ2FudmFzUmVuZGVyZXIuc3VwZXJjbGFzcy5jYWxsKHRoaXMsIHRoaXMub3B0cywgMTcgKiB6LCAyMCAqIHopO1xuICAgIHRoaXMuYXJlbmEgPSBuZXcgQXJlbmFWaWV3KHRoaXMub3B0cywgMTAgKiB6ICsgMiwgMTggKiB6ICsgMik7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmlja1ZpZXcodGhpcy5vcHRzLCA0ICogeiwgNCAqIHopO1xuICAgIHRoaXMubmV4dCA9IG5ldyBOZXh0QnJpY2tWaWV3KHRoaXMub3B0cywgNCAqIHosIDQgKiB6KTtcbiAgICB0aGlzLnN0YXJ0ID0gbmV3IFN0YXJ0TWVudVZpZXcodGhpcy5vcHRzLCAxNyAqIHosIDIwICogeik7XG4gICAgdGhpcy5vdXRwdXRDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG4gICAgdGhpcy5vdXRwdXRDYW52YXMud2lkdGggPSAxNyAqIHRoaXMub3B0cy56O1xuICAgIHRoaXMub3V0cHV0Q2FudmFzLmhlaWdodCA9IDIwICogdGhpcy5vcHRzLno7XG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXJTdGFydE1lbnUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHN0YXJ0TWVudVN0YXRlO1xuICAgIHN0YXJ0TWVudVN0YXRlID0gZ3Muc3RhcnRNZW51U3RhdGU7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIGlmICh0aGlzLnN0YXRlLmxhc3RTdGFydE1lbnVJbmRleCAhPT0gZ3Muc3RhcnRNZW51U3RhdGUuY3VycmVudEluZGV4KSB7XG4gICAgICB0aGlzLnN0YXJ0LnJlbmRlcihzdGFydE1lbnVTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuc3RhcnQuYmxpdFRvKHRoaXMsIDAsIDApO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmxhc3RTdGFydE1lbnVJbmRleCA9IGdzLnN0YXJ0TWVudVN0YXRlLmN1cnJlbnRJbmRleDtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckJsYW5rID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jbGVhcigpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihncy5icmljay5jdXJyZW50LCB0aGlzLm9wdHMpO1xuICAgIHRoaXMubmV4dC5yZW5kZXIoZ3MuYnJpY2submV4dCwgdGhpcy5vcHRzKTtcbiAgICB0aGlzLmFyZW5hLnJlbmRlcihncy5hcmVuYSwgdGhpcy5vcHRzKTtcbiAgICByZXR1cm4gdGhpcy5jb2xsYXBzZUFsbChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5jb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcG9zO1xuICAgIHBvcyA9IGdzLmJyaWNrLmN1cnJlbnQucG9zO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5icmljay5ibGl0VG8odGhpcy5hcmVuYSwgcG9zWzBdICogdGhpcy56LCBwb3NbMV0gKiB0aGlzLnopO1xuICAgIHRoaXMuYXJlbmEuYmxpdFRvKHRoaXMsIHRoaXMub3B0cy56LCB0aGlzLm9wdHMueik7XG4gICAgcmV0dXJuIHRoaXMubmV4dC5ibGl0VG8odGhpcywgKDIgKyBncy5hcmVuYS53aWR0aCkgKiB0aGlzLnosIDEgKiB0aGlzLnopO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICB2YXIgbWV0YWdhbWVTdGF0ZTtcbiAgICBtZXRhZ2FtZVN0YXRlID0gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnJlbmRlclN0YXJ0TWVudShnYW1lU3RhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF1c2UnOlxuICAgICAgdGhpcy5yZW5kZXJQYXVzZU1lbnUoZ2FtZVN0YXRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5yZW5kZXJHYW1lKGdhbWVTdGF0ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3aW4nOlxuICAgICAgdGhpcy5yZW5kZXJXaW5TY3JlZW4oZ2FtZVN0YXRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLnJlbmRlckJsYW5rKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJsaXRUb0NhbnZhcyh0aGlzLm91dHB1dENhbnZhcyk7XG4gIH07XG4gIHByb3RvdHlwZS5hcHBlbmRUbyA9IGZ1bmN0aW9uKGhvc3Qpe1xuICAgIHJldHVybiBob3N0LmFwcGVuZENoaWxkKHRoaXMub3V0cHV0Q2FudmFzKTtcbiAgfTtcbiAgcmV0dXJuIENhbnZhc1JlbmRlcmVyO1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQnJpY2tWaWV3LCBCbGl0dGVyLCBQYWxldHRlLCBOZXh0QnJpY2tWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQnJpY2tWaWV3ID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrVmlldztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5vdXQkLk5leHRCcmlja1ZpZXcgPSBOZXh0QnJpY2tWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChOZXh0QnJpY2tWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdOZXh0QnJpY2tWaWV3JywgTmV4dEJyaWNrVmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBOZXh0QnJpY2tWaWV3O1xuICBmdW5jdGlvbiBOZXh0QnJpY2tWaWV3KCl7XG4gICAgTmV4dEJyaWNrVmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmlja1ZpZXcodGhpcy5vcHRzLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH1cbiAgcHJvdG90eXBlLnByZXR0eU9mZnNldCA9IGZ1bmN0aW9uKHR5cGUpe1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIGNhc2UgJ3ppZyc6XG4gICAgICByZXR1cm4gWzAuNSwgMF07XG4gICAgY2FzZSAnemFnJzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4gWzAuNSwgMF07XG4gICAgY2FzZSAndGVlJzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICd0ZXRyaXMnOlxuICAgICAgcmV0dXJuIFswLCAtMC41XTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXJCZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzNdO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFsyXTtcbiAgICByZXR1cm4gdGhpcy5jdHguc3Ryb2tlUmVjdCgwLjUsIDAuNSwgdGhpcy53aWR0aCAtIDEsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIHJlZiQsIHgsIHk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMucmVuZGVyQmcoKTtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihicmljayk7XG4gICAgcmVmJCA9IHRoaXMucHJldHR5T2Zmc2V0KGJyaWNrLnR5cGUpLCB4ID0gcmVmJFswXSwgeSA9IHJlZiRbMV07XG4gICAgcmV0dXJuIHRoaXMuYnJpY2suYmxpdFRvKHRoaXMsIHggKiB0aGlzLm9wdHMueiwgeSAqIHRoaXMub3B0cy56KTtcbiAgfTtcbiAgcmV0dXJuIE5leHRCcmlja1ZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciBuZXV0cmFsLCByZWQsIG9yYW5nZSwgZ3JlZW4sIG1hZ2VudGEsIGJsdWUsIGJyb3duLCB5ZWxsb3csIGN5YW4sIHRpbGVDb2xvcnMsIFBhbGV0dGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLm5ldXRyYWwgPSBuZXV0cmFsID0gWycjZmZmZmZmJywgJyNjY2NjY2MnLCAnIzg4ODg4OCcsICcjMjEyMTIxJ107XG5vdXQkLnJlZCA9IHJlZCA9IFsnI0ZGNDQ0NCcsICcjRkY3Nzc3JywgJyNkZDQ0NDQnLCAnIzU1MTExMSddO1xub3V0JC5vcmFuZ2UgPSBvcmFuZ2UgPSBbJyNGRkJCMzMnLCAnI0ZGQ0M4OCcsICcjQ0M4ODAwJywgJyM1NTMzMDAnXTtcbm91dCQuZ3JlZW4gPSBncmVlbiA9IFsnIzQ0ZmY2NicsICcjODhmZmFhJywgJyMyMmJiMzMnLCAnIzExNTUxMSddO1xub3V0JC5tYWdlbnRhID0gbWFnZW50YSA9IFsnI2ZmMzNmZicsICcjZmZhYWZmJywgJyNiYjIyYmInLCAnIzU1MTE1NSddO1xub3V0JC5ibHVlID0gYmx1ZSA9IFsnIzY2YmJmZicsICcjYWFkZGZmJywgJyM1NTg4ZWUnLCAnIzExMTE1NSddO1xub3V0JC5icm93biA9IGJyb3duID0gWycjZmZiYjMzJywgJyNmZmNjODgnLCAnI2JiOTkwMCcsICcjNTU1NTExJ107XG5vdXQkLnllbGxvdyA9IHllbGxvdyA9IFsnI2VlZWUxMScsICcjZmZmZmFhJywgJyNjY2JiMDAnLCAnIzU1NTUxMSddO1xub3V0JC5jeWFuID0gY3lhbiA9IFsnIzQ0ZGRmZicsICcjYWFlM2ZmJywgJyMwMGFhY2MnLCAnIzAwNjY5OSddO1xub3V0JC50aWxlQ29sb3JzID0gdGlsZUNvbG9ycyA9IFtuZXV0cmFsWzJdLCByZWRbMF0sIG9yYW5nZVswXSwgeWVsbG93WzBdLCBncmVlblswXSwgY3lhblswXSwgYmx1ZVsyXSwgbWFnZW50YVswXV07XG5vdXQkLlBhbGV0dGUgPSBQYWxldHRlID0ge1xuICBuZXV0cmFsOiBuZXV0cmFsLFxuICByZWQ6IHJlZCxcbiAgb3JhbmdlOiBvcmFuZ2UsXG4gIHllbGxvdzogeWVsbG93LFxuICBncmVlbjogZ3JlZW4sXG4gIGN5YW46IGN5YW4sXG4gIGJsdWU6IGJsdWUsXG4gIG1hZ2VudGE6IG1hZ2VudGEsXG4gIHRpbGVDb2xvcnM6IHRpbGVDb2xvcnNcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGZsb29yLCBCbGl0dGVyLCBUZXh0QmxpdHRlciwgU3RhcnRNZW51Vmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5UZXh0QmxpdHRlciA9IHJlcXVpcmUoJy4vdGV4dC1ibGl0dGVyJykuVGV4dEJsaXR0ZXI7XG5vdXQkLlN0YXJ0TWVudVZpZXcgPSBTdGFydE1lbnVWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChTdGFydE1lbnVWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdTdGFydE1lbnVWaWV3JywgU3RhcnRNZW51VmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBTdGFydE1lbnVWaWV3O1xuICBmdW5jdGlvbiBTdGFydE1lbnVWaWV3KCl7XG4gICAgU3RhcnRNZW51Vmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy50ZXh0ID0gbmV3IFRleHRCbGl0dGVyKHt9LCB0aGlzLncgKiAyIC8gMywgdGhpcy5oIC8gMjApO1xuICAgIHRoaXMudGl0bGUgPSBuZXcgVGV4dEJsaXR0ZXIoe30sIHRoaXMudyAqIDIgLyAzLCB0aGlzLmggLyAxMCk7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGFyZyQpe1xuICAgIHZhciBtZW51RGF0YSwgY3VycmVudEluZGV4LCBpJCwgbGVuJCwgaSwgZW50cnksIHJlc3VsdHMkID0gW107XG4gICAgbWVudURhdGEgPSBhcmckLm1lbnVEYXRhLCBjdXJyZW50SW5kZXggPSBhcmckLmN1cnJlbnRJbmRleDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBtZW51RGF0YS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgZW50cnkgPSBtZW51RGF0YVtpJF07XG4gICAgICB0aGlzLnRleHQucmVuZGVyKGVudHJ5LnRleHQpO1xuICAgICAgaWYgKGkgPT09IGN1cnJlbnRJbmRleCkge1xuICAgICAgICB0aGlzLnRleHQucmVuZGVyRnJhbWUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudGV4dC5ibGl0VG8odGhpcywgZmxvb3IodGhpcy53IC8gNiksIGZsb29yKHRoaXMuaCAvIDIgKyB0aGlzLmggLyAxNSAqIGkpKTtcbiAgICAgIHRoaXMudGl0bGUucmVuZGVyKCdURVRSSVMnKTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy50aXRsZS5ibGl0VG8odGhpcywgdGhpcy53IC8gNiwgdGhpcy5oIC8gNikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTdGFydE1lbnVWaWV3O1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmxpdHRlciwgVGV4dEJsaXR0ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcbm91dCQuVGV4dEJsaXR0ZXIgPSBUZXh0QmxpdHRlciA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIGRlZmF1bHRGb250T3B0aW9ucywgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChUZXh0QmxpdHRlciwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnVGV4dEJsaXR0ZXInLCBUZXh0QmxpdHRlciksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUZXh0QmxpdHRlcjtcbiAgZGVmYXVsdEZvbnRPcHRpb25zID0ge1xuICAgIGZvbnQ6IFwiMTRweCBtb25vc3BhY2VcIixcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInXG4gIH07XG4gIGZ1bmN0aW9uIFRleHRCbGl0dGVyKG9wdHMsIHgsIHkpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgVGV4dEJsaXR0ZXIuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuZm9udCA9IHtcbiAgICAgIHNpemU6IHksXG4gICAgICBmYW1pbHk6ICdtb25vc3BhY2UnXG4gICAgfTtcbiAgICB0aGlzLnNldEZvbnQodGhpcy5mb250KTtcbiAgICB0aGlzLnNldEFsaWdubWVudCgnY2VudGVyJyk7XG4gICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gIH1cbiAgcHJvdG90eXBlLnNldEZvbnQgPSBmdW5jdGlvbihzZXR0aW5ncyl7XG4gICAgaW1wb3J0JCh0aGlzLmZvbnQsIHNldHRpbmdzKTtcbiAgICByZXR1cm4gdGhpcy5jdHguZm9udCA9IHRoaXMuZm9udC5zaXplICsgXCJweCBcIiArIHRoaXMuZm9udC5mYW1pbHk7XG4gIH07XG4gIHByb3RvdHlwZS5zZXRBbGlnbm1lbnQgPSBmdW5jdGlvbihhbGlnblN0cmluZyl7XG4gICAgcmV0dXJuIHRoaXMuY3R4LnRleHRBbGlnbiA9IGFsaWduU3RyaW5nO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24odGV4dCwgY29sb3Ipe1xuICAgIGNvbG9yID09IG51bGwgJiYgKGNvbG9yID0gJ2JsYWNrJyk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIHJldHVybiB0aGlzLmN0eC5maWxsVGV4dCh0ZXh0LCB0aGlzLncgLyAyLCB0aGlzLmZvbnQuc2l6ZSAvIDIsIHRoaXMudyk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXJGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY3R4LnN0cm9rZVJlY3QoMC41LCAwLjUsIHRoaXMudyAtIDEsIHRoaXMuaCAtIDEpO1xuICB9O1xuICByZXR1cm4gVGV4dEJsaXR0ZXI7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBlbCwgRG9tUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5lbCA9IGJpbmQkKGRvY3VtZW50LCAnY3JlYXRlRWxlbWVudCcpO1xub3V0JC5Eb21SZW5kZXJlciA9IERvbVJlbmRlcmVyID0gKGZ1bmN0aW9uKCl7XG4gIERvbVJlbmRlcmVyLmRpc3BsYXlOYW1lID0gJ0RvbVJlbmRlcmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IERvbVJlbmRlcmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEb21SZW5kZXJlcjtcbiAgZnVuY3Rpb24gRG9tUmVuZGVyZXIob3B0cyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLmRvbSA9IHtcbiAgICAgIG1haW46IGVsKCdkaXYnKVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7fTtcbiAgcHJvdG90eXBlLmFwcGVuZFRvID0gZnVuY3Rpb24oaG9zdCl7XG4gICAgcmV0dXJuIGhvc3QuYXBwZW5kQ2hpbGQodGhpcy5kb20ubWFpbik7XG4gIH07XG4gIHJldHVybiBEb21SZW5kZXJlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn0iLCJ2YXIgaWQsIGxvZywgZmxpcCwgZGVsYXksIGZsb29yLCByYW5kb20sIHJhbmQsIHJhbmRvbUZyb20sIGFkZFYyLCBmaWx0ZXIsIHdyYXAsIGxpbWl0LCByYWYsIHRoYXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gTWF0aC5yYW5kb207XG5vdXQkLnJhbmQgPSByYW5kID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgZmxvb3IocmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XG59O1xub3V0JC5yYW5kb21Gcm9tID0gcmFuZG9tRnJvbSA9IGZ1bmN0aW9uKGxpc3Qpe1xuICByZXR1cm4gbGlzdFtyYW5kKDAsIGxpc3QubGVuZ3RoIC0gMSldO1xufTtcbm91dCQuYWRkVjIgPSBhZGRWMiA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gW2FbMF0gKyBiWzBdLCBhWzFdICsgYlsxXV07XG59O1xub3V0JC5maWx0ZXIgPSBmaWx0ZXIgPSBjdXJyeSQoZnVuY3Rpb24ozrssIGxpc3Qpe1xuICB2YXIgaSQsIGxlbiQsIHgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbGlzdC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsaXN0W2kkXTtcbiAgICBpZiAozrsoeCkpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0pO1xub3V0JC53cmFwID0gd3JhcCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLmxpbWl0ID0gbGltaXQgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIG4pe1xuICBpZiAobiA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH0gZWxzZSBpZiAobiA8IG1pbikge1xuICAgIHJldHVybiBtaW47XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cbn0pO1xub3V0JC5yYWYgPSByYWYgPSAodGhhdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgPyB0aGF0XG4gIDogKHRoYXQgPSB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgPyB0aGF0XG4gICAgOiAodGhhdCA9IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiBmdW5jdGlvbijOuyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KM67LCAxMDAwIC8gNjApO1xuICAgICAgfTtcbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciBzcXVhcmUsIHppZywgemFnLCBsZWZ0LCByaWdodCwgdGVlLCB0ZXRyaXMsIGFsbCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuc3F1YXJlID0gc3F1YXJlID0gW1tbMCwgMCwgMF0sIFswLCAxLCAxXSwgWzAsIDEsIDFdXV07XG5vdXQkLnppZyA9IHppZyA9IFtbWzAsIDAsIDBdLCBbMiwgMiwgMF0sIFswLCAyLCAyXV0sIFtbMCwgMiwgMF0sIFsyLCAyLCAwXSwgWzIsIDAsIDBdXV07XG5vdXQkLnphZyA9IHphZyA9IFtbWzAsIDAsIDBdLCBbMCwgMywgM10sIFszLCAzLCAwXV0sIFtbMywgMCwgMF0sIFszLCAzLCAwXSwgWzAsIDMsIDBdXV07XG5vdXQkLmxlZnQgPSBsZWZ0ID0gW1tbMCwgMCwgMF0sIFs0LCA0LCA0XSwgWzQsIDAsIDBdXSwgW1s0LCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgMF1dLCBbWzAsIDAsIDRdLCBbNCwgNCwgNF0sIFswLCAwLCAwXV0sIFtbMCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDRdXV07XG5vdXQkLnJpZ2h0ID0gcmlnaHQgPSBbW1swLCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgNV1dLCBbWzAsIDUsIDBdLCBbMCwgNSwgMF0sIFs1LCA1LCAwXV0sIFtbNSwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDBdXSwgW1swLCA1LCA1XSwgWzAsIDUsIDBdLCBbMCwgNSwgMF1dXTtcbm91dCQudGVlID0gdGVlID0gW1tbMCwgMCwgMF0sIFs2LCA2LCA2XSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDBdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgNl0sIFswLCAwLCAwXV0sIFtbMCwgNiwgMF0sIFswLCA2LCA2XSwgWzAsIDYsIDBdXV07XG5vdXQkLnRldHJpcyA9IHRldHJpcyA9IFtbWzAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMF0sIFs3LCA3LCA3LCA3XV0sIFtbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF1dXTtcbm91dCQuYWxsID0gYWxsID0gW1xuICB7XG4gICAgdHlwZTogJ3NxdWFyZScsXG4gICAgc2hhcGVzOiBzcXVhcmVcbiAgfSwge1xuICAgIHR5cGU6ICd6aWcnLFxuICAgIHNoYXBlczogemlnXG4gIH0sIHtcbiAgICB0eXBlOiAnemFnJyxcbiAgICBzaGFwZXM6IHphZ1xuICB9LCB7XG4gICAgdHlwZTogJ2xlZnQnLFxuICAgIHNoYXBlczogbGVmdFxuICB9LCB7XG4gICAgdHlwZTogJ3JpZ2h0JyxcbiAgICBzaGFwZXM6IHJpZ2h0XG4gIH0sIHtcbiAgICB0eXBlOiAndGVlJyxcbiAgICBzaGFwZXM6IHRlZVxuICB9LCB7XG4gICAgdHlwZTogJ3RldHJpcycsXG4gICAgc2hhcGVzOiB0ZXRyaXNcbiAgfVxuXTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmQsIHdyYXAsIHJhbmRvbUZyb20sIEJyaWNrU2hhcGVzLCBjYW5Ecm9wLCBjYW5Nb3ZlLCBjYW5Sb3RhdGUsIGNvbGxpZGVzLCBjb3B5QnJpY2tUb0FyZW5hLCB0b3BJc1JlYWNoZWQsIGlzQ29tcGxldGUsIG5ld0JyaWNrLCBzcGF3bk5ld0JyaWNrLCBkcm9wQXJlbmFSb3csIGNsZWFyQXJlbmEsIGdldFNoYXBlT2ZSb3RhdGlvbiwgbm9ybWFsaXNlUm90YXRpb24sIHJvdGF0ZUJyaWNrLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBhZGRWMiA9IHJlZiQuYWRkVjIsIHJhbmQgPSByZWYkLnJhbmQsIHdyYXAgPSByZWYkLndyYXAsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb207XG5Ccmlja1NoYXBlcyA9IHJlcXVpcmUoJy4vZGF0YS9icmljay1zaGFwZXMnKTtcbm91dCQuY2FuRHJvcCA9IGNhbkRyb3AgPSBmdW5jdGlvbihicmljaywgYXJlbmEpe1xuICByZXR1cm4gY2FuTW92ZShicmljaywgWzAsIDFdLCBhcmVuYSk7XG59O1xub3V0JC5jYW5Nb3ZlID0gY2FuTW92ZSA9IGZ1bmN0aW9uKGJyaWNrLCBtb3ZlLCBhcmVuYSl7XG4gIHZhciBuZXdQb3M7XG4gIG5ld1BvcyA9IGFkZFYyKGJyaWNrLnBvcywgbW92ZSk7XG4gIHJldHVybiBjb2xsaWRlcyhuZXdQb3MsIGJyaWNrLnNoYXBlLCBhcmVuYSk7XG59O1xub3V0JC5jYW5Sb3RhdGUgPSBjYW5Sb3RhdGUgPSBmdW5jdGlvbihicmljaywgZGlyLCBhcmVuYSl7XG4gIHZhciBuZXdTaGFwZTtcbiAgbmV3U2hhcGUgPSBnZXRTaGFwZU9mUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uICsgZGlyKTtcbiAgcmV0dXJuIGNvbGxpZGVzKGJyaWNrLnBvcywgbmV3U2hhcGUsIGFyZW5hKTtcbn07XG5vdXQkLmNvbGxpZGVzID0gY29sbGlkZXMgPSBmdW5jdGlvbihwb3MsIHNoYXBlLCBhcmckKXtcbiAgdmFyIGNlbGxzLCB3aWR0aCwgaGVpZ2h0LCBpJCwgcmVmJCwgbGVuJCwgeSwgdiwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdTtcbiAgY2VsbHMgPSBhcmckLmNlbGxzLCB3aWR0aCA9IGFyZyQud2lkdGgsIGhlaWdodCA9IGFyZyQuaGVpZ2h0O1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gPiAwKSB7XG4gICAgICAgIGlmICh2ID49IDApIHtcbiAgICAgICAgICBpZiAodiA+PSBoZWlnaHQgfHwgdSA+PSB3aWR0aCB8fCB1IDwgMCB8fCBjZWxsc1t2XVt1XSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQuY29weUJyaWNrVG9BcmVuYSA9IGNvcHlCcmlja1RvQXJlbmEgPSBmdW5jdGlvbihhcmckLCBhcmcxJCl7XG4gIHZhciBwb3MsIHNoYXBlLCBjZWxscywgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGxyZXN1bHQkLCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1LCByZXN1bHRzJCA9IFtdO1xuICBwb3MgPSBhcmckLnBvcywgc2hhcGUgPSBhcmckLnNoYXBlO1xuICBjZWxscyA9IGFyZzEkLmNlbGxzO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGlmIChzaGFwZVt5XVt4XSAmJiB2ID49IDApIHtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjZWxsc1t2XVt1XSA9IHNoYXBlW3ldW3hdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC50b3BJc1JlYWNoZWQgPSB0b3BJc1JlYWNoZWQgPSBmdW5jdGlvbihhcmckKXtcbiAgdmFyIGNlbGxzLCBpJCwgcmVmJCwgbGVuJCwgY2VsbDtcbiAgY2VsbHMgPSBhcmckLmNlbGxzO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gY2VsbHNbMF0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgY2VsbCA9IHJlZiRbaSRdO1xuICAgIGlmIChjZWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbm91dCQuaXNDb21wbGV0ZSA9IGlzQ29tcGxldGUgPSBmdW5jdGlvbihyb3cpe1xuICB2YXIgaSQsIGxlbiQsIGNlbGw7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgY2VsbCA9IHJvd1tpJF07XG4gICAgaWYgKCFjZWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbm91dCQubmV3QnJpY2sgPSBuZXdCcmljayA9IGZ1bmN0aW9uKGl4KXtcbiAgaXggPT0gbnVsbCAmJiAoaXggPSByYW5kKDAsIEJyaWNrU2hhcGVzLmFsbC5sZW5ndGgpKTtcbiAgcmV0dXJuIHtcbiAgICByb3RhdGlvbjogMCxcbiAgICBzaGFwZTogQnJpY2tTaGFwZXMuYWxsW2l4XS5zaGFwZXNbMF0sXG4gICAgdHlwZTogQnJpY2tTaGFwZXMuYWxsW2l4XS50eXBlLFxuICAgIHBvczogWzAsIDBdXG4gIH07XG59O1xub3V0JC5zcGF3bk5ld0JyaWNrID0gc3Bhd25OZXdCcmljayA9IGZ1bmN0aW9uKGdzKXtcbiAgZ3MuYnJpY2suY3VycmVudCA9IGdzLmJyaWNrLm5leHQ7XG4gIGdzLmJyaWNrLmN1cnJlbnQucG9zID0gWzQsIC0xXTtcbiAgcmV0dXJuIGdzLmJyaWNrLm5leHQgPSBuZXdCcmljaygpO1xufTtcbm91dCQuZHJvcEFyZW5hUm93ID0gZHJvcEFyZW5hUm93ID0gZnVuY3Rpb24oYXJnJCwgcm93SXgpe1xuICB2YXIgY2VsbHM7XG4gIGNlbGxzID0gYXJnJC5jZWxscztcbiAgY2VsbHMuc3BsaWNlKHJvd0l4LCAxKTtcbiAgcmV0dXJuIGNlbGxzLnVuc2hpZnQocmVwZWF0QXJyYXkkKFswXSwgY2VsbHNbMF0ubGVuZ3RoKSk7XG59O1xub3V0JC5jbGVhckFyZW5hID0gY2xlYXJBcmVuYSA9IGZ1bmN0aW9uKGFyZW5hKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIGksIGNlbGwsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICByb3cgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIGkgPSBqJDtcbiAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgbHJlc3VsdCQucHVzaChyb3dbaV0gPSAwKTtcbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuZ2V0U2hhcGVPZlJvdGF0aW9uID0gZ2V0U2hhcGVPZlJvdGF0aW9uID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uKXtcbiAgcm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbihicmljaywgcm90YXRpb24pO1xuICByZXR1cm4gQnJpY2tTaGFwZXNbYnJpY2sudHlwZV1bcm90YXRpb25dO1xufTtcbm91dCQubm9ybWFsaXNlUm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbiA9IGZ1bmN0aW9uKGFyZyQsIHJvdGF0aW9uKXtcbiAgdmFyIHR5cGU7XG4gIHR5cGUgPSBhcmckLnR5cGU7XG4gIHJldHVybiB3cmFwKDAsIEJyaWNrU2hhcGVzW3R5cGVdLmxlbmd0aCAtIDEsIHJvdGF0aW9uKTtcbn07XG5vdXQkLnJvdGF0ZUJyaWNrID0gcm90YXRlQnJpY2sgPSBmdW5jdGlvbihicmljaywgZGlyKXtcbiAgdmFyIHJvdGF0aW9uLCB0eXBlO1xuICByb3RhdGlvbiA9IGJyaWNrLnJvdGF0aW9uLCB0eXBlID0gYnJpY2sudHlwZTtcbiAgYnJpY2sucm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24gKyBkaXIpO1xuICByZXR1cm4gYnJpY2suc2hhcGUgPSBnZXRTaGFwZU9mUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uKTtcbn07XG5mdW5jdGlvbiByZXBlYXRBcnJheSQoYXJyLCBuKXtcbiAgZm9yICh2YXIgciA9IFtdOyBuID4gMDsgKG4gPj49IDEpICYmIChhcnIgPSBhcnIuY29uY2F0KGFycikpKVxuICAgIGlmIChuICYgMSkgci5wdXNoLmFwcGx5KHIsIGFycik7XG4gIHJldHVybiByO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCByYW5kb21Gcm9tLCBDb3JlLCBTdGFydE1lbnUsIFRldHJpc0dhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5yYW5kb21Gcm9tID0gcmVxdWlyZSgnc3RkJykucmFuZG9tRnJvbTtcbkNvcmUgPSByZXF1aXJlKCcuL2dhbWUtY29yZScpO1xuU3RhcnRNZW51ID0gcmVxdWlyZSgnLi9zdGFydC1tZW51Jyk7XG5vdXQkLlRldHJpc0dhbWUgPSBUZXRyaXNHYW1lID0gKGZ1bmN0aW9uKCl7XG4gIFRldHJpc0dhbWUuZGlzcGxheU5hbWUgPSAnVGV0cmlzR2FtZSc7XG4gIHZhciBwcm90b3R5cGUgPSBUZXRyaXNHYW1lLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUZXRyaXNHYW1lO1xuICBmdW5jdGlvbiBUZXRyaXNHYW1lKGdhbWVTdGF0ZSl7XG4gICAgbG9nKFwiVGV0cmlzR2FtZTo6bmV3XCIpO1xuICAgIFN0YXJ0TWVudS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUpO1xuICB9XG4gIHByb3RvdHlwZS5zaG93RmFpbFNjcmVlbiA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSwgzpR0KXtcbiAgICBjb25zb2xlLmRlYnVnKCdGQUlMRUQnKTtcbiAgICBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZSA9ICdzdGFydC1tZW51JztcbiAgICByZXR1cm4gU3RhcnRNZW51LnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSk7XG4gIH07XG4gIHByb3RvdHlwZS5iZWdpbk5ld0dhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIChmdW5jdGlvbigpe1xuICAgICAgQ29yZS5jbGVhckFyZW5hKHRoaXMuYXJlbmEpO1xuICAgICAgdGhpcy5icmljay5uZXh0ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5uZXh0LnBvcyA9IFszLCAtMV07XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQgPSBDb3JlLm5ld0JyaWNrKCk7XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQucG9zID0gWzMsIC0xXTtcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgdGhpcy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0KCk7XG4gICAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lci5yZXNldCgpO1xuICAgIH0uY2FsbChnYW1lU3RhdGUpKTtcbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZUdhbWUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXRTdGF0ZSwgcmVmJCwga2V5LCBhY3Rpb24sIHJvd3NEcm9wcGVkLCByZXMkLCBpJCwgaXgsIHJvdywgbGVuJCwgcm93SXg7XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzBdIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIDEsIGFyZW5hKSkge1xuICAgICAgICAgICAgQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1iJzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgLTEsIGFyZW5hKSkge1xuICAgICAgICAgICAgQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAtMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdzLmZvcmNlRG93bk1vZGUgJiYgZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci5leHBpcmVkKSB7XG4gICAgICBpZiAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ29yZS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlO1xuICAgICAgICBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLnJlc2V0KCk7XG4gICAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci50YXJnZXRUaW1lO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ3MudGltZXJzLmRyb3BUaW1lci5leHBpcmVkKSB7XG4gICAgICBncy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0V2l0aFJlbWFpbmRlcigpO1xuICAgICAgaWYgKENvcmUuY2FuRHJvcChicmljay5jdXJyZW50LCBhcmVuYSkpIHtcbiAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMV0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIENvcmUuY29weUJyaWNrVG9BcmVuYShicmljay5jdXJyZW50LCBhcmVuYSk7XG4gICAgICAgIENvcmUuc3Bhd25OZXdCcmljayhncyk7XG4gICAgICB9XG4gICAgICByZXMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgcm93SXggPSByZWYkW2kkXTtcbiAgICAgICAgcmVzJC5wdXNoKENvcmUuZHJvcEFyZW5hUm93KGdzLmFyZW5hLCByb3dJeCkpO1xuICAgICAgfVxuICAgICAgcm93c0Ryb3BwZWQgPSByZXMkO1xuICAgICAgZ3MubGluZXMgKz0gcm93c0Ryb3BwZWQubGVuZ3RoO1xuICAgICAgaWYgKENvcmUudG9wSXNSZWFjaGVkKGFyZW5hKSkge1xuICAgICAgICByZXR1cm4gZ3MubWV0YWdhbWVTdGF0ZSA9ICdmYWlsdXJlJztcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZm4kKCl7XG4gICAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGl4ID0gaSQ7XG4gICAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgICBpZiAoQ29yZS5pc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGl4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNob3dTdGFydFNjcmVlbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgaW5wdXRTdGF0ZSwgc3RhcnRNZW51U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlLCBzdGFydE1lbnVTdGF0ZSA9IGdzLnN0YXJ0TWVudVN0YXRlO1xuICAgIHdoaWxlIChpbnB1dFN0YXRlLmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3RQcmV2SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3ROZXh0SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIGlmIChzdGFydE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdzdGFydC1nYW1lJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChncy5mb3JjZURvd25Nb2RlID0gZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZyYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuc2hvd0ZhaWxTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5hZHZhbmNlR2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZSA9ICdzdGFydC1tZW51JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgdGhpcy5zaG93U3RhcnRTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmRlYnVnKCdVbmtub3duIG1ldGFnYW1lLXN0YXRlOicsIG1ldGFnYW1lU3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICByZXR1cm4gVGV0cmlzR2FtZTtcbn0oKSk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGV0cmlzR2FtZTogVGV0cmlzR2FtZVxufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgd3JhcCwgbWVudURhdGEsIGxpbWl0ZXIsIHByaW1lR2FtZVN0YXRlLCBjaG9vc2VPcHRpb24sIHNlbGVjdFByZXZJdGVtLCBzZWxlY3ROZXh0SXRlbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgd3JhcCA9IHJlZiQud3JhcDtcbm1lbnVEYXRhID0gW1xuICB7XG4gICAgc3RhdGU6ICdzdGFydC1nYW1lJyxcbiAgICB0ZXh0OiBcIlN0YXJ0IEdhbWVcIlxuICB9LCB7XG4gICAgc3RhdGU6ICdub3RoaW5nJyxcbiAgICB0ZXh0OiBcIkRvbid0IFN0YXJ0IEdhbWVcIlxuICB9XG5dO1xubGltaXRlciA9IHdyYXAoMCwgbWVudURhdGEubGVuZ3RoIC0gMSk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihnYW1lc3RhdGUpe1xuICByZXR1cm4gZ2FtZXN0YXRlLnN0YXJ0TWVudVN0YXRlID0ge1xuICAgIGN1cnJlbnRJbmRleDogMCxcbiAgICBjdXJyZW50U3RhdGU6IG1lbnVEYXRhWzBdLFxuICAgIG1lbnVEYXRhOiBtZW51RGF0YVxuICB9O1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24oc21zLCBpbmRleCl7XG4gIHNtcy5jdXJyZW50SW5kZXggPSBsaW1pdGVyKGluZGV4KTtcbiAgcmV0dXJuIHNtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVtzbXMuY3VycmVudEluZGV4XTtcbn07XG5vdXQkLnNlbGVjdFByZXZJdGVtID0gc2VsZWN0UHJldkl0ZW0gPSBmdW5jdGlvbihzbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBzbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKHNtcywgY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCArIDEpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSBiZWdpbiA/IFRJTUVSX0FDVElWRSA6IFRJTUVSX0VYUElSRUQ7XG4gICAgdGhpcy5hY3RpdmUgPSBiZWdpbjtcbiAgICB0aGlzLmV4cGlyZWQgPSAhYmVnaW47XG4gICAgYWxsVGltZXJzLnB1c2godGhpcyk7XG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2FjdGl2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfQUNUSVZFO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdleHBpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9FWFBJUkVEO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdwcm9ncmVzcycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZSAvIHRoaXMudGFyZ2V0VGltZTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndGltZVRvRXhwaXJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldFRpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihleHBUaW1lKXtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRhcmdldFRpbWUgLSBleHBUaW1lO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbijOlHQpe1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5jdXJyZW50VGltZSArPSDOlHQ7XG4gICAgICBpZiAodGhpcy5jdXJyZW50VGltZSA+PSB0aGlzLnRhcmdldFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9FWFBJUkVEO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfQUNUSVZFO1xuICB9O1xuICBwcm90b3R5cGUucmVzZXRXaXRoUmVtYWluZGVyID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSAtIHRpbWU7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfRVhQSVJFRDtcbiAgfTtcbiAgcHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbGxUaW1lcnMuc3BsaWNlKGFsbFRpbWVycy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJUSU1FUjogXCIgKyB0aGlzLnRhcmdldFRpbWUgKyBcIlxcblNUQVRFOiBcIiArIHRoaXMuc3RhdGUgKyBcIiAoXCIgKyB0aGlzLmFjdGl2ZSArIFwifFwiICsgdGhpcy5leHBpcmVkICsgXCIpXFxuXCIgKyBwcm9nYmFyKHRoaXMuY3VycmVudFRpbWUsIHRoaXMudGFyZ2V0VGltZSk7XG4gIH07XG4gIFRpbWVyLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnVwZGF0ZSjOlHQpO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gVGltZXI7XG59KCkpO1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nJChzdHIsIG4pe1xuICBmb3IgKHZhciByID0gJyc7IG4gPiAwOyAobiA+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKSBpZiAobiAmIDEpIHIgKz0gc3RyO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSJdfQ==
