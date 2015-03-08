
# Require

{ id, log } = require \std

{ ArenaView } = require \./views/arena
{ BrickView } = require \./views/brick


#
# Tetris Renderer
#
# Able to render various part of the game, including game states and menus.
#

export class Renderer

  (tile-size = 20) ->
    @arena = new ArenaView 10 * tile-size + 1, 18 * tile-size + 1
    @brick = new BrickView 4 * tile-size, 4 * tile-size

  render-start-menu: ->

  render-game: ({ brick, arena }:gs, { z }:opts, output-context) ->
    output-context.clear-rect 0, 0, arena.width * z, arena.height * z
    @arena.render gs, opts .blit-to output-context, 0, 0, 0.7
    @brick.render gs, opts .blit-to output-context, brick.current.pos.0 * z, brick.current.pos.1 * z

