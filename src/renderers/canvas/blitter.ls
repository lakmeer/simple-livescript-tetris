
# Require

{ id, log } = require \std


#
# Blitter
#
# A graphics context which can be composed with others to create images
#

export class Blitter
  (@opts, @w, @h) ->
    @canvas = document.create-element \canvas
    @width  = @canvas.width  = @w
    @height = @canvas.height = @h
    @ctx    = @canvas.get-context \2d

  show-debug: ->
    @canvas.style.background = \#f0f
    @canvas.style.margin = \10px
    @canvas.style.border = "2px solid #0f0"
    document.body.append-child @canvas

  blit-to: (dest, x = 0, y = 0, alpha = 1) ->
    dest.ctx.global-alpha = alpha
    dest.ctx.draw-image @canvas, x, y
    dest.ctx.global-alpha = 1

  blit-to-canvas: (dest-canvas) ->
    ctx = dest-canvas.get-context \2d
    ctx.clear-rect 0, 0 dest-canvas.width, dest-canvas.height
    ctx.draw-image @canvas, 0, 0, dest-canvas.width, dest-canvas.height

  clear: (color) ->
    if color?
      @ctx.fill-color = color
      @ctx.fill-rect 0, 0, @width, @height
    else
      @ctx.clear-rect 0, 0, @width, @height

