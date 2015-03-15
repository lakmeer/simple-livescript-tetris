
# Require

{ id, log } = require \std

{ Blitter } = require \./blitter

#
# Text Blitter
#
# Like a Blitter but with explicit support for text rendering
#

export class TextBlitter extends Blitter

  default-font-options =
    font: "14px monospace"
    text-align: \center

  (@opts, x, y) ->
    super ...
    @font = size: y, family: \monospace
    @set-font @font
    @set-alignment \center
    @ctx.text-baseline = \middle

  set-font: (settings) ->
    @font <<< settings
    @ctx.font = "#{@font.size}px #{@font.family}"

  set-alignment: (align-string) ->
    @ctx.text-align = align-string

  render: (text, color = \black) ->
    @clear!
    @ctx.fill-style = color
    @ctx.fill-text text, @w/2, @font.size/2, @w

  render-frame: ->
    @ctx.stroke-rect 0.5, 0.5, @w - 1, @h - 1

