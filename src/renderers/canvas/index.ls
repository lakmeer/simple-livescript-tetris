
# Require

{ id, log } = require \std

{ Blitter }       = require \./blitter
{ Palette }       = require \./palette
{ ArenaView }     = require \./arena
{ BrickView }     = require \./brick
{ NextBrickView } = require \./next-brick
{ StartMenuView } = require \./start-menu


#
# Tetris Renderer
#
# Able to render various part of the game, including game states and menus.
#

export class CanvasRenderer extends Blitter

  (@opts) ->
    @z = z = @opts.z
    super @opts, 17 * z, 20 * z

    # Blitters
    @arena = new ArenaView      @opts, 10 * z + 2, 18 * z + 2
    @brick = new BrickView      @opts,  4 * z, 4 * z
    @next  = new NextBrickView  @opts,  4 * z, 4 * z
    @start = new StartMenuView  @opts, 17 * z, 20 * z

    # Final Output
    @output-canvas = document.create-element \canvas
    @output-canvas.width  = 17 * @opts.z
    @output-canvas.height = 20 * @opts.z

    @state = {}

  render-start-menu: ({ start-menu-state }:gs) ->
    @clear!
    if @state.last-start-menu-index isnt gs.start-menu-state.current-index
      @start.render start-menu-state
    @start.blit-to this, 0, 0
    @state.last-start-menu-index = gs.start-menu-state.current-index

  render-blank: ->
    @clear!

  render-game: (gs) ->
    @brick.render gs.brick.current, @opts
    @next.render gs.brick.next, @opts
    @arena.render gs, @opts
    @collapse-all gs

  collapse-all: (gs) ->
    pos = gs.brick.current.pos
    @ctx.fill-style = Palette.neutral.3
    @ctx.fill-rect 0, 0, @width, @height
    @brick.blit-to @arena, pos.0 * @z, pos.1 * @z
    @arena.blit-to this, @opts.z, @opts.z
    if gs.metagame-state is \removal-animation
      @flashing.blit-to this, @opts.z, @opts.z
    @next.blit-to  this, (2 + gs.arena.width) * @z, 1 * @z

  render: ({ metagame-state }:game-state) ->
    switch metagame-state
    | \start-menu   => @render-start-menu game-state
    | \pause        => @render-pause-menu game-state
    | \game         => @render-game       game-state
    | \win          => @render-win-screen game-state
    | \remove-lines => @render-game game-state
    | otherwise => @render-blank!

    @blit-to-canvas @output-canvas

  append-to: (host) ->
    host.append-child @output-canvas

