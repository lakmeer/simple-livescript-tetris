
# Require

{ id, log, rand, random-from } = require \std


# Reference

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


#
# Game Core
#
# Contains main logic for doing operations inside the tetris game itself. Other
# stuff like menus and things don't go in here.
#
# Ideally this should juist be a collection of stateless processing functions.
#

export can-move = ({ pos, shape }, arena, move) ->
  if not (0 <= pos.0 + move.0) or
     not (pos.0 + move.0 + shape.0.length <= arena.0.length)
    return false

  if not (0 <= pos.1 + move.1 < arena.length) or
     not (pos.1 + move.1 + shape.length <= arena.length)
    return false

  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      if arena[v + move.1][u + move.0] and shape[y][x]
        return false

  return true

export copy-brick-to-arena = ({ pos, shape }, arena) ->
  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      if shape[y][x]
        arena[v][u] = shape[y][x]

export top-is-reached = (arena) ->
  for cell in arena.0
    if cell
      return true
  return false

export is-complete = (row) ->
  for cell in row
    if not cell
      return false
  return true

export new-brick = (ix = rand 0, brick-shapes.length) ->
  shape: brick-shapes[ix]
  pos: [4, 0]

export spawn-new-brick = (game-state) ->
  game-state.current-brick = game-state.next-brick
  game-state.current-brick.pos = [4, 0]
  game-state.next-brick = new-brick!

export drop-arena-row = (arena, row-ix) ->
  arena.splice row-ix, 1
  arena.unshift [ 0 ] * arena.0.length

export clear-arena = (arena) ->
  for row in arena
    for cell in row
      cell = 0

