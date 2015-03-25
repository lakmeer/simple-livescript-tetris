
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


# Wait for DOM

<- document.add-event-listener \DOMContentLoaded


#
# Setup
#

game-opts =
  tile-width  : 10
  tile-height : 18
  time-factor : 1

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

InputHandler.on 192, ->
  if frame-driver.state.running
    frame-driver.stop!
  else
    frame-driver.start!

#InputHandler.debug-mode!

test-easing = ->
  { Ease } = require \std

  for el in document.query-selector-all \canvas
    el.style.display = \none

  for ease-name, ease of Ease

    cnv = document.create-element \canvas
    cnv.width = 200
    cnv.height = 200
    cnv.style.background = \white
    cnv.style.border-left = "3px solid black"
    ctx = cnv.get-context \2d
    document.body.append-child cnv

    ctx.font = "14px monospace"
    ctx.fill-text ease-name, 2, 16, 200

    for i from 0 to 100
      p = i / 100
      ctx.fill-rect 2 * i, 200 - (ease p, 0, 200), 2, 2


#
# Frame loop
#

frame-driver = new FrameDriver (Δt, time, frame) ->
  game-state.Δt             = Δt / game-opts.time-factor
  game-state.elapsed-time   = time / game-opts.time-factor
  game-state.elapsed-frames = frame
  game-state.input-state    = input-handler.changes-since-last-frame!

  Timer.update-all Δt / game-opts.time-factor

  game-state := tetris-game.run-frame game-state, Δt

  for renderer in renderers
    renderer.render game-state, render-opts

  if debug-output
    debug-output.render game-state


#
# Init
#

<- delay 1000

frame-driver.start!


#
# Debug:
#

#delay 30000, frame-driver~stop
#tetris-game.begin-new-game game-state
#test-easing!


