(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, raf, FrameDriver, InputHandler, TetrisGame, gameState, y, x, inputHandler, tetrisGame, canvas, ctx, DebugOutput, dbo, debugOutput, frameDriver;
ref$ = require('std'), log = ref$.log, raf = ref$.raf;
FrameDriver = require('./frame-driver').FrameDriver;
InputHandler = require('./input-handler').InputHandler;
TetrisGame = require('./tetris-game').TetrisGame;
gameState = {
  metagameState: 'no-game',
  score: 0,
  nextBrick: 0,
  currentBrick: 0,
  arena: (function(){
    var i$, lresult$, j$, results$ = [];
    for (i$ = 0; i$ < 18; ++i$) {
      y = i$;
      lresult$ = [];
      for (j$ = 0; j$ < 10; ++j$) {
        x = j$;
        lresult$.push(0);
      }
      results$.push(lresult$);
    }
    return results$;
  }()),
  inputState: {},
  elapsedTime: 0,
  elapsedFrames: 0
};
inputHandler = new InputHandler;
tetrisGame = new TetrisGame;
canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
DebugOutput = require('./debug-output').DebugOutput;
InputHandler.debugMode();
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
  tetrisGame.render(gameState, canvas);
  if (debugOutput != null) {
    return debugOutput.render(gameState, dbo);
  }
});
frameDriver.start();
},{"./debug-output":2,"./frame-driver":3,"./input-handler":4,"./tetris-game":7,"std":5}],2:[function(require,module,exports){
var template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
template = {
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
    return " meta - " + this.metagameState + "\n next - " + this.nextBrick + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\nbrick - " + this.currentBrick + "\nscore - " + this.score + "\n keys - " + template.keys.apply(this.inputState);
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
    log("FrameDriver::new - new FrameDriver");
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
    log("FrameDriver::Start - starting");
    this.state.zero = Date.now();
    this.state.time = 0;
    this.state.running = true;
    return raf(this.frame);
  };
  prototype.stop = function(){
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
    log("InputHandler::new - new InputHandler");
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
var id, log, raf, that, out$ = typeof exports != 'undefined' && exports || this;
out$.id = id = function(it){
  return it;
};
out$.log = log = function(){
  console.log.apply(console, arguments);
  return arguments[0];
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
var GameCore, out$ = typeof exports != 'undefined' && exports || this;
out$.GameCore = GameCore = (function(){
  GameCore.displayName = 'GameCore';
  var prototype = GameCore.prototype, constructor = GameCore;
  function GameCore(){}
  return GameCore;
}());
},{}],7:[function(require,module,exports){
var ref$, id, log, enumerate, GameCore, Renderer, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
enumerate = require('std').enumerate;
GameCore = require('./game-core').GameCore;
Renderer = require('./renderer').Renderer;
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(){
    log("TetrisGame::new - new TetrisGame");
    this.renderer = new Renderer;
  }
  prototype.runFrame = function(gameState){
    return gameState;
  };
  prototype.render = function(gameState, output){
    switch (gameState.metagameState) {
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
},{"./game-core":6,"./renderer":8,"std":5}],8:[function(require,module,exports){
var ref$, id, log, Blitter, Renderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Blitter = (function(){
  Blitter.displayName = 'Blitter';
  var prototype = Blitter.prototype, constructor = Blitter;
  function Blitter(x, y){
    this.canvas = document.createElement('canvas');
    this.canvas.width = x;
    this.canvas.height = y;
    this.ctx = this.canvas.getContext('2d');
  }
  return Blitter;
}());
out$.Renderer = Renderer = (function(){
  Renderer.displayName = 'Renderer';
  var prototype = Renderer.prototype, constructor = Renderer;
  Renderer.blitter = {
    gameFrame: new Blitter(200, 200),
    menuFrame: new Blitter(200, 200),
    blockPreview: new Blitter(200, 200),
    arena: new Blitter(200, 200),
    startMenu: new Blitter(200, 200),
    pauseMenu: new Blitter(200, 200)
  };
  prototype.clear = function(ctx){};
  prototype.renderStartMenu = function(){};
  prototype.renderGame = function(arg$, ctx){
    var arena;
    arena = arg$.arena;
    return log(arguments);
  };
  function Renderer(){}
  return Renderer;
}());
},{"std":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL2lucHV0LWhhbmRsZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3N0ZC9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvZ2FtZS1jb3JlLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy90ZXRyaXMtZ2FtZS9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvcmVuZGVyZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlZiQsIGxvZywgcmFmLCBGcmFtZURyaXZlciwgSW5wdXRIYW5kbGVyLCBUZXRyaXNHYW1lLCBnYW1lU3RhdGUsIHksIHgsIGlucHV0SGFuZGxlciwgdGV0cmlzR2FtZSwgY2FudmFzLCBjdHgsIERlYnVnT3V0cHV0LCBkYm8sIGRlYnVnT3V0cHV0LCBmcmFtZURyaXZlcjtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xuVGV0cmlzR2FtZSA9IHJlcXVpcmUoJy4vdGV0cmlzLWdhbWUnKS5UZXRyaXNHYW1lO1xuZ2FtZVN0YXRlID0ge1xuICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gIHNjb3JlOiAwLFxuICBuZXh0QnJpY2s6IDAsXG4gIGN1cnJlbnRCcmljazogMCxcbiAgYXJlbmE6IChmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbHJlc3VsdCQsIGokLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8IDE4OyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDA7IGokIDwgMTA7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBscmVzdWx0JC5wdXNoKDApO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfSgpKSxcbiAgaW5wdXRTdGF0ZToge30sXG4gIGVsYXBzZWRUaW1lOiAwLFxuICBlbGFwc2VkRnJhbWVzOiAwXG59O1xuaW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcjtcbnRldHJpc0dhbWUgPSBuZXcgVGV0cmlzR2FtZTtcbmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSgpO1xuSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgaWYgKGZyYW1lRHJpdmVyLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xuICB9XG59KTtcbmRibyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkYm8pO1xuZGVidWdPdXRwdXQgPSBuZXcgRGVidWdPdXRwdXQoZGJvKTtcbmZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUpe1xuICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICBnYW1lU3RhdGUuaW5wdXRTdGF0ZSA9IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKTtcbiAgZ2FtZVN0YXRlID0gdGV0cmlzR2FtZS5ydW5GcmFtZShnYW1lU3RhdGUsIM6UdCk7XG4gIHRldHJpc0dhbWUucmVuZGVyKGdhbWVTdGF0ZSwgY2FudmFzKTtcbiAgaWYgKGRlYnVnT3V0cHV0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gZGVidWdPdXRwdXQucmVuZGVyKGdhbWVTdGF0ZSwgZGJvKTtcbiAgfVxufSk7XG5mcmFtZURyaXZlci5zdGFydCgpOyIsInZhciB0ZW1wbGF0ZSwgRGVidWdPdXRwdXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG50ZW1wbGF0ZSA9IHtcbiAga2V5czogZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIGtleVN1bW1hcnksIHJlc3VsdHMkID0gW107XG4gICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRoaXMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAga2V5U3VtbWFyeSA9IHRoaXNbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKGtleVN1bW1hcnkua2V5ICsgJy0nICsga2V5U3VtbWFyeS5hY3Rpb24gKyBcInxcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIihubyBjaGFuZ2UpXCI7XG4gICAgfVxuICB9LFxuICBub3JtYWw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiIG1ldGEgLSBcIiArIHRoaXMubWV0YWdhbWVTdGF0ZSArIFwiXFxuIG5leHQgLSBcIiArIHRoaXMubmV4dEJyaWNrICsgXCJcXG4gdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuZnJhbWUgLSBcIiArIHRoaXMuZWxhcHNlZEZyYW1lcyArIFwiXFxuYnJpY2sgLSBcIiArIHRoaXMuY3VycmVudEJyaWNrICsgXCJcXG5zY29yZSAtIFwiICsgdGhpcy5zY29yZSArIFwiXFxuIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKTtcbiAgfVxufTtcbm91dCQuRGVidWdPdXRwdXQgPSBEZWJ1Z091dHB1dCA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z091dHB1dC5kaXNwbGF5TmFtZSA9ICdEZWJ1Z091dHB1dCc7XG4gIHZhciBwcm90b3R5cGUgPSBEZWJ1Z091dHB1dC5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdPdXRwdXQ7XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSwgb3V0cHV0KXtcbiAgICByZXR1cm4gb3V0cHV0LmlubmVyVGV4dCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gIH07XG4gIGZ1bmN0aW9uIERlYnVnT3V0cHV0KCl7fVxuICByZXR1cm4gRGVidWdPdXRwdXQ7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCByYWYsIEZyYW1lRHJpdmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYWYgPSByZWYkLnJhZjtcbm91dCQuRnJhbWVEcml2ZXIgPSBGcmFtZURyaXZlciA9IChmdW5jdGlvbigpe1xuICBGcmFtZURyaXZlci5kaXNwbGF5TmFtZSA9ICdGcmFtZURyaXZlcic7XG4gIHZhciBwcm90b3R5cGUgPSBGcmFtZURyaXZlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRnJhbWVEcml2ZXI7XG4gIGZ1bmN0aW9uIEZyYW1lRHJpdmVyKG9uRnJhbWUpe1xuICAgIHRoaXMub25GcmFtZSA9IG9uRnJhbWU7XG4gICAgdGhpcy5mcmFtZSA9IGJpbmQkKHRoaXMsICdmcmFtZScsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6Om5ldyAtIG5ldyBGcmFtZURyaXZlclwiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgemVybzogMCxcbiAgICAgIHRpbWU6IDAsXG4gICAgICBmcmFtZTogMCxcbiAgICAgIHJ1bm5pbmc6IGZhbHNlXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBub3csIM6UdDtcbiAgICBub3cgPSBEYXRlLm5vdygpIC0gdGhpcy5zdGF0ZS56ZXJvO1xuICAgIM6UdCA9IHRoaXMuc3RhdGUudGltZSAtIG5vdztcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSBub3c7XG4gICAgdGhpcy5zdGF0ZS5mcmFtZSA9IHRoaXMuc3RhdGUuZnJhbWUgKyAxO1xuICAgIHRoaXMub25GcmFtZSjOlHQsIHRoaXMuc3RhdGUudGltZSwgdGhpcy5zdGF0ZS5mcmFtZSk7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgcmV0dXJuIHJhZih0aGlzLmZyYW1lKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS56ZXJvID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUucnVubmluZyA9IHRydWU7XG4gICAgcmV0dXJuIHJhZih0aGlzLmZyYW1lKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdG9wIC0gc3RvcHBpbmdcIik7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucnVubmluZyA9IGZhbHNlO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEtFWSwgQUNUSU9OX05BTUUsIGV2ZW50U3VtbWFyeSwgSW5wdXRIYW5kbGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuS0VZID0ge1xuICBSRVRVUk46IDEzLFxuICBFU0NBUEU6IDI3LFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDBcbn07XG5BQ1RJT05fTkFNRSA9IChyZWYkID0ge30sIHJlZiRbS0VZLlJFVFVSTiArIFwiXCJdID0gJ2NvbmZpcm0nLCByZWYkW0tFWS5FU0NBUEUgKyBcIlwiXSA9ICdiYWNrJywgcmVmJFtLRVkuU1BBQ0UgKyBcIlwiXSA9ICdhY3Rpb24nLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAndXAnLCByZWYkW0tFWS5SSUdIVCArIFwiXCJdID0gJ3JpZ2h0JywgcmVmJFtLRVkuRE9XTiArIFwiXCJdID0gJ2Rvd24nLCByZWYkKTtcbmV2ZW50U3VtbWFyeSA9IGZ1bmN0aW9uKGV2ZW50U2F2ZXIsIGtleURpcmVjdGlvbil7XG4gIHJldHVybiBmdW5jdGlvbihhcmckKXtcbiAgICB2YXIgd2hpY2gsIHRoYXQ7XG4gICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgIGlmICh0aGF0ID0gQUNUSU9OX05BTUVbd2hpY2hdKSB7XG4gICAgICByZXR1cm4gZXZlbnRTYXZlcih7XG4gICAgICAgIGtleTogdGhhdCxcbiAgICAgICAgYWN0aW9uOiBrZXlEaXJlY3Rpb25cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5vdXQkLklucHV0SGFuZGxlciA9IElucHV0SGFuZGxlciA9IChmdW5jdGlvbigpe1xuICBJbnB1dEhhbmRsZXIuZGlzcGxheU5hbWUgPSAnSW5wdXRIYW5kbGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IElucHV0SGFuZGxlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gSW5wdXRIYW5kbGVyO1xuICBmdW5jdGlvbiBJbnB1dEhhbmRsZXIoKXtcbiAgICB0aGlzLnNhdmVFdmVudCA9IGJpbmQkKHRoaXMsICdzYXZlRXZlbnQnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIklucHV0SGFuZGxlcjo6bmV3IC0gbmV3IElucHV0SGFuZGxlclwiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2F2ZWRFdmVudHM6IFtdXG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnRTdW1tYXJ5KHRoaXMuc2F2ZUV2ZW50LCAnZG93bicpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50U3VtbWFyeSh0aGlzLnNhdmVFdmVudCwgJ3VwJykpO1xuICB9XG4gIHByb3RvdHlwZS5zYXZlRXZlbnQgPSBmdW5jdGlvbihldmVudFN1bW1hcnkpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnNhdmVkRXZlbnRzLnB1c2goZXZlbnRTdW1tYXJ5KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNoYW5nZXM7XG4gICAgY2hhbmdlcyA9IHRoaXMuc3RhdGUuc2F2ZWRFdmVudHM7XG4gICAgdGhpcy5zdGF0ZS5zYXZlZEV2ZW50cyA9IFtdO1xuICAgIHJldHVybiBjaGFuZ2VzO1xuICB9O1xuICBJbnB1dEhhbmRsZXIuZGVidWdNb2RlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgcmV0dXJuIGxvZyhcIklucHV0SGFuZGxlcjo6ZGVidWdNb2RlIC1cIiwgd2hpY2gsIEFDVElPTl9OQU1FW3doaWNoXSB8fCAnW3VuYm91bmRdJyk7XG4gICAgfSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5vbiA9IGZ1bmN0aW9uKGNvZGUsIM67KXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgaWYgKHdoaWNoID09PSBjb2RlKSB7XG4gICAgICAgIHJldHVybiDOuygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICByZXR1cm4gSW5wdXRIYW5kbGVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciBpZCwgbG9nLCByYWYsIHRoYXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5yYWYgPSByYWYgPSAodGhhdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgPyB0aGF0XG4gIDogKHRoYXQgPSB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgPyB0aGF0XG4gICAgOiAodGhhdCA9IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiBmdW5jdGlvbijOuyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KM67LCAxMDAwIC8gNjApO1xuICAgICAgfTsiLCJ2YXIgR2FtZUNvcmUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLkdhbWVDb3JlID0gR2FtZUNvcmUgPSAoZnVuY3Rpb24oKXtcbiAgR2FtZUNvcmUuZGlzcGxheU5hbWUgPSAnR2FtZUNvcmUnO1xuICB2YXIgcHJvdG90eXBlID0gR2FtZUNvcmUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEdhbWVDb3JlO1xuICBmdW5jdGlvbiBHYW1lQ29yZSgpe31cbiAgcmV0dXJuIEdhbWVDb3JlO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgZW51bWVyYXRlLCBHYW1lQ29yZSwgUmVuZGVyZXIsIFRldHJpc0dhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5lbnVtZXJhdGUgPSByZXF1aXJlKCdzdGQnKS5lbnVtZXJhdGU7XG5HYW1lQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJykuR2FtZUNvcmU7XG5SZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKS5SZW5kZXJlcjtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoKXtcbiAgICBsb2coXCJUZXRyaXNHYW1lOjpuZXcgLSBuZXcgVGV0cmlzR2FtZVwiKTtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyO1xuICB9XG4gIHByb3RvdHlwZS5ydW5GcmFtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgcmV0dXJuIGdhbWVTdGF0ZTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSwgb3V0cHV0KXtcbiAgICBzd2l0Y2ggKGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJTdGFydE1lbnUoZ2FtZVN0YXRlLCBvdXRwdXQpO1xuICAgIGNhc2UgJ3BhdXNlJzpcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnJlbmRlclBhdXNlTWVudShnYW1lU3RhdGUsIG91dHB1dCk7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJHYW1lKGdhbWVTdGF0ZSwgb3V0cHV0KTtcbiAgICBjYXNlICd3aW4nOlxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucmVuZGVyV2luU2NyZWVuKGdhbWVTdGF0ZSwgb3V0cHV0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBUZXRyaXNHYW1lO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmxpdHRlciwgUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CbGl0dGVyID0gKGZ1bmN0aW9uKCl7XG4gIEJsaXR0ZXIuZGlzcGxheU5hbWUgPSAnQmxpdHRlcic7XG4gIHZhciBwcm90b3R5cGUgPSBCbGl0dGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCbGl0dGVyO1xuICBmdW5jdGlvbiBCbGl0dGVyKHgsIHkpe1xuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB4O1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHk7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICB9XG4gIHJldHVybiBCbGl0dGVyO1xufSgpKTtcbm91dCQuUmVuZGVyZXIgPSBSZW5kZXJlciA9IChmdW5jdGlvbigpe1xuICBSZW5kZXJlci5kaXNwbGF5TmFtZSA9ICdSZW5kZXJlcic7XG4gIHZhciBwcm90b3R5cGUgPSBSZW5kZXJlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUmVuZGVyZXI7XG4gIFJlbmRlcmVyLmJsaXR0ZXIgPSB7XG4gICAgZ2FtZUZyYW1lOiBuZXcgQmxpdHRlcigyMDAsIDIwMCksXG4gICAgbWVudUZyYW1lOiBuZXcgQmxpdHRlcigyMDAsIDIwMCksXG4gICAgYmxvY2tQcmV2aWV3OiBuZXcgQmxpdHRlcigyMDAsIDIwMCksXG4gICAgYXJlbmE6IG5ldyBCbGl0dGVyKDIwMCwgMjAwKSxcbiAgICBzdGFydE1lbnU6IG5ldyBCbGl0dGVyKDIwMCwgMjAwKSxcbiAgICBwYXVzZU1lbnU6IG5ldyBCbGl0dGVyKDIwMCwgMjAwKVxuICB9O1xuICBwcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihjdHgpe307XG4gIHByb3RvdHlwZS5yZW5kZXJTdGFydE1lbnUgPSBmdW5jdGlvbigpe307XG4gIHByb3RvdHlwZS5yZW5kZXJHYW1lID0gZnVuY3Rpb24oYXJnJCwgY3R4KXtcbiAgICB2YXIgYXJlbmE7XG4gICAgYXJlbmEgPSBhcmckLmFyZW5hO1xuICAgIHJldHVybiBsb2coYXJndW1lbnRzKTtcbiAgfTtcbiAgZnVuY3Rpb24gUmVuZGVyZXIoKXt9XG4gIHJldHVybiBSZW5kZXJlcjtcbn0oKSk7Il19
