
# Require

{ id, log, rand } = require \std
{ Timer } = require \../timer


#
# Game State
#
# Contains pretty much everything. We don't really want any state inside our
# game classes.
#

export class GameState

  defaults =
    metagame-state: \no-game
    score: 0
    next-brick: void
    current-brick: void
    input-state: []
    force-down-mode: off
    elapsed-time: 0
    elapsed-frames: 0
    timers: {}
    tile-size: 20
    tile-width: 10
    tile-height: 18
    options:
      drop-speed: 500
      force-drop-wait-time: 100
    arena: [[]]

  (options) ->
    this <<< defaults <<< options
    @timers.drop-timer = new Timer @options.drop-speed
    @timers.force-drop-wait-timer = new Timer @options.force-drop-wait-time
    @arena = @@new-arena @tile-width, @tile-height

  @new-arena = (width, height) ->
    for row til height
      for cell til width
        0
