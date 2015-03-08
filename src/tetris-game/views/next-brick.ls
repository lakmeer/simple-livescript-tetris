
{ id, log } = require \std

{ BrickView } = require \./brick
{ Blitter } = require \../blitter
{ Palette } = require \./palette.ls


#
# Next Brick View
#
# Like a brick view but ith it's own frame
#

export class NextBrickView extends Blitter
  ->
    super ...
    @brick = new BrickView @opts, @width, @height

  render-bg: ->
    @ctx.fill-style = Palette.neutral.3
    @ctx.fill-rect 0, 0, @width, @height
    @ctx.stroke-style = Palette.neutral.2
    @ctx.stroke-rect 0.5, 0.5, @width - 1, @height - 1

  render: (brick) ->
    @clear!
    @render-bg!
    @brick.render brick
    @brick.blit-to this

