
# Require

{ id, log } = require \std

{ Blitter } = require \../blitter

tile-colors = <[ black #e00 #f70 #ee0 #0f4 #2ed #35f #b0b ]>


#
# Brick View
#

export class BrickView extends Blitter
  -> super ...
  render: ({ current-brick: brick, tile-size }:game-state) ->
    @clear!
    for row, y in brick.shape
      for cell, x in row
        if cell
          @ctx.fill-style = tile-colors[ cell ]
          @ctx.fill-rect x * tile-size + 1, y * tile-size + 1,
            tile-size - 1, tile-size - 1

    return this

