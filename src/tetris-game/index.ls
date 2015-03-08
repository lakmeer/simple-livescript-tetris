
# Require

{ id, log, rand } = require \std
{ random-from } = require \std

{ GameState } = require \./game-state
{ Renderer }  = require \./renderer
{ Timer }     = require \../timer

Core  = require \./game-core


# Pure Helpers

#
# Tetris Game
#
# Presents the unified interface to the various components of the game
#

export class TetrisGame

  (game-state) ->
    log "TetrisGame::new"
    @renderer  = new Renderer

  show-fail-screen: (game-state, Δt) ->
    console.debug \FAILED
    @begin-new-game game-state

  begin-new-game: (game-state) ->
    let this = game-state
      Core.clear-arena @arena
      @brick.next        = Core.new-brick!
      @brick.next.pos    = [4 -1]
      @brick.current     = Core.new-brick!
      @brick.current.pos = [4 -1]
      @score             = 0
      @metagame-state    = \game
      @timers.drop-timer.reset!
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
        | \action =>
          if Core.can-rotate brick.current, 1, arena
            Core.rotate-brick gs.brick.current, 1

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
      for row-ix in [ ix for row, ix in arena.cells when Core.is-complete row ]
        Core.drop-arena-row gs.arena, row-ix

      # Check if top has been reached. If so, change game mode to fail
      if Core.top-is-reached arena
        gs.metagame-state = \failure


  run-frame: ({ metagame-state }:game-state, Δt) ->
    switch metagame-state
    | \failure => @show-fail-screen ...
    | \game => @advance-game ...
    | \no-game => @begin-new-game ...
    | otherwise => console.debug 'Unknown metagame-state:', metagame-state
    return game-state

  render: ({ metagame-state }:game-state, render-opts, output) ->
    switch metagame-state
    | \no-game => @renderer.render-start-menu game-state, render-opts, output
    | \pause   => @renderer.render-pause-menu game-state, render-opts, output
    | \game    => @renderer.render-game       game-state, render-opts, output
    | \win     => @renderer.render-win-screen game-state, render-opts, output
    | otherwise => void


# Export

module.exports = { TetrisGame, GameState }

