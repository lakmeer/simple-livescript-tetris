
# Require

{ log, delay } = require \std

{ FrameDriver }  = require \./frame-driver
{ InputHandler } = require \./input-handler
{ Timer }        = require \./timer
{ TetrisGame }   = require \./tetris-game
{ GameState }    = require \./game-state

{ DomRenderer }     = require \./renderers/dom
{ CanvasRenderer }  = require \./renderers/canvas
{ ThreeJsRenderer } = require \./renderers/threejs

{ DebugOutput } = require \./debug-output


#
# Setup
#

game-opts =
  tile-width  : 10
  tile-height : 18
  time-factor : 2

render-opts =
  z: 20

input-handler = new InputHandler
game-state    = new GameState game-opts
tetris-game   = new TetrisGame game-state

renderers = [
  #new CanvasRenderer render-opts
  #new DomRenderer render-opts
  new ThreeJsRenderer render-opts, game-state
]

for renderer in renderers
  renderer.append-to document.body


#
# Debug
#

debug-output = new DebugOutput
#InputHandler.debug-mode!
InputHandler.on 192, ->
  if frame-driver.state.running
    frame-driver.stop!
  else
    frame-driver.start!


#
# Frame loop
#

frame-driver = new FrameDriver (Δt, time, frame) ->
  game-state.elapsed-time   = time
  game-state.elapsed-frames = frame
  game-state.input-state    = input-handler.changes-since-last-frame!

  Timer.update-all Δt / game-opts.time-factor

  game-state := tetris-game.run-frame game-state, Δt

  for renderer in renderers
    renderer.render game-state, render-opts

  if debug-output
    debug-output.render game-state


# Init

frame-driver.start!
#delay 30000, frame-driver~stop

tetris-game.begin-new-game game-state

