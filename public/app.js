(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, CanvasRenderer, FrameDriver, InputHandler, TetrisGame, GameState, DebugOutput, gameOpts, renderOpts, inputHandler, renderer, gameState, tetrisGame, debugOutput, outputCanvas, frameDriver;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
CanvasRenderer = require('./renderers/canvas').CanvasRenderer;
FrameDriver = require('./frame-driver').FrameDriver;
InputHandler = require('./input-handler').InputHandler;
ref$ = require('./tetris-game'), TetrisGame = ref$.TetrisGame, GameState = ref$.GameState;
DebugOutput = require('./debug-output').DebugOutput;
gameOpts = {
  tileWidth: 10,
  tileHeight: 18
};
renderOpts = {
  z: 20
};
inputHandler = new InputHandler;
renderer = new CanvasRenderer(renderOpts);
gameState = new GameState(gameOpts);
tetrisGame = new TetrisGame(gameState);
debugOutput = new DebugOutput;
outputCanvas = document.getElementById('canvas');
outputCanvas.width = 1 + 17 * renderOpts.z;
outputCanvas.height = 1 + 20 * renderOpts.z;
InputHandler.on(192, function(){
  if (frameDriver.state.running) {
    return frameDriver.stop();
  } else {
    return frameDriver.start();
  }
});
frameDriver = new FrameDriver(function(Δt, time, frame){
  var outputBlitter;
  gameState.elapsedTime = time;
  gameState.elapsedFrames = frame;
  gameState.inputState = inputHandler.changesSinceLastFrame();
  gameState = tetrisGame.runFrame(gameState, Δt);
  outputBlitter = renderer.render(gameState, renderOpts);
  if (debugOutput != null) {
    debugOutput.render(gameState);
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
},{"./debug-output":2,"./frame-driver":3,"./input-handler":4,"./renderers/canvas":8,"./tetris-game":15,"std":11}],2:[function(require,module,exports){
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
},{"std":11}],3:[function(require,module,exports){
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
},{"std":11}],4:[function(require,module,exports){
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
},{"std":11}],5:[function(require,module,exports){
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
},{"./blitter":6,"./palette":10,"std":11}],6:[function(require,module,exports){
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
},{"std":11}],7:[function(require,module,exports){
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
},{"./blitter":6,"./palette":10,"std":11}],8:[function(require,module,exports){
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
    var metagameState;
    metagameState = gameState.metagameState;
    switch (metagameState) {
    case 'no-game':
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
    return this;
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
},{"./arena":5,"./blitter":6,"./brick":7,"./next-brick":9,"./palette":10,"std":11}],9:[function(require,module,exports){
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
},{"./blitter":6,"./brick":7,"./palette":10,"std":11}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{"./data/brick-shapes":12,"std":11}],14:[function(require,module,exports){
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
},{"./timer":16,"std":11}],15:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, GameState, Timer, Core, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
randomFrom = require('std').randomFrom;
GameState = require('./game-state').GameState;
Timer = require('./timer').Timer;
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
    Timer.updateAll(Δt);
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
  TetrisGame: TetrisGame,
  GameState: GameState
};
},{"./game-core":13,"./game-state":14,"./timer":16,"std":11}],16:[function(require,module,exports){
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
},{"std":11}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYXJlbmEubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3JlbmRlcmVycy9jYW52YXMvYmxpdHRlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvcmVuZGVyZXJzL2NhbnZhcy9uZXh0LWJyaWNrLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9yZW5kZXJlcnMvY2FudmFzL3BhbGV0dGUubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZ2FtZS1zdGF0ZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3RpbWVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIGRlbGF5LCBDYW52YXNSZW5kZXJlciwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGV0cmlzR2FtZSwgR2FtZVN0YXRlLCBEZWJ1Z091dHB1dCwgZ2FtZU9wdHMsIHJlbmRlck9wdHMsIGlucHV0SGFuZGxlciwgcmVuZGVyZXIsIGdhbWVTdGF0ZSwgdGV0cmlzR2FtZSwgZGVidWdPdXRwdXQsIG91dHB1dENhbnZhcywgZnJhbWVEcml2ZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5DYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXJzL2NhbnZhcycpLkNhbnZhc1JlbmRlcmVyO1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xucmVmJCA9IHJlcXVpcmUoJy4vdGV0cmlzLWdhbWUnKSwgVGV0cmlzR2FtZSA9IHJlZiQuVGV0cmlzR2FtZSwgR2FtZVN0YXRlID0gcmVmJC5HYW1lU3RhdGU7XG5EZWJ1Z091dHB1dCA9IHJlcXVpcmUoJy4vZGVidWctb3V0cHV0JykuRGVidWdPdXRwdXQ7XG5nYW1lT3B0cyA9IHtcbiAgdGlsZVdpZHRoOiAxMCxcbiAgdGlsZUhlaWdodDogMThcbn07XG5yZW5kZXJPcHRzID0ge1xuICB6OiAyMFxufTtcbmlucHV0SGFuZGxlciA9IG5ldyBJbnB1dEhhbmRsZXI7XG5yZW5kZXJlciA9IG5ldyBDYW52YXNSZW5kZXJlcihyZW5kZXJPcHRzKTtcbmdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoZ2FtZU9wdHMpO1xudGV0cmlzR2FtZSA9IG5ldyBUZXRyaXNHYW1lKGdhbWVTdGF0ZSk7XG5kZWJ1Z091dHB1dCA9IG5ldyBEZWJ1Z091dHB1dDtcbm91dHB1dENhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbm91dHB1dENhbnZhcy53aWR0aCA9IDEgKyAxNyAqIHJlbmRlck9wdHMuejtcbm91dHB1dENhbnZhcy5oZWlnaHQgPSAxICsgMjAgKiByZW5kZXJPcHRzLno7XG5JbnB1dEhhbmRsZXIub24oMTkyLCBmdW5jdGlvbigpe1xuICBpZiAoZnJhbWVEcml2ZXIuc3RhdGUucnVubmluZykge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gIH1cbn0pO1xuZnJhbWVEcml2ZXIgPSBuZXcgRnJhbWVEcml2ZXIoZnVuY3Rpb24ozpR0LCB0aW1lLCBmcmFtZSl7XG4gIHZhciBvdXRwdXRCbGl0dGVyO1xuICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICBnYW1lU3RhdGUuaW5wdXRTdGF0ZSA9IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKTtcbiAgZ2FtZVN0YXRlID0gdGV0cmlzR2FtZS5ydW5GcmFtZShnYW1lU3RhdGUsIM6UdCk7XG4gIG91dHB1dEJsaXR0ZXIgPSByZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlLCByZW5kZXJPcHRzKTtcbiAgaWYgKGRlYnVnT3V0cHV0ICE9IG51bGwpIHtcbiAgICBkZWJ1Z091dHB1dC5yZW5kZXIoZ2FtZVN0YXRlKTtcbiAgfVxuICByZXR1cm4gb3V0cHV0QmxpdHRlci5ibGl0VG9DYW52YXMob3V0cHV0Q2FudmFzKTtcbn0pO1xuZnJhbWVEcml2ZXIuc3RhcnQoKTtcbmRlbGF5KDEwMDAsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnYW1lU3RhdGUuaW5wdXRTdGF0ZS5wdXNoKHtcbiAgICBrZXk6ICdsZWZ0JyxcbiAgICBhY3Rpb246ICdkb3duJ1xuICB9KTtcbn0pO1xuZGVsYXkoMTAwMCwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdhbWVTdGF0ZS5pbnB1dFN0YXRlLnB1c2goe1xuICAgIGtleTogJ2xlZnQnLFxuICAgIGFjdGlvbjogJ3VwJ1xuICB9KTtcbn0pOyIsInZhciByZWYkLCBpZCwgbG9nLCB0ZW1wbGF0ZSwgRGVidWdPdXRwdXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG50ZW1wbGF0ZSA9IHtcbiAgY2VsbDogZnVuY3Rpb24oaXQpe1xuICAgIGlmIChpdCkge1xuICAgICAgcmV0dXJuIFwi4paS4paSXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIiAgXCI7XG4gICAgfVxuICB9LFxuICBicmljazogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm1hcCh0ZW1wbGF0ZS5jZWxsKS5qb2luKCcgJyk7XG4gICAgfSkuam9pbihcIlxcbiAgICAgICAgXCIpO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbGVuJCwga2V5U3VtbWFyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGhpcy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBrZXlTdW1tYXJ5ID0gdGhpc1tpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2goa2V5U3VtbWFyeS5rZXkgKyAnLScgKyBrZXlTdW1tYXJ5LmFjdGlvbiArIFwifFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiKG5vIGNoYW5nZSlcIjtcbiAgICB9XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgIE5FWFQgOlxcblwiICsgdGVtcGxhdGUuYnJpY2suYXBwbHkodGhpcy5icmljay5uZXh0KSArIFwiXFxuXFxuIHNjb3JlIC0gXCIgKyB0aGlzLnNjb3JlICsgXCJcXG4gbGluZXMgLSBcIiArIHRoaXMubGluZXMgKyBcIlxcblxcbiAgbWV0YSAtIFwiICsgdGhpcy5tZXRhZ2FtZVN0YXRlICsgXCJcXG4gIHRpbWUgLSBcIiArIHRoaXMuZWxhcHNlZFRpbWUgKyBcIlxcbiBmcmFtZSAtIFwiICsgdGhpcy5lbGFwc2VkRnJhbWVzICsgXCJcXG4gIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKSArIFwiXFxuICBkcm9wIC0gXCIgKyAodGhpcy5mb3JjZURvd25Nb2RlID8gJ2ZvcmNlJyA6ICdhdXRvJykgKyBcIlxcblxcblwiO1xuICB9XG59O1xub3V0JC5EZWJ1Z091dHB1dCA9IERlYnVnT3V0cHV0ID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnT3V0cHV0LmRpc3BsYXlOYW1lID0gJ0RlYnVnT3V0cHV0JztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnT3V0cHV0LnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z091dHB1dDtcbiAgZnVuY3Rpb24gRGVidWdPdXRwdXQoKXtcbiAgICB0aGlzLmRibyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kYm8pO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgcmV0dXJuIHRoaXMuZGJvLmlubmVyVGV4dCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gIH07XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhZiwgRnJhbWVEcml2ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xub3V0JC5GcmFtZURyaXZlciA9IEZyYW1lRHJpdmVyID0gKGZ1bmN0aW9uKCl7XG4gIEZyYW1lRHJpdmVyLmRpc3BsYXlOYW1lID0gJ0ZyYW1lRHJpdmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEZyYW1lRHJpdmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZURyaXZlcjtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6ZXJvOiAwLFxuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgcnVubmluZzogZmFsc2VcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG5vdywgzpR0O1xuICAgIG5vdyA9IERhdGUubm93KCkgLSB0aGlzLnN0YXRlLnplcm87XG4gICAgzpR0ID0gbm93IC0gdGhpcy5zdGF0ZS50aW1lO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IG5vdztcbiAgICB0aGlzLnN0YXRlLmZyYW1lID0gdGhpcy5zdGF0ZS5mcmFtZSArIDE7XG4gICAgdGhpcy5vbkZyYW1lKM6UdCwgdGhpcy5zdGF0ZS50aW1lLCB0aGlzLnN0YXRlLmZyYW1lKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gcmFmKHRoaXMuZnJhbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdGFydCAtIHN0YXJ0aW5nXCIpO1xuICAgIHRoaXMuc3RhdGUuemVybyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gMDtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmZyYW1lKCk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RvcCAtIHN0b3BwaW5nXCIpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfTtcbiAgcmV0dXJuIEZyYW1lRHJpdmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBLRVksIEFDVElPTl9OQU1FLCBldmVudFN1bW1hcnksIElucHV0SGFuZGxlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbktFWSA9IHtcbiAgUkVUVVJOOiAxMyxcbiAgRVNDQVBFOiAyNyxcbiAgU1BBQ0U6IDMyLFxuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwXG59O1xuQUNUSU9OX05BTUUgPSAocmVmJCA9IHt9LCByZWYkW0tFWS5SRVRVUk4gKyBcIlwiXSA9ICdjb25maXJtJywgcmVmJFtLRVkuRVNDQVBFICsgXCJcIl0gPSAnYmFjaycsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnYWN0aW9uJywgcmVmJFtLRVkuTEVGVCArIFwiXCJdID0gJ2xlZnQnLCByZWYkW0tFWS5VUCArIFwiXCJdID0gJ3VwJywgcmVmJFtLRVkuUklHSFQgKyBcIlwiXSA9ICdyaWdodCcsIHJlZiRbS0VZLkRPV04gKyBcIlwiXSA9ICdkb3duJywgcmVmJCk7XG5ldmVudFN1bW1hcnkgPSBmdW5jdGlvbihldmVudFNhdmVyLCBrZXlEaXJlY3Rpb24pe1xuICByZXR1cm4gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHdoaWNoLCB0aGF0O1xuICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICBpZiAodGhhdCA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgcmV0dXJuIGV2ZW50U2F2ZXIoe1xuICAgICAgICBrZXk6IHRoYXQsXG4gICAgICAgIGFjdGlvbjoga2V5RGlyZWN0aW9uXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zYXZlRXZlbnQgPSBiaW5kJCh0aGlzLCAnc2F2ZUV2ZW50JywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJJbnB1dEhhbmRsZXI6Om5ld1wiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2F2ZWRFdmVudHM6IFtdXG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnRTdW1tYXJ5KHRoaXMuc2F2ZUV2ZW50LCAnZG93bicpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50U3VtbWFyeSh0aGlzLnNhdmVFdmVudCwgJ3VwJykpO1xuICB9XG4gIHByb3RvdHlwZS5zYXZlRXZlbnQgPSBmdW5jdGlvbihldmVudFN1bW1hcnkpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnNhdmVkRXZlbnRzLnB1c2goZXZlbnRTdW1tYXJ5KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNoYW5nZXM7XG4gICAgY2hhbmdlcyA9IHRoaXMuc3RhdGUuc2F2ZWRFdmVudHM7XG4gICAgdGhpcy5zdGF0ZS5zYXZlZEV2ZW50cyA9IFtdO1xuICAgIHJldHVybiBjaGFuZ2VzO1xuICB9O1xuICBJbnB1dEhhbmRsZXIuZGVidWdNb2RlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgcmV0dXJuIGxvZyhcIklucHV0SGFuZGxlcjo6ZGVidWdNb2RlIC1cIiwgd2hpY2gsIEFDVElPTl9OQU1FW3doaWNoXSB8fCAnW3VuYm91bmRdJyk7XG4gICAgfSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5vbiA9IGZ1bmN0aW9uKGNvZGUsIM67KXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgaWYgKHdoaWNoID09PSBjb2RlKSB7XG4gICAgICAgIHJldHVybiDOuygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICByZXR1cm4gSW5wdXRIYW5kbGVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBQYWxldHRlLCBCbGl0dGVyLCBBcmVuYVZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xub3V0JC5BcmVuYVZpZXcgPSBBcmVuYVZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEFyZW5hVmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFWaWV3JywgQXJlbmFWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEFyZW5hVmlldztcbiAgZnVuY3Rpb24gQXJlbmFWaWV3KCl7XG4gICAgQXJlbmFWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmdyaWQgPSAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKEJsaXR0ZXIsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KTtcbiAgICB0aGlzLmNlbGxzID0gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShCbGl0dGVyLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gIH1cbiAgcHJvdG90eXBlLmRyYXdDZWxscyA9IGZ1bmN0aW9uKGNlbGxzLCBzaXplKXtcbiAgICB2YXIgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgdGlsZSwgcmVzdWx0cyQgPSBbXTtcbiAgICB0aGlzLmNlbGxzLmNsZWFyKCk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjZWxscy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gY2VsbHNbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICB0aWxlID0gcm93W2okXTtcbiAgICAgICAgaWYgKHRpbGUpIHtcbiAgICAgICAgICB0aGlzLmNlbGxzLmN0eC5maWxsU3R5bGUgPSBQYWxldHRlLnRpbGVDb2xvcnNbdGlsZV07XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmNlbGxzLmN0eC5maWxsUmVjdCgxICsgeCAqIHNpemUsIDEgKyB5ICogc2l6ZSwgc2l6ZSAtIDEsIHNpemUgLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5kcmF3R3JpZCA9IGZ1bmN0aW9uKHcsIGgsIHNpemUpe1xuICAgIHZhciBpJCwgeCwgeTtcbiAgICB0aGlzLmdyaWQuY2xlYXIoKTtcbiAgICB0aGlzLmdyaWQuY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICB0aGlzLmdyaWQuY3R4LmJlZ2luUGF0aCgpO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSB3OyArK2kkKSB7XG4gICAgICB4ID0gaSQ7XG4gICAgICB0aGlzLmdyaWQuY3R4Lm1vdmVUbyh4ICogc2l6ZSArIDAuNSwgMCk7XG4gICAgICB0aGlzLmdyaWQuY3R4LmxpbmVUbyh4ICogc2l6ZSArIDAuNSwgaCAqIHNpemUgKyAwLjUpO1xuICAgIH1cbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gaDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgdGhpcy5ncmlkLmN0eC5tb3ZlVG8oMCwgeSAqIHNpemUgKyAwLjUpO1xuICAgICAgdGhpcy5ncmlkLmN0eC5saW5lVG8odyAqIHNpemUgKyAwLjUsIHkgKiBzaXplICsgMC41KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ3JpZC5jdHguc3Ryb2tlKCk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihhcmckLCBhcmcxJCl7XG4gICAgdmFyIGNlbGxzLCB3aWR0aCwgaGVpZ2h0LCB6O1xuICAgIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgICB6ID0gYXJnMSQuejtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzNdO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoICogeiwgaGVpZ2h0ICogeik7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBQYWxldHRlLm5ldXRyYWxbMl07XG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCgwLjUsIDAuNSwgd2lkdGggKiB6ICsgMSwgaGVpZ2h0ICogeiArIDEpO1xuICAgIHRoaXMuZHJhd0NlbGxzKGNlbGxzLCB6KTtcbiAgICB0aGlzLmdyaWQuYmxpdFRvKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLmNlbGxzLmJsaXRUbyh0aGlzLCAwLCAwLCAwLjkpO1xuICB9O1xuICByZXR1cm4gQXJlbmFWaWV3O1xufShCbGl0dGVyKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmxpdHRlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbm91dCQuQmxpdHRlciA9IEJsaXR0ZXIgPSAoZnVuY3Rpb24oKXtcbiAgQmxpdHRlci5kaXNwbGF5TmFtZSA9ICdCbGl0dGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEJsaXR0ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJsaXR0ZXI7XG4gIGZ1bmN0aW9uIEJsaXR0ZXIob3B0cywgeCwgeSl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCA9IHg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgPSB5O1xuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgfVxuICBwcm90b3R5cGUuYmxpdFRvID0gZnVuY3Rpb24oZGVzdCwgeCwgeSwgYWxwaGEpe1xuICAgIHggPT0gbnVsbCAmJiAoeCA9IDApO1xuICAgIHkgPT0gbnVsbCAmJiAoeSA9IDApO1xuICAgIGFscGhhID09IG51bGwgJiYgKGFscGhhID0gMSk7XG4gICAgZGVzdC5jdHguZ2xvYmFsQWxwaGEgPSBhbHBoYTtcbiAgICBkZXN0LmN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIHgsIHkpO1xuICAgIHJldHVybiBkZXN0LmN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gIH07XG4gIHByb3RvdHlwZS5ibGl0VG9DYW52YXMgPSBmdW5jdGlvbihkZXN0Q2FudmFzKXtcbiAgICB2YXIgY3R4O1xuICAgIGN0eCA9IGRlc3RDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGRlc3RDYW52YXMud2lkdGgsIGRlc3RDYW52YXMuaGVpZ2h0KTtcbiAgICByZXR1cm4gY3R4LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgMCwgMCwgZGVzdENhbnZhcy53aWR0aCwgZGVzdENhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICB9O1xuICByZXR1cm4gQmxpdHRlcjtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHRpbGVDb2xvcnMsIEJsaXR0ZXIsIEJyaWNrVmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbnRpbGVDb2xvcnMgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS50aWxlQ29sb3JzO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5vdXQkLkJyaWNrVmlldyA9IEJyaWNrVmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQnJpY2tWaWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmlja1ZpZXcnLCBCcmlja1ZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQnJpY2tWaWV3O1xuICBmdW5jdGlvbiBCcmlja1ZpZXcoKXtcbiAgICBCcmlja1ZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCB5LCByb3csIGokLCBsZW4xJCwgeCwgY2VsbDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGJyaWNrLnNoYXBlKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGlsZUNvbG9yc1tjZWxsXTtcbiAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh4ICogdGhpcy5vcHRzLnogKyAxLCB5ICogdGhpcy5vcHRzLnogKyAxLCB0aGlzLm9wdHMueiAtIDEsIHRoaXMub3B0cy56IC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHJldHVybiBCcmlja1ZpZXc7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCbGl0dGVyLCBQYWxldHRlLCBBcmVuYVZpZXcsIEJyaWNrVmlldywgTmV4dEJyaWNrVmlldywgQ2FudmFzUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuQXJlbmFWaWV3ID0gcmVxdWlyZSgnLi9hcmVuYScpLkFyZW5hVmlldztcbkJyaWNrVmlldyA9IHJlcXVpcmUoJy4vYnJpY2snKS5Ccmlja1ZpZXc7XG5OZXh0QnJpY2tWaWV3ID0gcmVxdWlyZSgnLi9uZXh0LWJyaWNrJykuTmV4dEJyaWNrVmlldztcbm91dCQuQ2FudmFzUmVuZGVyZXIgPSBDYW52YXNSZW5kZXJlciA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQ2FudmFzUmVuZGVyZXIsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0NhbnZhc1JlbmRlcmVyJywgQ2FudmFzUmVuZGVyZXIpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQ2FudmFzUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIENhbnZhc1JlbmRlcmVyKG9wdHMpe1xuICAgIHZhciB6O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy56ID0geiA9IHRoaXMub3B0cy56O1xuICAgIENhbnZhc1JlbmRlcmVyLnN1cGVyY2xhc3MuY2FsbCh0aGlzLCB0aGlzLm9wdHMsIDE3ICogeiwgMjAgKiB6KTtcbiAgICB0aGlzLmFyZW5hID0gbmV3IEFyZW5hVmlldyh0aGlzLm9wdHMsIDEwICogeiArIDIsIDE4ICogeiArIDIpO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2tWaWV3KHRoaXMub3B0cywgNCAqIHosIDQgKiB6KTtcbiAgICB0aGlzLm5leHQgPSBuZXcgTmV4dEJyaWNrVmlldyh0aGlzLm9wdHMsIDQgKiB6LCA0ICogeik7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlclN0YXJ0TWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGxvZygncmVuZGVyLXN0YXJ0LW1lbnUnKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckJsYW5rID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jbGVhcigpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB0aGlzLmJyaWNrLnJlbmRlcihncy5icmljay5jdXJyZW50LCB0aGlzLm9wdHMpO1xuICAgIHRoaXMubmV4dC5yZW5kZXIoZ3MuYnJpY2submV4dCwgdGhpcy5vcHRzKTtcbiAgICB0aGlzLmFyZW5hLnJlbmRlcihncy5hcmVuYSwgdGhpcy5vcHRzKTtcbiAgICByZXR1cm4gdGhpcy5jb2xsYXBzZUFsbChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5jb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcG9zO1xuICAgIHBvcyA9IGdzLmJyaWNrLmN1cnJlbnQucG9zO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFBhbGV0dGUubmV1dHJhbFszXTtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5icmljay5ibGl0VG8odGhpcy5hcmVuYSwgcG9zWzBdICogdGhpcy56LCBwb3NbMV0gKiB0aGlzLnopO1xuICAgIHRoaXMuYXJlbmEuYmxpdFRvKHRoaXMsIHRoaXMub3B0cy56LCB0aGlzLm9wdHMueik7XG4gICAgcmV0dXJuIHRoaXMubmV4dC5ibGl0VG8odGhpcywgKDIgKyBncy5hcmVuYS53aWR0aCkgKiB0aGlzLnosIDEgKiB0aGlzLnopO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICB2YXIgbWV0YWdhbWVTdGF0ZTtcbiAgICBtZXRhZ2FtZVN0YXRlID0gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICB0aGlzLnJlbmRlclN0YXJ0TWVudShnYW1lU3RhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF1c2UnOlxuICAgICAgdGhpcy5yZW5kZXJQYXVzZU1lbnUoZ2FtZVN0YXRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5yZW5kZXJHYW1lKGdhbWVTdGF0ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3aW4nOlxuICAgICAgdGhpcy5yZW5kZXJXaW5TY3JlZW4oZ2FtZVN0YXRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLnJlbmRlckJsYW5rKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICByZXR1cm4gQ2FudmFzUmVuZGVyZXI7XG59KEJsaXR0ZXIpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCcmlja1ZpZXcsIEJsaXR0ZXIsIFBhbGV0dGUsIE5leHRCcmlja1ZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5Ccmlja1ZpZXcgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2tWaWV3O1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcbm91dCQuTmV4dEJyaWNrVmlldyA9IE5leHRCcmlja1ZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5leHRCcmlja1ZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ05leHRCcmlja1ZpZXcnLCBOZXh0QnJpY2tWaWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5leHRCcmlja1ZpZXc7XG4gIGZ1bmN0aW9uIE5leHRCcmlja1ZpZXcoKXtcbiAgICBOZXh0QnJpY2tWaWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmJyaWNrID0gbmV3IEJyaWNrVmlldyh0aGlzLm9wdHMsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgfVxuICBwcm90b3R5cGUucHJldHR5T2Zmc2V0ID0gZnVuY3Rpb24odHlwZSl7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgY2FzZSAnemlnJzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICd6YWcnOlxuICAgICAgcmV0dXJuIFswLjUsIDBdO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIFswLjUsIDBdO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiBbMC41LCAwXTtcbiAgICBjYXNlICd0ZWUnOlxuICAgICAgcmV0dXJuIFswLjUsIDBdO1xuICAgIGNhc2UgJ3RldHJpcyc6XG4gICAgICByZXR1cm4gWzAsIC0wLjVdO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlckJnID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBQYWxldHRlLm5ldXRyYWxbM107XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gUGFsZXR0ZS5uZXV0cmFsWzJdO1xuICAgIHJldHVybiB0aGlzLmN0eC5zdHJva2VSZWN0KDAuNSwgMC41LCB0aGlzLndpZHRoIC0gMSwgdGhpcy5oZWlnaHQgLSAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICB2YXIgcmVmJCwgeCwgeTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5yZW5kZXJCZygpO1xuICAgIHRoaXMuYnJpY2sucmVuZGVyKGJyaWNrKTtcbiAgICByZWYkID0gdGhpcy5wcmV0dHlPZmZzZXQoYnJpY2sudHlwZSksIHggPSByZWYkWzBdLCB5ID0gcmVmJFsxXTtcbiAgICByZXR1cm4gdGhpcy5icmljay5ibGl0VG8odGhpcywgeCAqIHRoaXMub3B0cy56LCB5ICogdGhpcy5vcHRzLnopO1xuICB9O1xuICByZXR1cm4gTmV4dEJyaWNrVmlldztcbn0oQmxpdHRlcikpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIG5ldXRyYWwsIHJlZCwgb3JhbmdlLCBncmVlbiwgbWFnZW50YSwgYmx1ZSwgYnJvd24sIHllbGxvdywgY3lhbiwgdGlsZUNvbG9ycywgUGFsZXR0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQubmV1dHJhbCA9IG5ldXRyYWwgPSBbJyNmZmZmZmYnLCAnI2NjY2NjYycsICcjODg4ODg4JywgJyMyMTIxMjEnXTtcbm91dCQucmVkID0gcmVkID0gWycjRkY0NDQ0JywgJyNGRjc3NzcnLCAnI2RkNDQ0NCcsICcjNTUxMTExJ107XG5vdXQkLm9yYW5nZSA9IG9yYW5nZSA9IFsnI0ZGQkIzMycsICcjRkZDQzg4JywgJyNDQzg4MDAnLCAnIzU1MzMwMCddO1xub3V0JC5ncmVlbiA9IGdyZWVuID0gWycjNDRmZjY2JywgJyM4OGZmYWEnLCAnIzIyYmIzMycsICcjMTE1NTExJ107XG5vdXQkLm1hZ2VudGEgPSBtYWdlbnRhID0gWycjZmYzM2ZmJywgJyNmZmFhZmYnLCAnI2JiMjJiYicsICcjNTUxMTU1J107XG5vdXQkLmJsdWUgPSBibHVlID0gWycjNjZiYmZmJywgJyNhYWRkZmYnLCAnIzU1ODhlZScsICcjMTExMTU1J107XG5vdXQkLmJyb3duID0gYnJvd24gPSBbJyNmZmJiMzMnLCAnI2ZmY2M4OCcsICcjYmI5OTAwJywgJyM1NTU1MTEnXTtcbm91dCQueWVsbG93ID0geWVsbG93ID0gWycjZWVlZTExJywgJyNmZmZmYWEnLCAnI2NjYmIwMCcsICcjNTU1NTExJ107XG5vdXQkLmN5YW4gPSBjeWFuID0gWycjNDRkZGZmJywgJyNhYWUzZmYnLCAnIzAwYWFjYycsICcjMDA2Njk5J107XG5vdXQkLnRpbGVDb2xvcnMgPSB0aWxlQ29sb3JzID0gW25ldXRyYWxbMl0sIHJlZFswXSwgb3JhbmdlWzBdLCB5ZWxsb3dbMF0sIGdyZWVuWzBdLCBjeWFuWzBdLCBibHVlWzJdLCBtYWdlbnRhWzBdXTtcbm91dCQuUGFsZXR0ZSA9IFBhbGV0dGUgPSB7XG4gIG5ldXRyYWw6IG5ldXRyYWwsXG4gIHJlZDogcmVkLFxuICBvcmFuZ2U6IG9yYW5nZSxcbiAgeWVsbG93OiB5ZWxsb3csXG4gIGdyZWVuOiBncmVlbixcbiAgY3lhbjogY3lhbixcbiAgYmx1ZTogYmx1ZSxcbiAgbWFnZW50YTogbWFnZW50YSxcbiAgdGlsZUNvbG9yczogdGlsZUNvbG9yc1xufTsiLCJ2YXIgaWQsIGxvZywgZmxpcCwgZGVsYXksIGZsb29yLCByYW5kb20sIHJhbmQsIHJhbmRvbUZyb20sIGFkZFYyLCByYWYsIHRoYXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gTWF0aC5yYW5kb207XG5vdXQkLnJhbmQgPSByYW5kID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgZmxvb3IocmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XG59O1xub3V0JC5yYW5kb21Gcm9tID0gcmFuZG9tRnJvbSA9IGZ1bmN0aW9uKGxpc3Qpe1xuICByZXR1cm4gbGlzdFtyYW5kKDAsIGxpc3QubGVuZ3RoIC0gMSldO1xufTtcbm91dCQuYWRkVjIgPSBhZGRWMiA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gW2FbMF0gKyBiWzBdLCBhWzFdICsgYlsxXV07XG59O1xub3V0JC5yYWYgPSByYWYgPSAodGhhdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgPyB0aGF0XG4gIDogKHRoYXQgPSB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgPyB0aGF0XG4gICAgOiAodGhhdCA9IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiBmdW5jdGlvbijOuyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KM67LCAxMDAwIC8gNjApO1xuICAgICAgfTsiLCJ2YXIgc3F1YXJlLCB6aWcsIHphZywgbGVmdCwgcmlnaHQsIHRlZSwgdGV0cmlzLCBhbGwsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLnNxdWFyZSA9IHNxdWFyZSA9IFtbWzAsIDAsIDBdLCBbMCwgMSwgMV0sIFswLCAxLCAxXV1dO1xub3V0JC56aWcgPSB6aWcgPSBbW1swLCAwLCAwXSwgWzIsIDIsIDBdLCBbMCwgMiwgMl1dLCBbWzAsIDIsIDBdLCBbMiwgMiwgMF0sIFsyLCAwLCAwXV1dO1xub3V0JC56YWcgPSB6YWcgPSBbW1swLCAwLCAwXSwgWzAsIDMsIDNdLCBbMywgMywgMF1dLCBbWzMsIDAsIDBdLCBbMywgMywgMF0sIFswLCAzLCAwXV1dO1xub3V0JC5sZWZ0ID0gbGVmdCA9IFtbWzAsIDAsIDBdLCBbNCwgNCwgNF0sIFs0LCAwLCAwXV0sIFtbNCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDBdXSwgW1swLCAwLCA0XSwgWzQsIDQsIDRdLCBbMCwgMCwgMF1dLCBbWzAsIDQsIDBdLCBbMCwgNCwgMF0sIFswLCA0LCA0XV1dO1xub3V0JC5yaWdodCA9IHJpZ2h0ID0gW1tbMCwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDVdXSwgW1swLCA1LCAwXSwgWzAsIDUsIDBdLCBbNSwgNSwgMF1dLCBbWzUsIDAsIDBdLCBbNSwgNSwgNV0sIFswLCAwLCAwXV0sIFtbMCwgNSwgNV0sIFswLCA1LCAwXSwgWzAsIDUsIDBdXV07XG5vdXQkLnRlZSA9IHRlZSA9IFtbWzAsIDAsIDBdLCBbNiwgNiwgNl0sIFswLCA2LCAwXV0sIFtbMCwgNiwgMF0sIFs2LCA2LCAwXSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDZdLCBbMCwgMCwgMF1dLCBbWzAsIDYsIDBdLCBbMCwgNiwgNl0sIFswLCA2LCAwXV1dO1xub3V0JC50ZXRyaXMgPSB0ZXRyaXMgPSBbW1swLCAwLCAwLCAwXSwgWzAsIDAsIDAsIDBdLCBbNywgNywgNywgN11dLCBbWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdXV07XG5vdXQkLmFsbCA9IGFsbCA9IFtcbiAge1xuICAgIHR5cGU6ICdzcXVhcmUnLFxuICAgIHNoYXBlczogc3F1YXJlXG4gIH0sIHtcbiAgICB0eXBlOiAnemlnJyxcbiAgICBzaGFwZXM6IHppZ1xuICB9LCB7XG4gICAgdHlwZTogJ3phZycsXG4gICAgc2hhcGVzOiB6YWdcbiAgfSwge1xuICAgIHR5cGU6ICdsZWZ0JyxcbiAgICBzaGFwZXM6IGxlZnRcbiAgfSwge1xuICAgIHR5cGU6ICdyaWdodCcsXG4gICAgc2hhcGVzOiByaWdodFxuICB9LCB7XG4gICAgdHlwZTogJ3RlZScsXG4gICAgc2hhcGVzOiB0ZWVcbiAgfSwge1xuICAgIHR5cGU6ICd0ZXRyaXMnLFxuICAgIHNoYXBlczogdGV0cmlzXG4gIH1cbl07IiwidmFyIHJlZiQsIGlkLCBsb2csIGFkZFYyLCByYW5kLCByYW5kb21Gcm9tLCBCcmlja1NoYXBlcywgY2FuRHJvcCwgY2FuTW92ZSwgY2FuUm90YXRlLCBjb2xsaWRlcywgY29weUJyaWNrVG9BcmVuYSwgdG9wSXNSZWFjaGVkLCBpc0NvbXBsZXRlLCBuZXdCcmljaywgc3Bhd25OZXdCcmljaywgZHJvcEFyZW5hUm93LCBjbGVhckFyZW5hLCBnZXRTaGFwZU9mUm90YXRpb24sIG5vcm1hbGlzZVJvdGF0aW9uLCByb3RhdGVCcmljaywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kID0gcmVmJC5yYW5kLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLmNhbkRyb3AgPSBjYW5Ecm9wID0gZnVuY3Rpb24oYnJpY2ssIGFyZW5hKXtcbiAgcmV0dXJuIGNhbk1vdmUoYnJpY2ssIFswLCAxXSwgYXJlbmEpO1xufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuUm90YXRlID0gY2FuUm90YXRlID0gZnVuY3Rpb24oYnJpY2ssIGRpciwgYXJlbmEpe1xuICB2YXIgbmV3U2hhcGU7XG4gIG5ld1NoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBjb2xsaWRlcyhicmljay5wb3MsIG5ld1NoYXBlLCBhcmVuYSk7XG59O1xub3V0JC5jb2xsaWRlcyA9IGNvbGxpZGVzID0gZnVuY3Rpb24ocG9zLCBzaGFwZSwgYXJnJCl7XG4gIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGokLCByZWYxJCwgbGVuMSQsIHgsIHU7XG4gIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdID4gMCkge1xuICAgICAgICBpZiAodiA+PSAwKSB7XG4gICAgICAgICAgaWYgKHYgPj0gaGVpZ2h0IHx8IHUgPj0gd2lkdGggfHwgdSA8IDAgfHwgY2VsbHNbdl1bdV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLmNvcHlCcmlja1RvQXJlbmEgPSBjb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICB2YXIgcG9zLCBzaGFwZSwgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgY2VsbHMgPSBhcmcxJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gJiYgdiA+PSAwKSB7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY2VsbHNbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQudG9wSXNSZWFjaGVkID0gdG9wSXNSZWFjaGVkID0gZnVuY3Rpb24oYXJnJCl7XG4gIHZhciBjZWxscywgaSQsIHJlZiQsIGxlbiQsIGNlbGw7XG4gIGNlbGxzID0gYXJnJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLmlzQ29tcGxldGUgPSBpc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcm90YXRpb246IDAsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdLFxuICAgIHR5cGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0udHlwZSxcbiAgICBwb3M6IFswLCAwXVxuICB9O1xufTtcbm91dCQuc3Bhd25OZXdCcmljayA9IHNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihncyl7XG4gIGdzLmJyaWNrLmN1cnJlbnQgPSBncy5icmljay5uZXh0O1xuICBncy5icmljay5jdXJyZW50LnBvcyA9IFs0LCAtMV07XG4gIHJldHVybiBncy5icmljay5uZXh0ID0gbmV3QnJpY2soKTtcbn07XG5vdXQkLmRyb3BBcmVuYVJvdyA9IGRyb3BBcmVuYVJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQuY2xlYXJBcmVuYSA9IGNsZWFyQXJlbmEgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCBpLCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgcm93ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICBpID0gaiQ7XG4gICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2gocm93W2ldID0gMCk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmdldFNoYXBlT2ZSb3RhdGlvbiA9IGdldFNoYXBlT2ZSb3RhdGlvbiA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIHJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIEJyaWNrU2hhcGVzW2JyaWNrLnR5cGVdW3JvdGF0aW9uXTtcbn07XG5vdXQkLm5vcm1hbGlzZVJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24gPSBmdW5jdGlvbihhcmckLCByb3RhdGlvbil7XG4gIHZhciB0eXBlO1xuICB0eXBlID0gYXJnJC50eXBlO1xuICByZXR1cm4gcm90YXRpb24gJSBCcmlja1NoYXBlc1t0eXBlXS5sZW5ndGg7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIGRpcil7XG4gIHZhciByb3RhdGlvbiwgdHlwZTtcbiAgcm90YXRpb24gPSBicmljay5yb3RhdGlvbiwgdHlwZSA9IGJyaWNrLnR5cGU7XG4gIGJyaWNrLnJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uICsgZGlyKTtcbiAgcmV0dXJuIGJyaWNrLnNoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbik7XG59O1xuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgVGltZXIsIEdhbWVTdGF0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xub3V0JC5HYW1lU3RhdGUgPSBHYW1lU3RhdGUgPSAoZnVuY3Rpb24oKXtcbiAgR2FtZVN0YXRlLmRpc3BsYXlOYW1lID0gJ0dhbWVTdGF0ZSc7XG4gIHZhciBkZWZhdWx0cywgcHJvdG90eXBlID0gR2FtZVN0YXRlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBHYW1lU3RhdGU7XG4gIGRlZmF1bHRzID0ge1xuICAgIG1ldGFnYW1lU3RhdGU6ICduby1nYW1lJyxcbiAgICBzY29yZTogMCxcbiAgICBsaW5lczogMCxcbiAgICBicmljazoge1xuICAgICAgbmV4dDogdm9pZCA4LFxuICAgICAgY3VycmVudDogdm9pZCA4XG4gICAgfSxcbiAgICBpbnB1dFN0YXRlOiBbXSxcbiAgICBmb3JjZURvd25Nb2RlOiBmYWxzZSxcbiAgICBlbGFwc2VkVGltZTogMCxcbiAgICBlbGFwc2VkRnJhbWVzOiAwLFxuICAgIHRpbWVyczoge30sXG4gICAgb3B0aW9uczoge1xuICAgICAgdGlsZVdpZHRoOiAxMCxcbiAgICAgIHRpbGVIZWlnaHQ6IDE4LFxuICAgICAgZHJvcFNwZWVkOiA1MDAsXG4gICAgICBmb3JjZURyb3BXYWl0VGltZTogMTAwXG4gICAgfSxcbiAgICBhcmVuYToge1xuICAgICAgY2VsbHM6IFtbXV0sXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gR2FtZVN0YXRlKG9wdGlvbnMpe1xuICAgIGltcG9ydCQodGhpcywgZGVmYXVsdHMpO1xuICAgIGltcG9ydCQodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmRyb3BTcGVlZCk7XG4gICAgdGhpcy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5mb3JjZURyb3BXYWl0VGltZSk7XG4gICAgdGhpcy5hcmVuYSA9IGNvbnN0cnVjdG9yLm5ld0FyZW5hKHRoaXMub3B0aW9ucy50aWxlV2lkdGgsIHRoaXMub3B0aW9ucy50aWxlSGVpZ2h0KTtcbiAgfVxuICBHYW1lU3RhdGUubmV3QXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KXtcbiAgICB2YXIgcm93LCBjZWxsO1xuICAgIHJldHVybiB7XG4gICAgICBjZWxsczogKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpJCwgdG8kLCBscmVzdWx0JCwgaiQsIHRvMSQsIHJlc3VsdHMkID0gW107XG4gICAgICAgIGZvciAoaSQgPSAwLCB0byQgPSBoZWlnaHQ7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICAgICAgcm93ID0gaSQ7XG4gICAgICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IHdpZHRoOyBqJCA8IHRvMSQ7ICsraiQpIHtcbiAgICAgICAgICAgIGNlbGwgPSBqJDtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICAgIH0oKSksXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH07XG4gIH07XG4gIHJldHVybiBHYW1lU3RhdGU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgcmFuZG9tRnJvbSwgR2FtZVN0YXRlLCBUaW1lciwgQ29yZSwgVGV0cmlzR2FtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcbnJhbmRvbUZyb20gPSByZXF1aXJlKCdzdGQnKS5yYW5kb21Gcm9tO1xuR2FtZVN0YXRlID0gcmVxdWlyZSgnLi9nYW1lLXN0YXRlJykuR2FtZVN0YXRlO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5Db3JlID0gcmVxdWlyZSgnLi9nYW1lLWNvcmUnKTtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoZ2FtZVN0YXRlKXtcbiAgICBsb2coXCJUZXRyaXNHYW1lOjpuZXdcIik7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dGYWlsU2NyZWVuID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIGNvbnNvbGUuZGVidWcoJ0ZBSUxFRCcpO1xuICAgIHJldHVybiB0aGlzLmJlZ2luTmV3R2FtZShnYW1lU3RhdGUpO1xuICB9O1xuICBwcm90b3R5cGUuYmVnaW5OZXdHYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICAoZnVuY3Rpb24oKXtcbiAgICAgIENvcmUuY2xlYXJBcmVuYSh0aGlzLmFyZW5hKTtcbiAgICAgIHRoaXMuYnJpY2submV4dCA9IENvcmUubmV3QnJpY2soKTtcbiAgICAgIHRoaXMuYnJpY2submV4dC5wb3MgPSBbMywgLTFdO1xuICAgICAgdGhpcy5icmljay5jdXJyZW50ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5jdXJyZW50LnBvcyA9IFszLCAtMV07XG4gICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICAgIHRoaXMubWV0YWdhbWVTdGF0ZSA9ICdnYW1lJztcbiAgICAgIHRoaXMudGltZXJzLmRyb3BUaW1lci5yZXNldCgpO1xuICAgIH0uY2FsbChnYW1lU3RhdGUpKTtcbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZUdhbWUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXRTdGF0ZSwgcmVmJCwga2V5LCBhY3Rpb24sIHJvd3NEcm9wcGVkLCByZXMkLCBpJCwgaXgsIHJvdywgbGVuJCwgcm93SXg7XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzBdIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24nOlxuICAgICAgICAgIGlmIChDb3JlLmNhblJvdGF0ZShicmljay5jdXJyZW50LCAxLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIENvcmUucm90YXRlQnJpY2soYnJpY2suY3VycmVudCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdzLmZvcmNlRG93bk1vZGUgJiYgZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci5leHBpcmVkKSB7XG4gICAgICBpZiAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ29yZS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlO1xuICAgICAgICBncy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyLnJlc2V0KCk7XG4gICAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gZ3MudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lci50YXJnZXRUaW1lO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ3MudGltZXJzLmRyb3BUaW1lci5leHBpcmVkKSB7XG4gICAgICBncy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0V2l0aFJlbWFpbmRlcigpO1xuICAgICAgaWYgKENvcmUuY2FuRHJvcChicmljay5jdXJyZW50LCBhcmVuYSkpIHtcbiAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMV0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIENvcmUuY29weUJyaWNrVG9BcmVuYShicmljay5jdXJyZW50LCBhcmVuYSk7XG4gICAgICAgIENvcmUuc3Bhd25OZXdCcmljayhncyk7XG4gICAgICB9XG4gICAgICByZXMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgcm93SXggPSByZWYkW2kkXTtcbiAgICAgICAgcmVzJC5wdXNoKENvcmUuZHJvcEFyZW5hUm93KGdzLmFyZW5hLCByb3dJeCkpO1xuICAgICAgfVxuICAgICAgcm93c0Ryb3BwZWQgPSByZXMkO1xuICAgICAgZ3MubGluZXMgKz0gcm93c0Ryb3BwZWQubGVuZ3RoO1xuICAgICAgaWYgKENvcmUudG9wSXNSZWFjaGVkKGFyZW5hKSkge1xuICAgICAgICByZXR1cm4gZ3MubWV0YWdhbWVTdGF0ZSA9ICdmYWlsdXJlJztcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZm4kKCl7XG4gICAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGl4ID0gaSQ7XG4gICAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgICBpZiAoQ29yZS5pc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGl4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZyYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICBUaW1lci51cGRhdGVBbGwozpR0KTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuc2hvd0ZhaWxTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5hZHZhbmNlR2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICB0aGlzLmJlZ2luTmV3R2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1Vua25vd24gbWV0YWdhbWUtc3RhdGU6JywgbWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHJldHVybiBUZXRyaXNHYW1lO1xufSgpKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXRyaXNHYW1lOiBUZXRyaXNHYW1lLFxuICBHYW1lU3RhdGU6IEdhbWVTdGF0ZVxufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSBiZWdpbiA/IFRJTUVSX0FDVElWRSA6IFRJTUVSX0VYUElSRUQ7XG4gICAgdGhpcy5hY3RpdmUgPSBiZWdpbjtcbiAgICB0aGlzLmV4cGlyZWQgPSAhYmVnaW47XG4gICAgYWxsVGltZXJzLnB1c2godGhpcyk7XG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2FjdGl2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfQUNUSVZFO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdleHBpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9FWFBJUkVEO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdwcm9ncmVzcycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZSAvIHRoaXMudGFyZ2V0VGltZTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndGltZVRvRXhwaXJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldFRpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihleHBUaW1lKXtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRhcmdldFRpbWUgLSBleHBUaW1lO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbijOlHQpe1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5jdXJyZW50VGltZSArPSDOlHQ7XG4gICAgICBpZiAodGhpcy5jdXJyZW50VGltZSA+PSB0aGlzLnRhcmdldFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9FWFBJUkVEO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfQUNUSVZFO1xuICB9O1xuICBwcm90b3R5cGUucmVzZXRXaXRoUmVtYWluZGVyID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSAtIHRpbWU7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbGxUaW1lcnMuc3BsaWNlKGFsbFRpbWVycy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJUSU1FUjogXCIgKyB0aGlzLnRhcmdldFRpbWUgKyBcIlxcblNUQVRFOiBcIiArIHRoaXMuc3RhdGUgKyBcIiAoXCIgKyB0aGlzLmFjdGl2ZSArIFwifFwiICsgdGhpcy5leHBpcmVkICsgXCIpXFxuXCIgKyBwcm9nYmFyKHRoaXMuY3VycmVudFRpbWUsIHRoaXMudGFyZ2V0VGltZSk7XG4gIH07XG4gIFRpbWVyLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnVwZGF0ZSjOlHQpO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gVGltZXI7XG59KCkpO1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nJChzdHIsIG4pe1xuICBmb3IgKHZhciByID0gJyc7IG4gPiAwOyAobiA+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKSBpZiAobiAmIDEpIHIgKz0gc3RyO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSJdfQ==
