
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


  render-game: ({ current-brick: brick, tile-size: z }:game-state, output-context) ->
    output-context.clear-rect 0, 0, game-state.tile-width * z, game-state.tile-height * z
    @arena.render game-state .blit-to output-context, 0, 0, 0.7
    @brick.render game-state .blit-to output-context, brick.pos.0 * z, brick.pos.1 * z

