
# Require

{ log, delay } = require \std

{ FrameDriver }  = require \./frame-driver
{ InputHandler } = require \./input-handler
{ TetrisGame }   = require \./tetris-game


#
# Setup
#

input-handler = new InputHandler
tetris-game = new TetrisGame

tile-size   = 20
tile-width  = 10
tile-height = 18

current-brick =
  * [ 1, 0 ]
  * [ 1, 0 ]
  * [ 1, 1 ]

next-brick =
  * [ 1, 1 ]
  * [ 1, 1 ]

game-state =
  metagame-state: \no-game
  score: 0
  next-brick:
    shape: next-brick
  current-brick:
    shape: current-brick
    pos: [ 4, 0 ]
  input-state: []
  elapsed-time: 0
  elapsed-frames: 0
  tile-size: tile-size
  tile-width: tile-width
  tile-height: tile-height
  arena:
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 0 ] * tile-width
    * [ 1 ] * tile-width
    * [ 2 ] * tile-width
    * [ 3 ] * tile-width
    * [ 4 ] * tile-width
    * [ 5 ] * tile-width
    * [ 6 ] * tile-width
    * [ 7 ] * tile-width

#
# Output
#

output-canvas  = document.get-element-by-id \canvas
output-context = output-canvas.get-context \2d

output-canvas.style.background = "white"
output-canvas.style.border = "3px solid"
output-canvas.style.border-color = "\#444 \#999 \#eee \#777"
output-canvas.style.border-radius = "3px"

output-canvas.width  = 1 + 10 * 20
output-canvas.height = 1 + 18 * 20


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

  tetris-game.render game-state, output-context

  if debug-output?
    debug-output.render game-state, dbo

  if game-state.metagame-state is \failure
    frame-driver.stop!


# Init

frame-driver.start!
delay 1000, -> game-state.input-state.push { key: \left, action: \down }
delay 1000, -> game-state.input-state.push { key: \left, action: \up }
delay 30000, frame-driver~stop


