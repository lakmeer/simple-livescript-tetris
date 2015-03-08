
# Require

{ id, log } = require \std

{ Blitter } = require \../blitter


# Reference Constants

tile-colors = <[ black #e00 #f70 #ee0 #0f4 #2ed #35f #b0b ]>


#
# Arena View Class
#

export class ArenaView extends Blitter

  ->
    super ...

  draw-cells: (cells, size) ->
    for row, y in cells
      for tile, x in row
        if tile
          @ctx.fill-style = tile-colors[ tile ]
          @ctx.fill-rect 1 + x * size, 1 + y * size, size - 1, size - 1

  draw-grid: (w, h, size) ->
    @ctx.stroke-style = \#333
    @ctx.begin-path!

    for x to w
      @ctx.move-to x * size + 0.5, 0
      @ctx.line-to x * size + 0.5, h * size + 0.5

    for y to h
      @ctx.move-to 0, y * size + 0.5
      @ctx.line-to w * size + 0.5, y * size + 0.5

    @ctx.stroke!

  render: ({ arena: { cells, width, height } }, { z }) ->
    @clear!
    @draw-grid width, height, z
    @draw-cells cells, z
    return this
