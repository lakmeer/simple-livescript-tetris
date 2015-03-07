
# Require

{ log, raf } = require \std

{ FrameDriver }  = require \./frame-driver
{ InputHandler } = require \./input-handler
{ TetrisGame }   = require \./tetris-game


# Program index

game-state =
  metagame-state: \no-game
  score: 0
  next-brick: 0
  current-brick: 0
  arena: for y til 18 => for x til 10 => 0
  input-state: {}
  elapsed-time: 0
  elapsed-frames: 0

input-handler = new InputHandler

tetris-game = new TetrisGame


# Output

canvas = document.get-element-by-id \canvas
ctx = canvas.get-context \2d


# Frame loop

frame-driver = new FrameDriver (Δt, time, frame) ->
  game-state.elapsed-time   = time
  game-state.elapsed-frames = frame
  game-state.input-state    = input-handler.changes-since-last-frame!

  game-state := tetris-game.run-frame game-state, Δt

  tetris-game.render game-state, canvas


# Bind controls


# Init

# frame-driver.start!


#
# DEBUG
#

InputHandler.debug-mode!
InputHandler.on 192, frame-driver~stop

