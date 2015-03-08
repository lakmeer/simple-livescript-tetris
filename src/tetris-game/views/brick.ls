
# Require

{ id, log } = require \std

{ Blitter } = require \../blitter

tile-colors = <[ black #e00 #f70 #ee0 #0f4 #2ed #35f #b0b ]>


#
# Brick View
#

export class BrickView extends Blitter
  -> super ...
  render: ({ brick }, { z }) ->
    @clear!

    for row, y in brick.current.shape
      for cell, x in row
        if cell
          @ctx.fill-style = tile-colors[ cell ]
          @ctx.fill-rect x * z + 1, y * z + 1, z - 1, z - 1
    return this

