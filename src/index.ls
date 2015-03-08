
# Require

{ log, delay } = require \std

{ FrameDriver }           = require \./frame-driver
{ InputHandler }          = require \./input-handler
{ TetrisGame, GameState } = require \./tetris-game
{ Timer }                 = require \./timer


#
# Setup
#

game-state = new GameState do
  tile-size   : 20
  tile-width  : 10
  tile-height : 18

render-opts = z: 20

input-handler = new InputHandler
tetris-game = new TetrisGame game-state, render-opts


#
# Output
#

output-canvas  = document.get-element-by-id \canvas
output-canvas.width  = 1 + 17 * render-opts.z
output-canvas.height = 1 + 20 * render-opts.z


#
# Debug
#

{ DebugOutput } = require \./debug-output

#InputHandler.debug-mode!
InputHandler.on 192, ->
  if frame-driver.state.running
    frame-driver.stop!
  else
    frame-driver.start!

dbo = document.create-element \pre
document.body.append-child dbo

debug-output = new DebugOutput dbo


#
# Frame loop
#

frame-driver = new FrameDriver (Δt, time, frame) ->
  game-state.elapsed-time   = time
  game-state.elapsed-frames = frame
  game-state.input-state    = input-handler.changes-since-last-frame!

  game-state := tetris-game.run-frame game-state, Δt

  Timer.update-all Δt

  output-blitter = tetris-game.render game-state, render-opts

  if debug-output?
    debug-output.render game-state, dbo

  output-blitter.blit-to-canvas output-canvas

  #if game-state.metagame-state is \failure then frame-driver.stop!


# Init

frame-driver.start!
delay 1000, -> game-state.input-state.push { key: \left, action: \down }
delay 1000, -> game-state.input-state.push { key: \left, action: \up }
#delay 30000, frame-driver~stop


