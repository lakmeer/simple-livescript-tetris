
# Require

{ id, log, rand } = require \std
{ random-from } = require \std

{ GameCore } = require \./game-core
{ Renderer } = require \./renderer
{ Timer }    = require \../timer


# Reference Constants

brick-colors = <[ black #e00 #f70 #ee0 #0f4 #2ed #35f #b0b ]>

brick-shapes =
  * [[1 1],
     [1 1]]
  * [[2 2 0],
     [0 2 2]]
  * [[0 3 3],
     [3 3 0]]
  * [[4 0],
     [4 0],
     [4 4]]
  * [[0 5],
     [0 5],
     [5 5]]
  * [[0 6 0],
     [6 6 6]]
  * [[7],
     [7],
     [7],
     [7]]


# Pure Helpers

new-brick = (ix = rand 0, brick-shapes.length) ->
  shape: brick-shapes[ix]
  color: brick-colors[ix]
  pos: [4, 0]

can-move = ({ pos, shape }, arena, move) ->
  if not (0 <= pos.0 + move.0) or
     not (pos.0 + move.0 + shape.0.length <= arena.0.length)
    return false

  if not (0 <= pos.1 + move.1 < arena.length) or
     not (pos.1 + move.1 + shape.length <= arena.length)
    return false

  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      arena-cell = arena[v + move.1][u + move.0]
      #log arena-cell, shape[y][x]
      if arena-cell and shape[y][x]
        return false
  return true

copy-brick-to-arena = ({ pos, shape }, arena) ->
  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      arena[v][u] = shape[y][x]

top-is-reached = (arena) ->
  for cell in arena.0
    if cell
      return true
  return false

is-complete = (row) ->
  for cell in row
    if not cell
      return false
  return true

clear-arena = (arena) ->
  for row in arena
    for cell in row
      cell = 0

spawn-new-brick = (game-state) ->
  game-state.current-brick = game-state.next-brick
  game-state.current-brick.pos = [4, 0]
  game-state.next-brick = new-brick!

drop-arena-row = (arena, row-ix) ->
  arena.splice row-ix, 1
  arena.unshift [ 0 ] * arena.0.length


#
# Tetris Game
#
# Presents the unified interface to the Tetris game
#

export class TetrisGame

  ->
    log "TetrisGame::new"
    @renderer = new Renderer
    @timer = new Timer

  show-fail-screen: (game-state, Δt) ->
    console.debug \FAILED

  begin-new-game: (game-state) ->
    game-state.arena = clear-arena game-state.arena
    game-state.arena.[ game-state.arena.length - 3 ] = [ 1 2 3 0 0 0 5 4 3 2 ]
    game-state.arena.[ game-state.arena.length - 2 ] = [ 1 2 3 4 5 0 5 4 3 2 ]
    game-state.arena.[ game-state.arena.length - 1 ] = [ 1 2 3 4 5 6 5 4 3 2 ]
    game-state.next-brick = new-brick!
    game-state.current-brick = new-brick!
    game-state.current-brick.pos = [4,0]
    game-state.score = 0
    game-state.metagame-state = \game

  advance-game: ({ current-brick, arena, input-state }:game-state) ->

    # Handle user input
    while game-state.input-state.length
      { key, action } = game-state.input-state.shift!
      if action is \down
        switch key
        | \left =>
          if can-move current-brick, arena, [ -1, 0 ]
            current-brick.pos.0 -= 1
        | \right =>
          if can-move current-brick, arena, [ 1, 0 ]
            current-brick.pos.0 += 1

    # Drop current brick. If it hits, save it to the arena and make a new one
    if can-move current-brick, arena, [ 0, 1 ]
      current-brick.pos.1 += 1
    else
      copy-brick-to-arena current-brick, arena
      spawn-new-brick game-state

    # Check for completed lines. If found, remove them, drop upper cells
    for row-ix in [ ix for row, ix in arena when is-complete row ]
      drop-arena-row game-state.arena, row-ix

    # Check if top has been reached. If so, change game mode to fail
    if top-is-reached arena
      game-state.metagame-state = \failure

    return game-state


  run-frame: ({ metagame-state }:game-state, Δt) ->
    switch metagame-state
    | \failure => @show-fail-screen ...
    | \game => @advance-game ...
    | \no-game => @begin-new-game ...
    | otherwise => console.debug 'Unknown metagame-state:', metagame-state
    return game-state

  render: ({ metagame-state }:game-state, output) ->
    switch metagame-state
    | \no-game => @renderer.render-start-menu game-state, output
    | \pause   => @renderer.render-pause-menu game-state, output
    | \game    => @renderer.render-game       game-state, output
    | \win     => @renderer.render-win-screen game-state, output
    | otherwise => void

