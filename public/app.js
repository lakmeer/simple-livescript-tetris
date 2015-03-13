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
},{"./debug-output":2,"./frame-driver":3,"./game-state":4,"./input-handler":5,"./renderers/canvas":9,"./renderers/dom":12,"./tetris-game":16,"./timer":17,"std":13}],2:[function(require,module,exports){
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
},{"std":13}],3:[function(require,module,exports){
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
},{"std":13}],4:[function(require,module,exports){
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
},{"./timer":17,"std":13}],5:[function(require,module,exports){
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
},{"./timer":17,"std":13}],6:[function(require,module,exports){
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
},{"./blitter":7,"./palette":11,"std":13}],7:[function(require,module,exports){
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
},{"std":13}],8:[function(require,module,exports){
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
},{"./blitter":7,"./palette":11,"std":13}],9:[function(require,module,exports){
var ref$, id, log, Blitter, Palette, ArenaView, BrickView, NextBrickView, CanvasRenderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = require('./blitter').Blitter;
Palette = require('./palette').Palette;
ArenaView = require('./arena').ArenaView;
BrickView = require('./brick').BrickView;
NextBrickView = require('./next-brick').NextBrickView;
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
    this.outputCanvas = document.getElementById('canvas');
    this.outputCanvas.width = 1 + 17 * this.opts.z;
    this.outputCanvas.height = 1 + 20 * this.opts.z;
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
  prototype.render = function(gameState){
    var metagameState, outputBlitter;
    metagameState = gameState.metagameState;
    outputBlitter = (function(){
      switch (metagameState) {
      case 'no-game':
        return this.renderStartMenu(gameState);
      case 'pause':
        return this.renderPauseMenu(gameState);
      case 'game':
        return this.renderGame(gameState);
      case 'win':
        return this.renderWinScreen(gameState);
      default:
        return this.renderBlank();
      }
    }.call(this));
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
},{"./arena":6,"./blitter":7,"./brick":8,"./next-brick":10,"./palette":11,"std":13}],10:[function(require,module,exports){
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
},{"./blitter":7,"./brick":8,"./palette":11,"std":13}],11:[function(require,module,exports){
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
},{"std":13}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{"./data/brick-shapes":14,"std":13}],16:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, Core, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
randomFrom = require('std').randomFrom;
Core = require('./game-core');
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(gameState){
    log("TetrisGame::new");
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
  return TetrisGame;
}());
module.exports = {
  TetrisGame: TetrisGame
};
},{"./game-core":15,"std":13}],17:[function(require,module,exports){
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
},{"std":13}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2dhbWUtc3RhdGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYXJlbmEubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9uZXh0LWJyaWNrLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9yZW5kZXJlcnMvY2FudmFzL3BhbGV0dGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9kb20ubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RpbWVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgbG9nLCBkZWxheSwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGltZXIsIFRldHJpc0dhbWUsIEdhbWVTdGF0ZSwgQ2FudmFzUmVuZGVyZXIsIERvbVJlbmRlcmVyLCBEZWJ1Z091dHB1dCwgZ2FtZU9wdHMsIHJlbmRlck9wdHMsIGlucHV0SGFuZGxlciwgZ2FtZVN0YXRlLCB0ZXRyaXNHYW1lLCByZW5kZXJlcnMsIGkkLCBsZW4kLCByZW5kZXJlciwgZnJhbWVEcml2ZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5GcmFtZURyaXZlciA9IHJlcXVpcmUoJy4vZnJhbWUtZHJpdmVyJykuRnJhbWVEcml2ZXI7XG5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2lucHV0LWhhbmRsZXInKS5JbnB1dEhhbmRsZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcblRldHJpc0dhbWUgPSByZXF1aXJlKCcuL3RldHJpcy1nYW1lJykuVGV0cmlzR2FtZTtcbkdhbWVTdGF0ZSA9IHJlcXVpcmUoJy4vZ2FtZS1zdGF0ZScpLkdhbWVTdGF0ZTtcbkNhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcnMvY2FudmFzJykuQ2FudmFzUmVuZGVyZXI7XG5Eb21SZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXJzL2RvbScpLkRvbVJlbmRlcmVyO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuZ2FtZU9wdHMgPSB7XG4gIHRpbGVXaWR0aDogMTAsXG4gIHRpbGVIZWlnaHQ6IDE4XG59O1xucmVuZGVyT3B0cyA9IHtcbiAgejogMjBcbn07XG5pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xuZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZShnYW1lT3B0cyk7XG50ZXRyaXNHYW1lID0gbmV3IFRldHJpc0dhbWUoZ2FtZVN0YXRlKTtcbnJlbmRlcmVycyA9IFtuZXcgQ2FudmFzUmVuZGVyZXIocmVuZGVyT3B0cyksIG5ldyBEb21SZW5kZXJlcihyZW5kZXJPcHRzKV07XG5mb3IgKGkkID0gMCwgbGVuJCA9IHJlbmRlcmVycy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICByZW5kZXJlciA9IHJlbmRlcmVyc1tpJF07XG4gIHJlbmRlcmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xufVxuSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgaWYgKGZyYW1lRHJpdmVyLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xuICB9XG59KTtcbmZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlbmRlcmVyLCByZXN1bHRzJCA9IFtdO1xuICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICBnYW1lU3RhdGUuaW5wdXRTdGF0ZSA9IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKTtcbiAgVGltZXIudXBkYXRlQWxsKM6UdCk7XG4gIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUucnVuRnJhbWUoZ2FtZVN0YXRlLCDOlHQpO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gcmVuZGVyZXJzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJlbmRlcmVyID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChyZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlLCByZW5kZXJPcHRzKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5mcmFtZURyaXZlci5zdGFydCgpO1xuZGVsYXkoMTAwMCwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5pbnB1dFN0YXRlLnB1c2goe1xuICAgIGtleTogJ2xlZnQnLFxuICAgIGFjdGlvbjogJ2Rvd24nXG4gIH0pO1xufSk7XG5kZWxheSgxMDAwLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZ2FtZVN0YXRlLmlucHV0U3RhdGUucHVzaCh7XG4gICAga2V5OiAnbGVmdCcsXG4gICAgYWN0aW9uOiAndXAnXG4gIH0pO1xufSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHRlbXBsYXRlLCBEZWJ1Z091dHB1dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbnRlbXBsYXRlID0ge1xuICBjZWxsOiBmdW5jdGlvbihpdCl7XG4gICAgaWYgKGl0KSB7XG4gICAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiICBcIjtcbiAgICB9XG4gIH0sXG4gIGJyaWNrOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQubWFwKHRlbXBsYXRlLmNlbGwpLmpvaW4oJyAnKTtcbiAgICB9KS5qb2luKFwiXFxuICAgICAgICBcIik7XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBrZXlTdW1tYXJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0aGlzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGtleVN1bW1hcnkgPSB0aGlzW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChrZXlTdW1tYXJ5LmtleSArICctJyArIGtleVN1bW1hcnkuYWN0aW9uICsgXCJ8XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIobm8gY2hhbmdlKVwiO1xuICAgIH1cbiAgfSxcbiAgbm9ybWFsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIiAgTkVYVCA6XFxuXCIgKyB0ZW1wbGF0ZS5icmljay5hcHBseSh0aGlzLmJyaWNrLm5leHQpICsgXCJcXG5cXG4gc2NvcmUgLSBcIiArIHRoaXMuc2NvcmUgKyBcIlxcbiBsaW5lcyAtIFwiICsgdGhpcy5saW5lcyArIFwiXFxuXFxuICBtZXRhIC0gXCIgKyB0aGlzLm1ldGFnYW1lU3RhdGUgKyBcIlxcbiAgdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuIGZyYW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRGcmFtZXMgKyBcIlxcbiAga2V5cyAtIFwiICsgdGVtcGxhdGUua2V5cy5hcHBseSh0aGlzLmlucHV0U3RhdGUpICsgXCJcXG4gIGRyb3AgLSBcIiArICh0aGlzLmZvcmNlRG93bk1vZGUgPyAnZm9yY2UnIDogJ2F1dG8nKSArIFwiXFxuXFxuXCI7XG4gIH1cbn07XG5vdXQkLkRlYnVnT3V0cHV0ID0gRGVidWdPdXRwdXQgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdPdXRwdXQuZGlzcGxheU5hbWUgPSAnRGVidWdPdXRwdXQnO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdPdXRwdXQucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnT3V0cHV0O1xuICBmdW5jdGlvbiBEZWJ1Z091dHB1dCgpe1xuICAgIHRoaXMuZGJvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRibyk7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJUZXh0ID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgfTtcbiAgcmV0dXJuIERlYnVnT3V0cHV0O1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFmLCBGcmFtZURyaXZlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFmID0gcmVmJC5yYWY7XG5vdXQkLkZyYW1lRHJpdmVyID0gRnJhbWVEcml2ZXIgPSAoZnVuY3Rpb24oKXtcbiAgRnJhbWVEcml2ZXIuZGlzcGxheU5hbWUgPSAnRnJhbWVEcml2ZXInO1xuICB2YXIgcHJvdG90eXBlID0gRnJhbWVEcml2ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lRHJpdmVyO1xuICBmdW5jdGlvbiBGcmFtZURyaXZlcihvbkZyYW1lKXtcbiAgICB0aGlzLm9uRnJhbWUgPSBvbkZyYW1lO1xuICAgIHRoaXMuZnJhbWUgPSBiaW5kJCh0aGlzLCAnZnJhbWUnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpuZXdcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHplcm86IDAsXG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICBydW5uaW5nOiBmYWxzZVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbm93LCDOlHQ7XG4gICAgbm93ID0gRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuemVybztcbiAgICDOlHQgPSBub3cgLSB0aGlzLnN0YXRlLnRpbWU7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gbm93O1xuICAgIHRoaXMuc3RhdGUuZnJhbWUgPSB0aGlzLnN0YXRlLmZyYW1lICsgMTtcbiAgICB0aGlzLm9uRnJhbWUozpR0LCB0aGlzLnN0YXRlLnRpbWUsIHRoaXMuc3RhdGUuZnJhbWUpO1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICAgIHJldHVybiByYWYodGhpcy5mcmFtZSk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS56ZXJvID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUucnVubmluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdG9wIC0gc3RvcHBpbmdcIik7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucnVubmluZyA9IGZhbHNlO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIFRpbWVyLCBHYW1lU3RhdGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcbm91dCQuR2FtZVN0YXRlID0gR2FtZVN0YXRlID0gKGZ1bmN0aW9uKCl7XG4gIEdhbWVTdGF0ZS5kaXNwbGF5TmFtZSA9ICdHYW1lU3RhdGUnO1xuICB2YXIgZGVmYXVsdHMsIHByb3RvdHlwZSA9IEdhbWVTdGF0ZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR2FtZVN0YXRlO1xuICBkZWZhdWx0cyA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gICAgc2NvcmU6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgYnJpY2s6IHtcbiAgICAgIG5leHQ6IHZvaWQgOCxcbiAgICAgIGN1cnJlbnQ6IHZvaWQgOFxuICAgIH0sXG4gICAgaW5wdXRTdGF0ZTogW10sXG4gICAgZm9yY2VEb3duTW9kZTogZmFsc2UsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG4gICAgZWxhcHNlZEZyYW1lczogMCxcbiAgICB0aW1lcnM6IHtcbiAgICAgIGRyb3BUaW1lcjogbnVsbCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaWVtcjogbnVsbCxcbiAgICAgIGtleVJlcGVhdFRpbWVyOiBudWxsXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICB0aWxlV2lkdGg6IDEwLFxuICAgICAgdGlsZUhlaWdodDogMTgsXG4gICAgICBkcm9wU3BlZWQ6IDUwMCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaW1lOiAxMDAsXG4gICAgICBrZXlSZXBlYXRUaW1lOiAxMDBcbiAgICB9LFxuICAgIGFyZW5hOiB7XG4gICAgICBjZWxsczogW1tdXSxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBHYW1lU3RhdGUob3B0aW9ucyl7XG4gICAgaW1wb3J0JCh0aGlzLCBkZWZhdWx0cyk7XG4gICAgaW1wb3J0JCh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIHRoaXMudGltZXJzLmRyb3BUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuZHJvcFNwZWVkKTtcbiAgICB0aGlzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmZvcmNlRHJvcFdhaXRUaW1lKTtcbiAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMua2V5UmVwZWF0VGltZSk7XG4gICAgdGhpcy5hcmVuYSA9IGNvbnN0cnVjdG9yLm5ld0FyZW5hKHRoaXMub3B0aW9ucy50aWxlV2lkdGgsIHRoaXMub3B0aW9ucy50aWxlSGVpZ2h0KTtcbiAgfVxuICBHYW1lU3RhdGUubmV3QXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KXtcbiAgICB2YXIgcm93LCBjZWxsO1xuICAgIHJldHVybiB7XG4gICAgICBjZWxsczogKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpJCwgdG8kLCBscmVzdWx0JCwgaiQsIHRvMSQsIHJlc3VsdHMkID0gW107XG4gICAgICAgIGZvciAoaSQgPSAwLCB0byQgPSBoZWlnaHQ7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICAgICAgcm93ID0gaSQ7XG4gICAgICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IHdpZHRoOyBqJCA8IHRvMSQ7ICsraiQpIHtcbiAgICAgICAgICAgIGNlbGwgPSBqJDtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICAgIH0oKSksXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH07XG4gIH07XG4gIHJldHVybiBHYW1lU3RhdGU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmlsdGVyLCBUaW1lciwga2V5UmVwZWF0VGltZSwgS0VZLCBBQ1RJT05fTkFNRSwgZXZlbnRTdW1tYXJ5LCBuZXdCbGFua0tleXN0YXRlLCBJbnB1dEhhbmRsZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZpbHRlciA9IHJlZiQuZmlsdGVyO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5rZXlSZXBlYXRUaW1lID0gMTUwO1xuS0VZID0ge1xuICBSRVRVUk46IDEzLFxuICBFU0NBUEU6IDI3LFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDAsXG4gIFo6IDkwLFxuICBYOiA4OFxufTtcbkFDVElPTl9OQU1FID0gKHJlZiQgPSB7fSwgcmVmJFtLRVkuUkVUVVJOICsgXCJcIl0gPSAnY29uZmlybScsIHJlZiRbS0VZLkVTQ0FQRSArIFwiXCJdID0gJ2NhbmNlbCcsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnYWN0aW9uLWEnLCByZWYkW0tFWS5YICsgXCJcIl0gPSAnYWN0aW9uLWEnLCByZWYkW0tFWS5aICsgXCJcIl0gPSAnYWN0aW9uLWInLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAndXAnLCByZWYkW0tFWS5SSUdIVCArIFwiXCJdID0gJ3JpZ2h0JywgcmVmJFtLRVkuRE9XTiArIFwiXCJdID0gJ2Rvd24nLCByZWYkKTtcbmV2ZW50U3VtbWFyeSA9IGZ1bmN0aW9uKGtleSwgc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIGFjdGlvbjogc3RhdGUgPyAnZG93bicgOiAndXAnXG4gIH07XG59O1xubmV3QmxhbmtLZXlzdGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgdXA6IGZhbHNlLFxuICAgIGRvd246IGZhbHNlLFxuICAgIGxlZnQ6IGZhbHNlLFxuICAgIHJpZ2h0OiBmYWxzZSxcbiAgICBhY3Rpb25BOiBmYWxzZSxcbiAgICBhY3Rpb25COiBmYWxzZSxcbiAgICBjb25maXJtOiBmYWxzZSxcbiAgICBjYW5jZWw6IGZhbHNlXG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zdGF0ZVNldHRlciA9IGJpbmQkKHRoaXMsICdzdGF0ZVNldHRlcicsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiSW5wdXRIYW5kbGVyOjpuZXdcIik7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc3RhdGVTZXR0ZXIodHJ1ZSkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5zdGF0ZVNldHRlcihmYWxzZSkpO1xuICAgIHRoaXMuY3VycktleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICAgIHRoaXMubGFzdEtleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICAgIHRoaXMua2V5UmVwZWF0VGltZXIgPSBuZXcgVGltZXIoa2V5UmVwZWF0VGltZSwgdHJ1ZSk7XG4gICAgdGhpcy5sYXN0SGVsZEtleSA9IHZvaWQgODtcbiAgfVxuICBwcm90b3R5cGUuc3RhdGVTZXR0ZXIgPSBjdXJyeSQoKGZ1bmN0aW9uKHN0YXRlLCBhcmckKXtcbiAgICB2YXIgd2hpY2gsIGtleTtcbiAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgaWYgKGtleSA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgdGhpcy5jdXJyS2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgaWYgKHN0YXRlID09PSB0cnVlICYmIHRoaXMubGFzdEhlbGRLZXkgIT09IGtleSkge1xuICAgICAgICB0aGlzLmxhc3RIZWxkS2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlSZXBlYXRUaW1lci5yZXNldCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSksIHRydWUpO1xuICBwcm90b3R5cGUuY2hhbmdlc1NpbmNlTGFzdEZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIga2V5LCBzdGF0ZSwgd2FzRGlmZmVyZW50O1xuICAgIGlmICh0aGlzLmtleVJlcGVhdFRpbWVyLmV4cGlyZWQgJiYgdGhpcy5jdXJyS2V5c3RhdGVbdGhpcy5sYXN0SGVsZEtleV0gPT09IHRydWUpIHtcbiAgICAgIHRoaXMubGFzdEtleXN0YXRlW3RoaXMubGFzdEhlbGRLZXldID0gZmFsc2U7XG4gICAgICB0aGlzLmtleVJlcGVhdFRpbWVyLnJlc2V0V2l0aFJlbWFpbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyKGlkLCAoZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZWYkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gcmVmJCA9IHRoaXMuY3VycktleXN0YXRlKSB7XG4gICAgICAgIHN0YXRlID0gcmVmJFtrZXldO1xuICAgICAgICB3YXNEaWZmZXJlbnQgPSBzdGF0ZSAhPT0gdGhpcy5sYXN0S2V5c3RhdGVba2V5XTtcbiAgICAgICAgdGhpcy5sYXN0S2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgICBpZiAod2FzRGlmZmVyZW50KSB7XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChldmVudFN1bW1hcnkoa2V5LCBzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5kZWJ1Z01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICByZXR1cm4gbG9nKFwiSW5wdXRIYW5kbGVyOjpkZWJ1Z01vZGUgLVwiLCB3aGljaCwgQUNUSU9OX05BTUVbd2hpY2hdIHx8ICdbdW5ib3VuZF0nKTtcbiAgICB9KTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLm9uID0gZnVuY3Rpb24oY29kZSwgzrspe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICBpZiAod2hpY2ggPT09IGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIM67KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBJbnB1dEhhbmRsZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgUGFsZXR0ZSwgQmxpdHRlciwgQXJlbmFWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcbm91dCQuQXJlbmFWaWV3ID0gQXJlbmFWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYVZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0FyZW5hVmlldycsIEFyZW5hVmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYVZpZXc7XG4gIGZ1bmN0aW9uIEFyZW5hVmlldygpe1xuICAgIEFyZW5hVmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5ncmlkID0gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShCbGl0dGVyLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gICAgdGhpcy5jZWxscyA9IChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoQmxpdHRlciwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pO1xuICB9XG4gIHByb3RvdHlwZS5kcmF3Q2VsbHMgPSBmdW5jdGlvbihjZWxscywgc2l6ZSl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIHRpbGUsIHJlc3VsdHMkID0gW107XG4gICAgdGhpcy5jZWxscy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY2VsbHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGNlbGxzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgIGlmICh0aWxlKSB7XG4gICAgICAgICAgdGhpcy5jZWxscy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS50aWxlQ29sb3JzW3RpbGVdO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2godGhpcy5jZWxscy5jdHguZmlsbFJlY3QoMSArIHggKiBzaXplLCAxICsgeSAqIHNpemUsIHNpemUgLSAxLCBzaXplIC0gMSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuZHJhd0dyaWQgPSBmdW5jdGlvbih3LCBoLCBzaXplKXtcbiAgICB2YXIgaSQsIHgsIHk7XG4gICAgdGhpcy5ncmlkLmNsZWFyKCk7XG4gICAgdGhpcy5ncmlkLmN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgdGhpcy5ncmlkLmN0eC5iZWdpblBhdGgoKTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gdzsgKytpJCkge1xuICAgICAgeCA9IGkkO1xuICAgICAgdGhpcy5ncmlkLmN0eC5tb3ZlVG8oeCAqIHNpemUgKyAwLjUsIDApO1xuICAgICAgdGhpcy5ncmlkLmN0eC5saW5lVG8oeCAqIHNpemUgKyAwLjUsIGggKiBzaXplICsgMC41KTtcbiAgICB9XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IGg7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHRoaXMuZ3JpZC5jdHgubW92ZVRvKDAsIHkgKiBzaXplICsgMC41KTtcbiAgICAgIHRoaXMuZ3JpZC5jdHgubGluZVRvKHcgKiBzaXplICsgMC41LCB5ICogc2l6ZSArIDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdyaWQuY3R4LnN0cm9rZSgpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICAgIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgejtcbiAgICBjZWxscyA9IGFyZyQuY2VsbHMsIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQ7XG4gICAgeiA9IGFyZzEkLno7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCAqIHosIGhlaWdodCAqIHopO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzJdO1xuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoMC41LCAwLjUsIHdpZHRoICogeiArIDEsIGhlaWdodCAqIHogKyAxKTtcbiAgICB0aGlzLmRyYXdDZWxscyhjZWxscywgeik7XG4gICAgdGhpcy5ncmlkLmJsaXRUbyh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5jZWxscy5ibGl0VG8odGhpcywgMCwgMCwgMC45KTtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJsaXR0ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5vdXQkLkJsaXR0ZXIgPSBCbGl0dGVyID0gKGZ1bmN0aW9uKCl7XG4gIEJsaXR0ZXIuZGlzcGxheU5hbWUgPSAnQmxpdHRlcic7XG4gIHZhciBwcm90b3R5cGUgPSBCbGl0dGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCbGl0dGVyO1xuICBmdW5jdGlvbiBCbGl0dGVyKG9wdHMsIHgsIHkpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGggPSB4O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0geTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH1cbiAgcHJvdG90eXBlLmJsaXRUbyA9IGZ1bmN0aW9uKGRlc3QsIHgsIHksIGFscGhhKXtcbiAgICB4ID09IG51bGwgJiYgKHggPSAwKTtcbiAgICB5ID09IG51bGwgJiYgKHkgPSAwKTtcbiAgICBhbHBoYSA9PSBudWxsICYmIChhbHBoYSA9IDEpO1xuICAgIGRlc3QuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgZGVzdC5jdHguZHJhd0ltYWdlKHRoaXMuY2FudmFzLCB4LCB5KTtcbiAgICByZXR1cm4gZGVzdC5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICB9O1xuICBwcm90b3R5cGUuYmxpdFRvQ2FudmFzID0gZnVuY3Rpb24oZGVzdENhbnZhcyl7XG4gICAgdmFyIGN0eDtcbiAgICBjdHggPSBkZXN0Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBkZXN0Q2FudmFzLndpZHRoLCBkZXN0Q2FudmFzLmhlaWdodCk7XG4gICAgcmV0dXJuIGN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIDAsIDAsIGRlc3RDYW52YXMud2lkdGgsIGRlc3RDYW52YXMuaGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgfTtcbiAgcmV0dXJuIEJsaXR0ZXI7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCB0aWxlQ29sb3JzLCBCbGl0dGVyLCBCcmlja1ZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG50aWxlQ29sb3JzID0gcmVxdWlyZSgnLi9wYWxldHRlJykudGlsZUNvbG9ycztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xub3V0JC5Ccmlja1ZpZXcgPSBCcmlja1ZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2tWaWV3JywgQnJpY2tWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrVmlldztcbiAgZnVuY3Rpb24gQnJpY2tWaWV3KCl7XG4gICAgQnJpY2tWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgeSwgcm93LCBqJCwgbGVuMSQsIHgsIGNlbGw7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBicmljay5zaGFwZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRpbGVDb2xvcnNbY2VsbF07XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoeCAqIHRoaXMub3B0cy56ICsgMSwgeSAqIHRoaXMub3B0cy56ICsgMSwgdGhpcy5vcHRzLnogLSAxLCB0aGlzLm9wdHMueiAtIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICByZXR1cm4gQnJpY2tWaWV3O1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmxpdHRlciwgUGFsZXR0ZSwgQXJlbmFWaWV3LCBCcmlja1ZpZXcsIE5leHRCcmlja1ZpZXcsIENhbnZhc1JlbmRlcmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcbkFyZW5hVmlldyA9IHJlcXVpcmUoJy4vYXJlbmEnKS5BcmVuYVZpZXc7XG5Ccmlja1ZpZXcgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2tWaWV3O1xuTmV4dEJyaWNrVmlldyA9IHJlcXVpcmUoJy4vbmV4dC1icmljaycpLk5leHRCcmlja1ZpZXc7XG5vdXQkLkNhbnZhc1JlbmRlcmVyID0gQ2FudmFzUmVuZGVyZXIgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKENhbnZhc1JlbmRlcmVyLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdDYW52YXNSZW5kZXJlcicsIENhbnZhc1JlbmRlcmVyKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IENhbnZhc1JlbmRlcmVyO1xuICBmdW5jdGlvbiBDYW52YXNSZW5kZXJlcihvcHRzKXtcbiAgICB2YXIgejtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMueiA9IHogPSB0aGlzLm9wdHMuejtcbiAgICBDYW52YXNSZW5kZXJlci5zdXBlcmNsYXNzLmNhbGwodGhpcywgdGhpcy5vcHRzLCAxNyAqIHosIDIwICogeik7XG4gICAgdGhpcy5hcmVuYSA9IG5ldyBBcmVuYVZpZXcodGhpcy5vcHRzLCAxMCAqIHogKyAyLCAxOCAqIHogKyAyKTtcbiAgICB0aGlzLmJyaWNrID0gbmV3IEJyaWNrVmlldyh0aGlzLm9wdHMsIDQgKiB6LCA0ICogeik7XG4gICAgdGhpcy5uZXh0ID0gbmV3IE5leHRCcmlja1ZpZXcodGhpcy5vcHRzLCA0ICogeiwgNCAqIHopO1xuICAgIHRoaXMub3V0cHV0Q2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICAgIHRoaXMub3V0cHV0Q2FudmFzLndpZHRoID0gMSArIDE3ICogdGhpcy5vcHRzLno7XG4gICAgdGhpcy5vdXRwdXRDYW52YXMuaGVpZ2h0ID0gMSArIDIwICogdGhpcy5vcHRzLno7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlclN0YXJ0TWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGxvZygncmVuZGVyLXN0YXJ0LW1lbnUnKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckJsYW5rID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jbGVhcigpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihncy5icmljay5jdXJyZW50LCB0aGlzLm9wdHMpO1xuICAgIHRoaXMubmV4dC5yZW5kZXIoZ3MuYnJpY2submV4dCwgdGhpcy5vcHRzKTtcbiAgICB0aGlzLmFyZW5hLnJlbmRlcihncy5hcmVuYSwgdGhpcy5vcHRzKTtcbiAgICByZXR1cm4gdGhpcy5jb2xsYXBzZUFsbChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5jb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcG9zO1xuICAgIHBvcyA9IGdzLmJyaWNrLmN1cnJlbnQucG9zO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5icmljay5ibGl0VG8odGhpcy5hcmVuYSwgcG9zWzBdICogdGhpcy56LCBwb3NbMV0gKiB0aGlzLnopO1xuICAgIHRoaXMuYXJlbmEuYmxpdFRvKHRoaXMsIHRoaXMub3B0cy56LCB0aGlzLm9wdHMueik7XG4gICAgcmV0dXJuIHRoaXMubmV4dC5ibGl0VG8odGhpcywgKDIgKyBncy5hcmVuYS53aWR0aCkgKiB0aGlzLnosIDEgKiB0aGlzLnopO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICB2YXIgbWV0YWdhbWVTdGF0ZSwgb3V0cHV0QmxpdHRlcjtcbiAgICBtZXRhZ2FtZVN0YXRlID0gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgb3V0cHV0QmxpdHRlciA9IChmdW5jdGlvbigpe1xuICAgICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgICBjYXNlICduby1nYW1lJzpcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyU3RhcnRNZW51KGdhbWVTdGF0ZSk7XG4gICAgICBjYXNlICdwYXVzZSc6XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclBhdXNlTWVudShnYW1lU3RhdGUpO1xuICAgICAgY2FzZSAnZ2FtZSc6XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlckdhbWUoZ2FtZVN0YXRlKTtcbiAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlcldpblNjcmVlbihnYW1lU3RhdGUpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyQmxhbmsoKTtcbiAgICAgIH1cbiAgICB9LmNhbGwodGhpcykpO1xuICAgIHJldHVybiB0aGlzLmJsaXRUb0NhbnZhcyh0aGlzLm91dHB1dENhbnZhcyk7XG4gIH07XG4gIHByb3RvdHlwZS5hcHBlbmRUbyA9IGZ1bmN0aW9uKGhvc3Qpe1xuICAgIHJldHVybiBob3N0LmFwcGVuZENoaWxkKHRoaXMub3V0cHV0Q2FudmFzKTtcbiAgfTtcbiAgcmV0dXJuIENhbnZhc1JlbmRlcmVyO1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQnJpY2tWaWV3LCBCbGl0dGVyLCBQYWxldHRlLCBOZXh0QnJpY2tWaWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQnJpY2tWaWV3ID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrVmlldztcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5vdXQkLk5leHRCcmlja1ZpZXcgPSBOZXh0QnJpY2tWaWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChOZXh0QnJpY2tWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdOZXh0QnJpY2tWaWV3JywgTmV4dEJyaWNrVmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBOZXh0QnJpY2tWaWV3O1xuICBmdW5jdGlvbiBOZXh0QnJpY2tWaWV3KCl7XG4gICAgTmV4dEJyaWNrVmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmlja1ZpZXcodGhpcy5vcHRzLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH1cbiAgcHJvdG90eXBlLnByZXR0eU9mZnNldCA9IGZ1bmN0aW9uKHR5cGUpe1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIGNhc2UgJ3ppZyc6XG4gICAgICByZXR1cm4gWzAuNSwgMF07XG4gICAgY2FzZSAnemFnJzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4gWzAuNSwgMF07XG4gICAgY2FzZSAndGVlJzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICd0ZXRyaXMnOlxuICAgICAgcmV0dXJuIFswLCAtMC41XTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXJCZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzNdO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFsyXTtcbiAgICByZXR1cm4gdGhpcy5jdHguc3Ryb2tlUmVjdCgwLjUsIDAuNSwgdGhpcy53aWR0aCAtIDEsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIHJlZiQsIHgsIHk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMucmVuZGVyQmcoKTtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihicmljayk7XG4gICAgcmVmJCA9IHRoaXMucHJldHR5T2Zmc2V0KGJyaWNrLnR5cGUpLCB4ID0gcmVmJFswXSwgeSA9IHJlZiRbMV07XG4gICAgcmV0dXJuIHRoaXMuYnJpY2suYmxpdFRvKHRoaXMsIHggKiB0aGlzLm9wdHMueiwgeSAqIHRoaXMub3B0cy56KTtcbiAgfTtcbiAgcmV0dXJuIE5leHRCcmlja1ZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciBuZXV0cmFsLCByZWQsIG9yYW5nZSwgZ3JlZW4sIG1hZ2VudGEsIGJsdWUsIGJyb3duLCB5ZWxsb3csIGN5YW4sIHRpbGVDb2xvcnMsIFBhbGV0dGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLm5ldXRyYWwgPSBuZXV0cmFsID0gWycjZmZmZmZmJywgJyNjY2NjY2MnLCAnIzg4ODg4OCcsICcjMjEyMTIxJ107XG5vdXQkLnJlZCA9IHJlZCA9IFsnI0ZGNDQ0NCcsICcjRkY3Nzc3JywgJyNkZDQ0NDQnLCAnIzU1MTExMSddO1xub3V0JC5vcmFuZ2UgPSBvcmFuZ2UgPSBbJyNGRkJCMzMnLCAnI0ZGQ0M4OCcsICcjQ0M4ODAwJywgJyM1NTMzMDAnXTtcbm91dCQuZ3JlZW4gPSBncmVlbiA9IFsnIzQ0ZmY2NicsICcjODhmZmFhJywgJyMyMmJiMzMnLCAnIzExNTUxMSddO1xub3V0JC5tYWdlbnRhID0gbWFnZW50YSA9IFsnI2ZmMzNmZicsICcjZmZhYWZmJywgJyNiYjIyYmInLCAnIzU1MTE1NSddO1xub3V0JC5ibHVlID0gYmx1ZSA9IFsnIzY2YmJmZicsICcjYWFkZGZmJywgJyM1NTg4ZWUnLCAnIzExMTE1NSddO1xub3V0JC5icm93biA9IGJyb3duID0gWycjZmZiYjMzJywgJyNmZmNjODgnLCAnI2JiOTkwMCcsICcjNTU1NTExJ107XG5vdXQkLnllbGxvdyA9IHllbGxvdyA9IFsnI2VlZWUxMScsICcjZmZmZmFhJywgJyNjY2JiMDAnLCAnIzU1NTUxMSddO1xub3V0JC5jeWFuID0gY3lhbiA9IFsnIzQ0ZGRmZicsICcjYWFlM2ZmJywgJyMwMGFhY2MnLCAnIzAwNjY5OSddO1xub3V0JC50aWxlQ29sb3JzID0gdGlsZUNvbG9ycyA9IFtuZXV0cmFsWzJdLCByZWRbMF0sIG9yYW5nZVswXSwgeWVsbG93WzBdLCBncmVlblswXSwgY3lhblswXSwgYmx1ZVsyXSwgbWFnZW50YVswXV07XG5vdXQkLlBhbGV0dGUgPSBQYWxldHRlID0ge1xuICBuZXV0cmFsOiBuZXV0cmFsLFxuICByZWQ6IHJlZCxcbiAgb3JhbmdlOiBvcmFuZ2UsXG4gIHllbGxvdzogeWVsbG93LFxuICBncmVlbjogZ3JlZW4sXG4gIGN5YW46IGN5YW4sXG4gIGJsdWU6IGJsdWUsXG4gIG1hZ2VudGE6IG1hZ2VudGEsXG4gIHRpbGVDb2xvcnM6IHRpbGVDb2xvcnNcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGVsLCBEb21SZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbmVsID0gYmluZCQoZG9jdW1lbnQsICdjcmVhdGVFbGVtZW50Jyk7XG5vdXQkLkRvbVJlbmRlcmVyID0gRG9tUmVuZGVyZXIgPSAoZnVuY3Rpb24oKXtcbiAgRG9tUmVuZGVyZXIuZGlzcGxheU5hbWUgPSAnRG9tUmVuZGVyZXInO1xuICB2YXIgcHJvdG90eXBlID0gRG9tUmVuZGVyZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERvbVJlbmRlcmVyO1xuICBmdW5jdGlvbiBEb21SZW5kZXJlcihvcHRzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMuZG9tID0ge1xuICAgICAgbWFpbjogZWwoJ2RpdicpXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXt9O1xuICBwcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLmRvbS5tYWluKTtcbiAgfTtcbiAgcmV0dXJuIERvbVJlbmRlcmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciBpZCwgbG9nLCBmbGlwLCBkZWxheSwgZmxvb3IsIHJhbmRvbSwgcmFuZCwgcmFuZG9tRnJvbSwgYWRkVjIsIGZpbHRlciwgd3JhcCwgbGltaXQsIHJhZiwgdGhhdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5hZGRWMiA9IGFkZFYyID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBbYVswXSArIGJbMF0sIGFbMV0gKyBiWzFdXTtcbn07XG5vdXQkLmZpbHRlciA9IGZpbHRlciA9IGN1cnJ5JChmdW5jdGlvbijOuywgbGlzdCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsaXN0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxpc3RbaSRdO1xuICAgIGlmICjOuyh4KSkge1xuICAgICAgcmVzdWx0cyQucHVzaCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLndyYXAgPSB3cmFwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQubGltaXQgPSBsaW1pdCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLnJhZiA9IHJhZiA9ICh0aGF0ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICA/IHRoYXRcbiAgOiAodGhhdCA9IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICA/IHRoYXRcbiAgICA6ICh0aGF0ID0gd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IGZ1bmN0aW9uKM67KXtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQozrssIDEwMDAgLyA2MCk7XG4gICAgICB9O1xuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHNxdWFyZSwgemlnLCB6YWcsIGxlZnQsIHJpZ2h0LCB0ZWUsIHRldHJpcywgYWxsLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5zcXVhcmUgPSBzcXVhcmUgPSBbW1swLCAwLCAwXSwgWzAsIDEsIDFdLCBbMCwgMSwgMV1dXTtcbm91dCQuemlnID0gemlnID0gW1tbMCwgMCwgMF0sIFsyLCAyLCAwXSwgWzAsIDIsIDJdXSwgW1swLCAyLCAwXSwgWzIsIDIsIDBdLCBbMiwgMCwgMF1dXTtcbm91dCQuemFnID0gemFnID0gW1tbMCwgMCwgMF0sIFswLCAzLCAzXSwgWzMsIDMsIDBdXSwgW1szLCAwLCAwXSwgWzMsIDMsIDBdLCBbMCwgMywgMF1dXTtcbm91dCQubGVmdCA9IGxlZnQgPSBbW1swLCAwLCAwXSwgWzQsIDQsIDRdLCBbNCwgMCwgMF1dLCBbWzQsIDQsIDBdLCBbMCwgNCwgMF0sIFswLCA0LCAwXV0sIFtbMCwgMCwgNF0sIFs0LCA0LCA0XSwgWzAsIDAsIDBdXSwgW1swLCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgNF1dXTtcbm91dCQucmlnaHQgPSByaWdodCA9IFtbWzAsIDAsIDBdLCBbNSwgNSwgNV0sIFswLCAwLCA1XV0sIFtbMCwgNSwgMF0sIFswLCA1LCAwXSwgWzUsIDUsIDBdXSwgW1s1LCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgMF1dLCBbWzAsIDUsIDVdLCBbMCwgNSwgMF0sIFswLCA1LCAwXV1dO1xub3V0JC50ZWUgPSB0ZWUgPSBbW1swLCAwLCAwXSwgWzYsIDYsIDZdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgMF0sIFswLCA2LCAwXV0sIFtbMCwgNiwgMF0sIFs2LCA2LCA2XSwgWzAsIDAsIDBdXSwgW1swLCA2LCAwXSwgWzAsIDYsIDZdLCBbMCwgNiwgMF1dXTtcbm91dCQudGV0cmlzID0gdGV0cmlzID0gW1tbMCwgMCwgMCwgMF0sIFswLCAwLCAwLCAwXSwgWzcsIDcsIDcsIDddXSwgW1swLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXV1dO1xub3V0JC5hbGwgPSBhbGwgPSBbXG4gIHtcbiAgICB0eXBlOiAnc3F1YXJlJyxcbiAgICBzaGFwZXM6IHNxdWFyZVxuICB9LCB7XG4gICAgdHlwZTogJ3ppZycsXG4gICAgc2hhcGVzOiB6aWdcbiAgfSwge1xuICAgIHR5cGU6ICd6YWcnLFxuICAgIHNoYXBlczogemFnXG4gIH0sIHtcbiAgICB0eXBlOiAnbGVmdCcsXG4gICAgc2hhcGVzOiBsZWZ0XG4gIH0sIHtcbiAgICB0eXBlOiAncmlnaHQnLFxuICAgIHNoYXBlczogcmlnaHRcbiAgfSwge1xuICAgIHR5cGU6ICd0ZWUnLFxuICAgIHNoYXBlczogdGVlXG4gIH0sIHtcbiAgICB0eXBlOiAndGV0cmlzJyxcbiAgICBzaGFwZXM6IHRldHJpc1xuICB9XG5dOyIsInZhciByZWYkLCBpZCwgbG9nLCBhZGRWMiwgcmFuZCwgd3JhcCwgcmFuZG9tRnJvbSwgQnJpY2tTaGFwZXMsIGNhbkRyb3AsIGNhbk1vdmUsIGNhblJvdGF0ZSwgY29sbGlkZXMsIGNvcHlCcmlja1RvQXJlbmEsIHRvcElzUmVhY2hlZCwgaXNDb21wbGV0ZSwgbmV3QnJpY2ssIHNwYXduTmV3QnJpY2ssIGRyb3BBcmVuYVJvdywgY2xlYXJBcmVuYSwgZ2V0U2hhcGVPZlJvdGF0aW9uLCBub3JtYWxpc2VSb3RhdGlvbiwgcm90YXRlQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGFkZFYyID0gcmVmJC5hZGRWMiwgcmFuZCA9IHJlZiQucmFuZCwgd3JhcCA9IHJlZiQud3JhcCwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbTtcbkJyaWNrU2hhcGVzID0gcmVxdWlyZSgnLi9kYXRhL2JyaWNrLXNoYXBlcycpO1xub3V0JC5jYW5Ecm9wID0gY2FuRHJvcCA9IGZ1bmN0aW9uKGJyaWNrLCBhcmVuYSl7XG4gIHJldHVybiBjYW5Nb3ZlKGJyaWNrLCBbMCwgMV0sIGFyZW5hKTtcbn07XG5vdXQkLmNhbk1vdmUgPSBjYW5Nb3ZlID0gZnVuY3Rpb24oYnJpY2ssIG1vdmUsIGFyZW5hKXtcbiAgdmFyIG5ld1BvcztcbiAgbmV3UG9zID0gYWRkVjIoYnJpY2sucG9zLCBtb3ZlKTtcbiAgcmV0dXJuIGNvbGxpZGVzKG5ld1BvcywgYnJpY2suc2hhcGUsIGFyZW5hKTtcbn07XG5vdXQkLmNhblJvdGF0ZSA9IGNhblJvdGF0ZSA9IGZ1bmN0aW9uKGJyaWNrLCBkaXIsIGFyZW5hKXtcbiAgdmFyIG5ld1NoYXBlO1xuICBuZXdTaGFwZSA9IGdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24gKyBkaXIpO1xuICByZXR1cm4gY29sbGlkZXMoYnJpY2sucG9zLCBuZXdTaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY29sbGlkZXMgPSBjb2xsaWRlcyA9IGZ1bmN0aW9uKHBvcywgc2hhcGUsIGFyZyQpe1xuICB2YXIgY2VsbHMsIHdpZHRoLCBoZWlnaHQsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1O1xuICBjZWxscyA9IGFyZyQuY2VsbHMsIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQ7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGlmIChzaGFwZVt5XVt4XSA+IDApIHtcbiAgICAgICAgaWYgKHYgPj0gMCkge1xuICAgICAgICAgIGlmICh2ID49IGhlaWdodCB8fCB1ID49IHdpZHRoIHx8IHUgPCAwIHx8IGNlbGxzW3ZdW3VdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC5jb3B5QnJpY2tUb0FyZW5hID0gY29weUJyaWNrVG9BcmVuYSA9IGZ1bmN0aW9uKGFyZyQsIGFyZzEkKXtcbiAgdmFyIHBvcywgc2hhcGUsIGNlbGxzLCBpJCwgcmVmJCwgbGVuJCwgeSwgdiwgbHJlc3VsdCQsIGokLCByZWYxJCwgbGVuMSQsIHgsIHUsIHJlc3VsdHMkID0gW107XG4gIHBvcyA9IGFyZyQucG9zLCBzaGFwZSA9IGFyZyQuc2hhcGU7XG4gIGNlbGxzID0gYXJnMSQuY2VsbHM7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdICYmIHYgPj0gMCkge1xuICAgICAgICBscmVzdWx0JC5wdXNoKGNlbGxzW3ZdW3VdID0gc2hhcGVbeV1beF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLnRvcElzUmVhY2hlZCA9IHRvcElzUmVhY2hlZCA9IGZ1bmN0aW9uKGFyZyQpe1xuICB2YXIgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCBjZWxsO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBjZWxsc1swXSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcmVmJFtpJF07XG4gICAgaWYgKGNlbGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xub3V0JC5pc0NvbXBsZXRlID0gaXNDb21wbGV0ZSA9IGZ1bmN0aW9uKHJvdyl7XG4gIHZhciBpJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3cubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcm93W2kkXTtcbiAgICBpZiAoIWNlbGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xub3V0JC5uZXdCcmljayA9IG5ld0JyaWNrID0gZnVuY3Rpb24oaXgpe1xuICBpeCA9PSBudWxsICYmIChpeCA9IHJhbmQoMCwgQnJpY2tTaGFwZXMuYWxsLmxlbmd0aCkpO1xuICByZXR1cm4ge1xuICAgIHJvdGF0aW9uOiAwLFxuICAgIHNoYXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnNoYXBlc1swXSxcbiAgICB0eXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnR5cGUsXG4gICAgcG9zOiBbMCwgMF1cbiAgfTtcbn07XG5vdXQkLnNwYXduTmV3QnJpY2sgPSBzcGF3bk5ld0JyaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICBncy5icmljay5jdXJyZW50ID0gZ3MuYnJpY2submV4dDtcbiAgZ3MuYnJpY2suY3VycmVudC5wb3MgPSBbNCwgLTFdO1xuICByZXR1cm4gZ3MuYnJpY2submV4dCA9IG5ld0JyaWNrKCk7XG59O1xub3V0JC5kcm9wQXJlbmFSb3cgPSBkcm9wQXJlbmFSb3cgPSBmdW5jdGlvbihhcmckLCByb3dJeCl7XG4gIHZhciBjZWxscztcbiAgY2VsbHMgPSBhcmckLmNlbGxzO1xuICBjZWxscy5zcGxpY2Uocm93SXgsIDEpO1xuICByZXR1cm4gY2VsbHMudW5zaGlmdChyZXBlYXRBcnJheSQoWzBdLCBjZWxsc1swXS5sZW5ndGgpKTtcbn07XG5vdXQkLmNsZWFyQXJlbmEgPSBjbGVhckFyZW5hID0gZnVuY3Rpb24oYXJlbmEpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgaSwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgaSA9IGokO1xuICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICBscmVzdWx0JC5wdXNoKHJvd1tpXSA9IDApO1xuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC5nZXRTaGFwZU9mUm90YXRpb24gPSBnZXRTaGFwZU9mUm90YXRpb24gPSBmdW5jdGlvbihicmljaywgcm90YXRpb24pe1xuICByb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCByb3RhdGlvbik7XG4gIHJldHVybiBCcmlja1NoYXBlc1ticmljay50eXBlXVtyb3RhdGlvbl07XG59O1xub3V0JC5ub3JtYWxpc2VSb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uID0gZnVuY3Rpb24oYXJnJCwgcm90YXRpb24pe1xuICB2YXIgdHlwZTtcbiAgdHlwZSA9IGFyZyQudHlwZTtcbiAgcmV0dXJuIHdyYXAoMCwgQnJpY2tTaGFwZXNbdHlwZV0ubGVuZ3RoIC0gMSwgcm90YXRpb24pO1xufTtcbm91dCQucm90YXRlQnJpY2sgPSByb3RhdGVCcmljayA9IGZ1bmN0aW9uKGJyaWNrLCBkaXIpe1xuICB2YXIgcm90YXRpb24sIHR5cGU7XG4gIHJvdGF0aW9uID0gYnJpY2sucm90YXRpb24sIHR5cGUgPSBicmljay50eXBlO1xuICBicmljay5yb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBicmljay5zaGFwZSA9IGdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24pO1xufTtcbmZ1bmN0aW9uIHJlcGVhdEFycmF5JChhcnIsIG4pe1xuICBmb3IgKHZhciByID0gW107IG4gPiAwOyAobiA+Pj0gMSkgJiYgKGFyciA9IGFyci5jb25jYXQoYXJyKSkpXG4gICAgaWYgKG4gJiAxKSByLnB1c2guYXBwbHkociwgYXJyKTtcbiAgcmV0dXJuIHI7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIENvcmUsIFRldHJpc0dhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5yYW5kb21Gcm9tID0gcmVxdWlyZSgnc3RkJykucmFuZG9tRnJvbTtcbkNvcmUgPSByZXF1aXJlKCcuL2dhbWUtY29yZScpO1xub3V0JC5UZXRyaXNHYW1lID0gVGV0cmlzR2FtZSA9IChmdW5jdGlvbigpe1xuICBUZXRyaXNHYW1lLmRpc3BsYXlOYW1lID0gJ1RldHJpc0dhbWUnO1xuICB2YXIgcHJvdG90eXBlID0gVGV0cmlzR2FtZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGV0cmlzR2FtZTtcbiAgZnVuY3Rpb24gVGV0cmlzR2FtZShnYW1lU3RhdGUpe1xuICAgIGxvZyhcIlRldHJpc0dhbWU6Om5ld1wiKTtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0ZhaWxTY3JlZW4gPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgY29uc29sZS5kZWJ1ZygnRkFJTEVEJyk7XG4gICAgcmV0dXJuIHRoaXMuYmVnaW5OZXdHYW1lKGdhbWVTdGF0ZSk7XG4gIH07XG4gIHByb3RvdHlwZS5iZWdpbk5ld0dhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIChmdW5jdGlvbigpe1xuICAgICAgQ29yZS5jbGVhckFyZW5hKHRoaXMuYXJlbmEpO1xuICAgICAgdGhpcy5icmljay5uZXh0ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5uZXh0LnBvcyA9IFszLCAtMV07XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQgPSBDb3JlLm5ld0JyaWNrKCk7XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQucG9zID0gWzMsIC0xXTtcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgdGhpcy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0KCk7XG4gICAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lci5yZXNldCgpO1xuICAgIH0uY2FsbChnYW1lU3RhdGUpKTtcbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZUdhbWUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXRTdGF0ZSwgcmVmJCwga2V5LCBhY3Rpb24sIHJvd3NEcm9wcGVkLCByZXMkLCBpJCwgaXgsIHJvdywgbGVuJCwgcm93SXg7XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzBdIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIDEsIGFyZW5hKSkge1xuICAgICAgICAgICAgQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1iJzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgLTEsIGFyZW5hKSkge1xuICAgICAgICAgICAgQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAtMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdzLmZvcmNlRG93bk1vZGUgJiYgZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci5leHBpcmVkKSB7XG4gICAgICBpZiAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ29yZS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlO1xuICAgICAgICBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLnJlc2V0KCk7XG4gICAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci50YXJnZXRUaW1lO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ3MudGltZXJzLmRyb3BUaW1lci5leHBpcmVkKSB7XG4gICAgICBncy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0V2l0aFJlbWFpbmRlcigpO1xuICAgICAgaWYgKENvcmUuY2FuRHJvcChicmljay5jdXJyZW50LCBhcmVuYSkpIHtcbiAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMV0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIENvcmUuY29weUJyaWNrVG9BcmVuYShicmljay5jdXJyZW50LCBhcmVuYSk7XG4gICAgICAgIENvcmUuc3Bhd25OZXdCcmljayhncyk7XG4gICAgICB9XG4gICAgICByZXMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgcm93SXggPSByZWYkW2kkXTtcbiAgICAgICAgcmVzJC5wdXNoKENvcmUuZHJvcEFyZW5hUm93KGdzLmFyZW5hLCByb3dJeCkpO1xuICAgICAgfVxuICAgICAgcm93c0Ryb3BwZWQgPSByZXMkO1xuICAgICAgZ3MubGluZXMgKz0gcm93c0Ryb3BwZWQubGVuZ3RoO1xuICAgICAgaWYgKENvcmUudG9wSXNSZWFjaGVkKGFyZW5hKSkge1xuICAgICAgICByZXR1cm4gZ3MubWV0YWdhbWVTdGF0ZSA9ICdmYWlsdXJlJztcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZm4kKCl7XG4gICAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGl4ID0gaSQ7XG4gICAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgICBpZiAoQ29yZS5pc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGl4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZyYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuc2hvd0ZhaWxTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5hZHZhbmNlR2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICB0aGlzLmJlZ2luTmV3R2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1Vua25vd24gbWV0YWdhbWUtc3RhdGU6JywgbWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHJldHVybiBUZXRyaXNHYW1lO1xufSgpKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXRyaXNHYW1lOiBUZXRyaXNHYW1lXG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBmbG9vciwgYXNjaWlQcm9ncmVzc0JhciwgVGltZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vcjtcbmFzY2lpUHJvZ3Jlc3NCYXIgPSBjdXJyeSQoZnVuY3Rpb24obGVuLCB2YWwsIG1heCl7XG4gIHZhciB2YWx1ZUNoYXJzLCBlbXB0eUNoYXJzO1xuICB2YWwgPSB2YWwgPiBtYXggPyBtYXggOiB2YWw7XG4gIHZhbHVlQ2hhcnMgPSBmbG9vcihsZW4gKiB2YWwgLyBtYXgpO1xuICBlbXB0eUNoYXJzID0gbGVuIC0gdmFsdWVDaGFycztcbiAgcmV0dXJuIHJlcGVhdFN0cmluZyQoXCLilpJcIiwgdmFsdWVDaGFycykgKyByZXBlYXRTdHJpbmckKFwiLVwiLCBlbXB0eUNoYXJzKTtcbn0pO1xub3V0JC5UaW1lciA9IFRpbWVyID0gKGZ1bmN0aW9uKCl7XG4gIFRpbWVyLmRpc3BsYXlOYW1lID0gJ1RpbWVyJztcbiAgdmFyIGFsbFRpbWVycywgcHJvZ2JhciwgcmVmJCwgVElNRVJfQUNUSVZFLCBUSU1FUl9FWFBJUkVELCBwcm90b3R5cGUgPSBUaW1lci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGltZXI7XG4gIGFsbFRpbWVycyA9IFtdO1xuICBwcm9nYmFyID0gYXNjaWlQcm9ncmVzc0JhcigyMSk7XG4gIHJlZiQgPSBbMCwgMV0sIFRJTUVSX0FDVElWRSA9IHJlZiRbMF0sIFRJTUVSX0VYUElSRUQgPSByZWYkWzFdO1xuICBmdW5jdGlvbiBUaW1lcih0YXJnZXRUaW1lLCBiZWdpbil7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGFyZ2V0VGltZSAhPSBudWxsID8gdGFyZ2V0VGltZSA6IDEwMDA7XG4gICAgYmVnaW4gPT0gbnVsbCAmJiAoYmVnaW4gPSBmYWxzZSk7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy5zdGF0ZSA9IGJlZ2luID8gVElNRVJfQUNUSVZFIDogVElNRVJfRVhQSVJFRDtcbiAgICB0aGlzLmFjdGl2ZSA9IGJlZ2luO1xuICAgIHRoaXMuZXhwaXJlZCA9ICFiZWdpbjtcbiAgICBhbGxUaW1lcnMucHVzaCh0aGlzKTtcbiAgfVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAnYWN0aXZlJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9BQ1RJVkU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2V4cGlyZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFRJTUVSX0VYUElSRUQ7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Byb2dyZXNzJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lIC8gdGhpcy50YXJnZXRUaW1lO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICd0aW1lVG9FeHBpcnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGV4cFRpbWUpe1xuICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZSAtIGV4cFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lICs9IM6UdDtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMudGFyZ2V0VGltZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldFdpdGhSZW1haW5kZXIgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lIC0gdGltZTtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfQUNUSVZFO1xuICB9O1xuICBwcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9FWFBJUkVEO1xuICB9O1xuICBwcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5zcGxpY2UoYWxsVGltZXJzLmluZGV4T2YodGhpcyksIDEpO1xuICB9O1xuICBwcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIlRJTUVSOiBcIiArIHRoaXMudGFyZ2V0VGltZSArIFwiXFxuU1RBVEU6IFwiICsgdGhpcy5zdGF0ZSArIFwiIChcIiArIHRoaXMuYWN0aXZlICsgXCJ8XCIgKyB0aGlzLmV4cGlyZWQgKyBcIilcXG5cIiArIHByb2diYXIodGhpcy5jdXJyZW50VGltZSwgdGhpcy50YXJnZXRUaW1lKTtcbiAgfTtcbiAgVGltZXIudXBkYXRlQWxsID0gZnVuY3Rpb24ozpR0KXtcbiAgICByZXR1cm4gYWxsVGltZXJzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudXBkYXRlKM6UdCk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBUaW1lcjtcbn0oKSk7XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
