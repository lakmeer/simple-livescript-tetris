
# Require

{ id, log, rand } = require \std
{ random-from } = require \std

Core      = require \./game-core
StartMenu = require \./start-menu


# Pure Helpers

#
# Tetris Game
#
# Presents the unified interface to the various components of the game
#

export class TetrisGame

  (game-state) ->
    log "TetrisGame::new"

    # Each module should prime it's own chunk of the state
    StartMenu.prime-game-state game-state
    # ... and so on, when I get around to it

  show-fail-screen: (game-state, Δt) ->
    console.debug \FAILED
    game-state.metagame-state = \start-menu
    StartMenu.prime-game-state game-state

  begin-new-game: (game-state) ->
    let this = game-state
      Core.clear-arena @arena
      @brick.next        = Core.new-brick!
      @brick.next.pos    = [3 -1]
      @brick.current     = Core.new-brick!
      @brick.current.pos = [3 -1]
      @score             = 0
      @metagame-state    = \game
      @timers.drop-timer.reset!
      @timers.key-repeat-timer.reset!
    return game-state

  advance-game: ({ brick, arena, input-state }:gs) ->

    # Handle user input
    while input-state.length
      { key, action } = input-state.shift!
      if action is \down
        switch key
        | \left =>
          if Core.can-move brick.current, [-1, 0 ], arena
            brick.current.pos.0 -= 1
        | \right =>
          if Core.can-move brick.current, [ 1, 0 ], arena
            brick.current.pos.0 += 1
        | \down =>
          gs.force-down-mode = on
        | \cw =>
          if Core.can-rotate brick.current, 1, arena
            Core.rotate-brick brick.current, 1
        | \ccw =>
          if Core.can-rotate brick.current, -1, arena
            Core.rotate-brick brick.current, -1
        | \hard-drop =>
          while Core.can-drop brick.current, arena
            brick.current.pos.1 += 1
          gs.input-state = []
          gs.timers.drop-timer.time-to-expiry = -1

      else if action is \up
        switch key
        | \down =>
          gs.force-down-mode = off

    # If the game is in force-down mode, drop the brick every frame
    if gs.force-down-mode and gs.timers.force-drop-wait-timer.expired
      if Core.can-drop brick.current, arena
        brick.current.pos.1 += 1
      else
        Core.copy-brick-to-arena brick.current, arena
        gs.force-down-mode = off
        gs.timers.force-drop-wait-timer.reset!
        gs.timers.drop-timer.time-to-expiry = gs.timers.force-drop-wait-timer.target-time

    # If the drop-timer has expired, drop current brick.
    if gs.timers.drop-timer.expired
      gs.timers.drop-timer.reset-with-remainder!

      # If it hits, save it to the arena and make a new one
      if Core.can-drop brick.current, arena
        brick.current.pos.1 += 1
      else
        Core.copy-brick-to-arena brick.current, arena
        Core.spawn-new-brick gs

      # Check for completed lines. If found, remove them, drop upper rows
      rows-dropped =
        for row-ix in [ ix for row, ix in arena.cells when Core.is-complete row ]
          Core.drop-arena-row gs.arena, row-ix

      # Add any dropped lines to score
      gs.lines += rows-dropped.length

      # Check if top has been reached. If so, change game mode to fail
      if Core.top-is-reached arena
        gs.metagame-state = \failure

  show-start-screen: ({ input-state, start-menu-state }:gs) ->

    # Handle user input
    while input-state.length
      { key, action } = input-state.shift!
      if action is \down
        switch key
        | \up =>
          StartMenu.select-prev-item start-menu-state
        | \down =>
          StartMenu.select-next-item start-menu-state
        | \action-a, \confirm =>
          if start-menu-state.current-state.state is \start-game
            @begin-new-game gs

      else if action is \up
        switch key
        | \down =>
          gs.force-down-mode = off


  run-frame: ({ metagame-state }:game-state, Δt) ->
    switch metagame-state
    | \failure     => @show-fail-screen ...
    | \game        => @advance-game ...
    | \no-game     => game-state.metagame-state = \start-menu
    | \start-menu  => @show-start-screen ...
    | otherwise => console.debug 'Unknown metagame-state:', metagame-state
    return game-state


# Export

module.exports = { TetrisGame }

