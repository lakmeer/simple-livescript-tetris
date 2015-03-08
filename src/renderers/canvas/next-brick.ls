
{ id, log } = require \std

{ BrickView } = require \./brick
{ Blitter }   = require \./blitter
{ Palette }   = require \./palette


#
# Next Brick View
#
# Like a brick view but ith it's own frame
#

export class NextBrickView extends Blitter
  ->
    super ...
    @brick = new BrickView @opts, @width, @height

  pretty-offset: (type) ->
    switch type
    | \square => [0 0]
    | \zig    => [0.5 0]
    | \zag    => [0.5 0]
    | \left   => [0.5 0]
    | \right  => [0.5 0]
    | \tee    => [0.5 0]
    | \tetris => [0 -0.5]

  render-bg: ->
    @ctx.fill-style = Palette.neutral.3
    @ctx.fill-rect 0, 0, @width, @height
    @ctx.stroke-style = Palette.neutral.2
    @ctx.stroke-rect 0.5, 0.5, @width - 1, @height - 1

  render: (brick) ->
    @clear!
    @render-bg!
    @brick.render brick

    [ x, y ] = @pretty-offset brick.type

    @brick.blit-to this, x * @opts.z, y * @opts.z

