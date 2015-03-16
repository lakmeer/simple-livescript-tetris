
# Require

{ id, log, rand } = require \std
{ Timer } = require \./timer


#
# Game State
#
# Contains pretty much everything. We don't really want any state inside our
# game classes.
#

export class GameState

  defaults =
    metagame-state: \no-game
    score:
      points: 0
      lines: 0
      singles: 0
      doubles: 0
      triples: 0
      tetris: 0
    brick:
      next: void
      current: void
    input-state: []
    force-down-mode: off
    elapsed-time: 0
    elapsed-frames: 0
    timers:
      drop-timer: null
      force-drop-wait-tiemr: null
      key-repeat-timer: null
      removal-animation: null
    options:
      tile-width: 10
      tile-height: 18
      drop-speed: 500
      force-drop-wait-time: 100
      removal-animation-time: 500
      key-repeat-time: 100
    arena:
      cells: [[]]
      width: 0
      height: 0
    rows-to-remove: []

  (options) ->
    this <<< defaults
    this.options <<< options
    @timers.drop-timer            = new Timer @options.drop-speed
    @timers.force-drop-wait-timer = new Timer @options.force-drop-wait-time
    @timers.key-repeat-timer      = new Timer @options.key-repeat-time
    @timers.removal-animation     = new Timer @options.removal-animation-time
    @arena = @@new-arena @options.tile-width, @options.tile-height

  @new-arena = (width, height) ->
    cells: for row til height => for cell til width => 0
    width: width
    height: height
