
# Require

{ id, log, rand, random-from } = require \std

BrickShapes = require \./data/brick-shapes


#
# Game Core
#
# Contains main logic for doing operations inside the tetris game itself. Other
# stuff like menus and things don't go in here.
#
# Ideally this should juist be a collection of stateless processing functions.
#

export can-move = ({ pos, shape }, { cells, width, height }, move) ->
  #if not (0 <= pos.0 + move.0) or
  #   not (pos.0 + move.0 + shape.0.length <= cells.0.length)
  #  return false

  #if not (0 <= pos.1 + move.1 < cells.length) or
  #   not (pos.1 + move.1 + shape.length <= cells.length)
  #  return false

  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      # We only collide with regard to shape-cells which are actually full
      if shape[y][x] > 0

        # Check boundaries of arena
        if (v + move.1 >= height) or (u + move.0 >= width) or (u + move.0 < 0)
          return false

        # Check cell contents of arena
        if cells[v + move.1][u + move.0]
          return false

  return true

export copy-brick-to-arena = ({ pos, shape }, { cells }) ->
  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      if shape[y][x]
        cells[v][u] = shape[y][x]

export top-is-reached = ({ cells }) ->
  for cell in cells.0
    if cell
      return true
  return false

export is-complete = (row) ->
  for cell in row
    if not cell
      return false
  return true

export new-brick = (ix = rand 0, BrickShapes.all.length) ->
  rotation: 0
  shape: BrickShapes.all[ix].shapes.0
  type: BrickShapes.all[ix].type
  pos: [0 0]

export spawn-new-brick = (gs) ->
  gs.brick.current = gs.brick.next
  gs.brick.current.pos = [4 -1]
  gs.brick.next = new-brick!

export drop-arena-row = ({ cells }, row-ix) ->
  cells.splice row-ix, 1
  cells.unshift [ 0 ] * cells.0.length

export clear-arena = (arena) ->
  for row in arena.cells
    for cell in row
      cell = 0

export get-shape-of = (brick) ->
  log BrickShapes, brick.type
  log BrickShapes[ brick.type ], brick.rotation
  log BrickShapes[ brick.type ][ brick.rotation ]

export rotate-brick = ({ rotation, type }:brick, dir = 1) ->
  log rotation, BrickShapes[ type ].length
  brick.rotation = rotation + dir % (BrickShapes[ type ].length - 1)
  brick.shape = get-shape-of brick

