
# Require

{ id, log, rand, floor } = require \std

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

  draw-row-removal: (width, size, y, mode = 1) ->
    for x from 0 to width
      @cells.ctx.fill-style = if mode then Palette.neutral.0 else Palette.neutral.3
      @cells.ctx.fill-rect 1 + x * size, 1 + y * size, size - 1, size - 1

  render: ({{ cells, width, height }:arena, rows-to-remove, timers }, { z }) ->
    @clear!

    zz = rows-to-remove.length
    p = 33 + floor (255 - 33)/4 * zz * (1 - timers.removal-animation.progress)

    if rows-to-remove.length > 3
      @ctx.fill-style = "rgb(#p,#p,#p)"
    else
      @ctx.fill-style = Palette.neutral.3

    @ctx.fill-rect 0, 0, width * z, height * z
    @ctx.stroke-style = Palette.neutral.2
    @ctx.stroke-rect 0.5, 0.5, width * z + 1, height * z + 1

    #@draw-grid width, height, z
    @draw-cells cells, z

    for row-ix in rows-to-remove
      if (floor timers.removal-animation.current-time) % 2
        @draw-row-removal width, z, row-ix, 1
      else
        @draw-row-removal width, z, row-ix, 0

    blit-jitter = [ (rand -zz, zz), (rand -zz, zz) ]

    @grid.blit-to this, blit-jitter.0, blit-jitter.1
    @cells.blit-to this, blit-jitter.0, blit-jitter.1, 0.9

