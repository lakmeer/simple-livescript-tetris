
# Require

{ id, log } = require \std



class Blitter
  (x, y) ->
    @canvas = document.create-element \canvas
    @canvas.width = x
    @canvas.height = y
    @ctx = @canvas.get-context \2d


#
# Tetris Renderer
#
# Able to render various part of the game, including game states and menus.
#

export class Renderer

  @blitter =
    game-frame    : new Blitter 200, 200
    menu-frame    : new Blitter 200, 200
    block-preview : new Blitter 200, 200
    arena         : new Blitter 200, 200
    start-menu    : new Blitter 200, 200
    pause-menu    : new Blitter 200, 200

  clear: (ctx) ->

  render-start-menu: ->

  render-game: ({ arena }, ctx) ->
    log &

