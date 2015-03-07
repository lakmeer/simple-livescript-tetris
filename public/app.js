(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, raf, FrameDriver, InputHandler, TetrisGame, gameState, y, x, inputHandler, tetrisGame, canvas, ctx, frameDriver;
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
frameDriver = new FrameDriver(function(Δt, time, frame){
  gameState.elapsedTime = time;
  gameState.elapsedFrames = frame;
  gameState.inputState = inputHandler.changesSinceLastFrame();
  gameState = tetrisGame.runFrame(gameState, Δt);
  return tetrisGame.render(gameState, canvas);
});
InputHandler.debugMode();
InputHandler.on(192, bind$(frameDriver, 'stop'));
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"./frame-driver":2,"./input-handler":3,"./tetris-game":6,"std":4}],2:[function(require,module,exports){
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
      time: 0,
      frame: 0,
      running: true
    };
  }
  prototype.frame = function(){
    var now, Δt;
    now = Date.now();
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
    this.state.time = Date.now();
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
},{"std":4}],3:[function(require,module,exports){
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
},{"std":4}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var GameCore, out$ = typeof exports != 'undefined' && exports || this;
out$.GameCore = GameCore = (function(){
  GameCore.displayName = 'GameCore';
  var prototype = GameCore.prototype, constructor = GameCore;
  function GameCore(){}
  return GameCore;
}());
},{}],6:[function(require,module,exports){
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
      return this.renderer.renderStartMenu(gameState);
    case 'pause':
      return this.renderer.renderPauseMenu(gameState);
    case 'game':
      return this.renderer.renderGame(gameState);
    case 'win':
      return this.renderer.renderWinScreen(gameState);
    }
  };
  return TetrisGame;
}());
},{"./game-core":5,"./renderer":7,"std":4}],7:[function(require,module,exports){
var ref$, id, log, Renderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Renderer = Renderer = (function(){
  Renderer.displayName = 'Renderer';
  var prototype = Renderer.prototype, constructor = Renderer;
  prototype.renderStartMenu = function(){};
  function Renderer(){}
  return Renderer;
}());
},{"std":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvZnJhbWUtZHJpdmVyLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9pbnB1dC1oYW5kbGVyLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdGV0cmlzL3NyYy9zdGQvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3RldHJpcy9zcmMvdGV0cmlzLWdhbWUvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy90ZXRyaXMvc3JjL3RldHJpcy1nYW1lL3JlbmRlcmVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIHJhZiwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGV0cmlzR2FtZSwgZ2FtZVN0YXRlLCB5LCB4LCBpbnB1dEhhbmRsZXIsIHRldHJpc0dhbWUsIGNhbnZhcywgY3R4LCBmcmFtZURyaXZlcjtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xuVGV0cmlzR2FtZSA9IHJlcXVpcmUoJy4vdGV0cmlzLWdhbWUnKS5UZXRyaXNHYW1lO1xuZ2FtZVN0YXRlID0ge1xuICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gIHNjb3JlOiAwLFxuICBuZXh0QnJpY2s6IDAsXG4gIGN1cnJlbnRCcmljazogMCxcbiAgYXJlbmE6IChmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbHJlc3VsdCQsIGokLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8IDE4OyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDA7IGokIDwgMTA7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBscmVzdWx0JC5wdXNoKDApO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfSgpKSxcbiAgaW5wdXRTdGF0ZToge30sXG4gIGVsYXBzZWRUaW1lOiAwLFxuICBlbGFwc2VkRnJhbWVzOiAwXG59O1xuaW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcjtcbnRldHJpc0dhbWUgPSBuZXcgVGV0cmlzR2FtZTtcbmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuZnJhbWVEcml2ZXIgPSBuZXcgRnJhbWVEcml2ZXIoZnVuY3Rpb24ozpR0LCB0aW1lLCBmcmFtZSl7XG4gIGdhbWVTdGF0ZS5lbGFwc2VkVGltZSA9IHRpbWU7XG4gIGdhbWVTdGF0ZS5lbGFwc2VkRnJhbWVzID0gZnJhbWU7XG4gIGdhbWVTdGF0ZS5pbnB1dFN0YXRlID0gaW5wdXRIYW5kbGVyLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSgpO1xuICBnYW1lU3RhdGUgPSB0ZXRyaXNHYW1lLnJ1bkZyYW1lKGdhbWVTdGF0ZSwgzpR0KTtcbiAgcmV0dXJuIHRldHJpc0dhbWUucmVuZGVyKGdhbWVTdGF0ZSwgY2FudmFzKTtcbn0pO1xuSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSgpO1xuSW5wdXRIYW5kbGVyLm9uKDE5MiwgYmluZCQoZnJhbWVEcml2ZXIsICdzdG9wJykpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhZiwgRnJhbWVEcml2ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xub3V0JC5GcmFtZURyaXZlciA9IEZyYW1lRHJpdmVyID0gKGZ1bmN0aW9uKCl7XG4gIEZyYW1lRHJpdmVyLmRpc3BsYXlOYW1lID0gJ0ZyYW1lRHJpdmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEZyYW1lRHJpdmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZURyaXZlcjtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3IC0gbmV3IEZyYW1lRHJpdmVyXCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICBydW5uaW5nOiB0cnVlXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBub3csIM6UdDtcbiAgICBub3cgPSBEYXRlLm5vdygpO1xuICAgIM6UdCA9IHRoaXMuc3RhdGUudGltZSAtIG5vdztcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSBub3c7XG4gICAgdGhpcy5zdGF0ZS5mcmFtZSA9IHRoaXMuc3RhdGUuZnJhbWUgKyAxO1xuICAgIHRoaXMub25GcmFtZSjOlHQsIHRoaXMuc3RhdGUudGltZSwgdGhpcy5zdGF0ZS5mcmFtZSk7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgcmV0dXJuIHJhZih0aGlzLmZyYW1lKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiByYWYodGhpcy5mcmFtZSk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RvcCAtIHN0b3BwaW5nXCIpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfTtcbiAgcmV0dXJuIEZyYW1lRHJpdmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBLRVksIEFDVElPTl9OQU1FLCBldmVudFN1bW1hcnksIElucHV0SGFuZGxlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbktFWSA9IHtcbiAgUkVUVVJOOiAxMyxcbiAgRVNDQVBFOiAyNyxcbiAgU1BBQ0U6IDMyLFxuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwXG59O1xuQUNUSU9OX05BTUUgPSAocmVmJCA9IHt9LCByZWYkW0tFWS5SRVRVUk4gKyBcIlwiXSA9ICdjb25maXJtJywgcmVmJFtLRVkuRVNDQVBFICsgXCJcIl0gPSAnYmFjaycsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnYWN0aW9uJywgcmVmJFtLRVkuTEVGVCArIFwiXCJdID0gJ2xlZnQnLCByZWYkW0tFWS5VUCArIFwiXCJdID0gJ3VwJywgcmVmJFtLRVkuUklHSFQgKyBcIlwiXSA9ICdyaWdodCcsIHJlZiRbS0VZLkRPV04gKyBcIlwiXSA9ICdkb3duJywgcmVmJCk7XG5ldmVudFN1bW1hcnkgPSBmdW5jdGlvbihldmVudFNhdmVyLCBrZXlEaXJlY3Rpb24pe1xuICByZXR1cm4gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHdoaWNoLCB0aGF0O1xuICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICBpZiAodGhhdCA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgcmV0dXJuIGV2ZW50U2F2ZXIoe1xuICAgICAgICBrZXk6IHRoYXQsXG4gICAgICAgIGFjdGlvbjoga2V5RGlyZWN0aW9uXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zYXZlRXZlbnQgPSBiaW5kJCh0aGlzLCAnc2F2ZUV2ZW50JywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJJbnB1dEhhbmRsZXI6Om5ldyAtIG5ldyBJbnB1dEhhbmRsZXJcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNhdmVkRXZlbnRzOiBbXVxuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50U3VtbWFyeSh0aGlzLnNhdmVFdmVudCwgJ2Rvd24nKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldmVudFN1bW1hcnkodGhpcy5zYXZlRXZlbnQsICd1cCcpKTtcbiAgfVxuICBwcm90b3R5cGUuc2F2ZUV2ZW50ID0gZnVuY3Rpb24oZXZlbnRTdW1tYXJ5KXtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zYXZlZEV2ZW50cy5wdXNoKGV2ZW50U3VtbWFyeSk7XG4gIH07XG4gIHByb3RvdHlwZS5jaGFuZ2VzU2luY2VMYXN0RnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBjaGFuZ2VzO1xuICAgIGNoYW5nZXMgPSB0aGlzLnN0YXRlLnNhdmVkRXZlbnRzO1xuICAgIHRoaXMuc3RhdGUuc2F2ZWRFdmVudHMgPSBbXTtcbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIHJldHVybiBsb2coXCJJbnB1dEhhbmRsZXI6OmRlYnVnTW9kZSAtXCIsIHdoaWNoLCBBQ1RJT05fTkFNRVt3aGljaF0gfHwgJ1t1bmJvdW5kXScpO1xuICAgIH0pO1xuICB9O1xuICBJbnB1dEhhbmRsZXIub24gPSBmdW5jdGlvbihjb2RlLCDOuyl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIGlmICh3aGljaCA9PT0gY29kZSkge1xuICAgICAgICByZXR1cm4gzrsoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIElucHV0SGFuZGxlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn0iLCJ2YXIgaWQsIGxvZywgcmFmLCB0aGF0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5pZCA9IGlkID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQ7XG59O1xub3V0JC5sb2cgPSBsb2cgPSBmdW5jdGlvbigpe1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gYXJndW1lbnRzWzBdO1xufTtcbm91dCQucmFmID0gcmFmID0gKHRoYXQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gID8gdGhhdFxuICA6ICh0aGF0ID0gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgID8gdGhhdFxuICAgIDogKHRoYXQgPSB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogZnVuY3Rpb24ozrspe1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dCjOuywgMTAwMCAvIDYwKTtcbiAgICAgIH07IiwidmFyIEdhbWVDb3JlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5HYW1lQ29yZSA9IEdhbWVDb3JlID0gKGZ1bmN0aW9uKCl7XG4gIEdhbWVDb3JlLmRpc3BsYXlOYW1lID0gJ0dhbWVDb3JlJztcbiAgdmFyIHByb3RvdHlwZSA9IEdhbWVDb3JlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBHYW1lQ29yZTtcbiAgZnVuY3Rpb24gR2FtZUNvcmUoKXt9XG4gIHJldHVybiBHYW1lQ29yZTtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIGVudW1lcmF0ZSwgR2FtZUNvcmUsIFJlbmRlcmVyLCBUZXRyaXNHYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuZW51bWVyYXRlID0gcmVxdWlyZSgnc3RkJykuZW51bWVyYXRlO1xuR2FtZUNvcmUgPSByZXF1aXJlKCcuL2dhbWUtY29yZScpLkdhbWVDb3JlO1xuUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJykuUmVuZGVyZXI7XG5vdXQkLlRldHJpc0dhbWUgPSBUZXRyaXNHYW1lID0gKGZ1bmN0aW9uKCl7XG4gIFRldHJpc0dhbWUuZGlzcGxheU5hbWUgPSAnVGV0cmlzR2FtZSc7XG4gIHZhciBwcm90b3R5cGUgPSBUZXRyaXNHYW1lLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUZXRyaXNHYW1lO1xuICBmdW5jdGlvbiBUZXRyaXNHYW1lKCl7XG4gICAgbG9nKFwiVGV0cmlzR2FtZTo6bmV3IC0gbmV3IFRldHJpc0dhbWVcIik7XG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcjtcbiAgfVxuICBwcm90b3R5cGUucnVuRnJhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihnYW1lU3RhdGUsIG91dHB1dCl7XG4gICAgc3dpdGNoIChnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucmVuZGVyU3RhcnRNZW51KGdhbWVTdGF0ZSk7XG4gICAgY2FzZSAncGF1c2UnOlxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucmVuZGVyUGF1c2VNZW51KGdhbWVTdGF0ZSk7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5yZW5kZXJHYW1lKGdhbWVTdGF0ZSk7XG4gICAgY2FzZSAnd2luJzpcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnJlbmRlcldpblNjcmVlbihnYW1lU3RhdGUpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBSZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbm91dCQuUmVuZGVyZXIgPSBSZW5kZXJlciA9IChmdW5jdGlvbigpe1xuICBSZW5kZXJlci5kaXNwbGF5TmFtZSA9ICdSZW5kZXJlcic7XG4gIHZhciBwcm90b3R5cGUgPSBSZW5kZXJlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUmVuZGVyZXI7XG4gIHByb3RvdHlwZS5yZW5kZXJTdGFydE1lbnUgPSBmdW5jdGlvbigpe307XG4gIGZ1bmN0aW9uIFJlbmRlcmVyKCl7fVxuICByZXR1cm4gUmVuZGVyZXI7XG59KCkpOyJdfQ==
