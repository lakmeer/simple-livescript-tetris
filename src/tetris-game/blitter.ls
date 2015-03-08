
# Require

{ id, log } = require \std


#
# Blitter
#
# A graphics context which can be composed with others to create images
#

export class Blitter
  (@opts, x, y) ->
    @canvas = document.create-element \canvas
    @width  = @canvas.width  = x
    @height = @canvas.height = y
    @ctx    = @canvas.get-context \2d

  blit-to: (dest, x = 0, y = 0, alpha = 1) ->
    dest.ctx.global-alpha = alpha
    dest.ctx.draw-image @canvas, x, y
    dest.ctx.global-alpha = 1

  blit-to-canvas: (dest-canvas) ->
    ctx = dest-canvas.get-context \2d
    ctx.clear-rect 0, 0 dest-canvas.width, dest-canvas.height
    ctx.draw-image @canvas, 0, 0, dest-canvas.width, dest-canvas.height

  clear: ->
    @ctx.clear-rect 0, 0, @width, @height

