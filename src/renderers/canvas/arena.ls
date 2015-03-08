
# Require

{ id, log } = require \std

{ Palette } = require \./palette
{ Blitter } = require \./blitter


# Reference Constants


#
# Arena View Class
#

export class ArenaView extends Blitter

  ->
    super ...
    @grid  = new Blitter ...
    @cells = new Blitter ...

  draw-cells: (cells, size) ->
    @cells.clear!
    for row, y in cells
      for tile, x in row
        if tile
          @cells.ctx.fill-style = Palette.tile-colors[ tile ]
          @cells.ctx.fill-rect 1 + x * size, 1 + y * size, size - 1, size - 1

  draw-grid: (w, h, size) ->
    @grid.clear!
    @grid.ctx.stroke-style = \black
    @grid.ctx.begin-path!

    for x to w
      @grid.ctx.move-to x * size + 0.5, 0
      @grid.ctx.line-to x * size + 0.5, h * size + 0.5

    for y to h
      @grid.ctx.move-to 0, y * size + 0.5
      @grid.ctx.line-to w * size + 0.5, y * size + 0.5

    @grid.ctx.stroke!

  render: ({ cells, width, height }, { z }) ->
    @clear!
    @ctx.fill-style = Palette.neutral.3
    @ctx.fill-rect 0, 0, width * z, height * z
    @ctx.stroke-style = Palette.neutral.2
    @ctx.stroke-rect 0.5, 0.5, width * z + 1, height * z + 1

    #@draw-grid width, height, z
    @draw-cells cells, z

    @grid.blit-to this
    @cells.blit-to this, 0, 0, 0.9

