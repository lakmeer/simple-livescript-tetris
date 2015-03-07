

#
# Blitter
#
# A graphics context which can be composed with others to create images
#

export class Blitter
  (x, y) ->
    @canvas = document.create-element \canvas
    @width  = @canvas.width  = x
    @height = @canvas.height = y
    @ctx    = @canvas.get-context \2d

  blit-to: (dest, x = 0, y = 0, alpha = 1) ->
    dest.global-alpha = alpha
    dest.draw-image @canvas, x, y

  clear: ->
    @ctx.clear-rect 0, 0, @width, @height


