
# Require

{ log, delay } = require \std

{ CanvasRenderer }        = require \./renderers/canvas
{ FrameDriver }           = require \./frame-driver
{ InputHandler }          = require \./input-handler
{ TetrisGame, GameState } = require \./tetris-game


{ DebugOutput } = require \./debug-output


#
# Setup
#

game-opts =
  tile-width  : 10
  tile-height : 18

render-opts =
  z: 20

input-handler = new InputHandler
renderer      = new CanvasRenderer render-opts
game-state    = new GameState game-opts
tetris-game   = new TetrisGame game-state
debug-output  = new DebugOutput

#
# Output
#

output-canvas  = document.get-element-by-id \canvas
output-canvas.width  = 1 + 17 * render-opts.z
output-canvas.height = 1 + 20 * render-opts.z


#
# Debug
#

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

  game-state := tetris-game.run-frame game-state, Δt

  output-blitter = renderer.render game-state, render-opts

  if debug-output?
    debug-output.render game-state

  output-blitter.blit-to-canvas output-canvas

  #if game-state.metagame-state is \failure then frame-driver.stop!


# Init

frame-driver.start!
delay 1000, -> game-state.input-state.push { key: \left, action: \down }
delay 1000, -> game-state.input-state.push { key: \left, action: \up }
#delay 30000, frame-driver~stop


