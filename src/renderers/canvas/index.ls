
# Require

{ id, log } = require \std

{ Blitter }       = require \./blitter
{ Palette }       = require \./palette
{ ArenaView }     = require \./arena
{ BrickView }     = require \./brick
{ NextBrickView } = require \./next-brick


#
# Tetris Renderer
#
# Able to render various part of the game, including game states and menus.
#

export class CanvasRenderer extends Blitter

  (@opts) ->
    @z = z = @opts.z
    super @opts, 17 * z, 20 * z

    @arena = new ArenaView     @opts, 10 * z + 2, 18 * z + 2
    @brick = new BrickView     @opts,  4 * z, 4 * z
    @next  = new NextBrickView @opts,  4 * z, 4 * z

    #@frame = new FrameView 25 * z, 20 * z

  render-start-menu: ->
    log \render-start-menu

  render-blank: ->
    @clear!

  render-game: (gs) ->
    @brick.render gs.brick.current, @opts
    @next.render gs.brick.next, @opts
    @arena.render gs.arena, @opts
    @collapse-all gs

  collapse-all: (gs) ->
    pos = gs.brick.current.pos

    @ctx.fill-style = Palette.neutral.3
    @ctx.fill-rect 0, 0, @width, @height

    @brick.blit-to @arena, pos.0 * @z, pos.1 * @z
    @arena.blit-to this, @opts.z, @opts.z
    @next.blit-to  this, (2 + gs.arena.width) * @z, 1 * @z

  render: ({ metagame-state }:game-state) ->
    switch metagame-state
    | \no-game => @render-start-menu game-state
    | \pause   => @render-pause-menu game-state
    | \game    => @render-game       game-state
    | \win     => @render-win-screen game-state
    | otherwise => @render-blank!
    return this

