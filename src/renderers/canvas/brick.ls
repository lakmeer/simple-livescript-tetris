
# Require

{ id, log } = require \std

{ tile-colors } = require \./palette
{ Blitter }     = require \./blitter


#
# Brick View
#

export class BrickView extends Blitter
  -> super ...

  render: (brick) ->
    @clear!

    for row, y in brick.shape
      for cell, x in row
        if cell
          @ctx.fill-style = tile-colors[ cell ]
          @ctx.fill-rect x * @opts.z + 1, y * @opts.z + 1, @opts.z - 1, @opts.z - 1
    return this

