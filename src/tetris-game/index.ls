
# Require

{ id, log } = require \std
{ enumerate } = require \std

{ GameCore } = require \./game-core
{ Renderer } = require \./renderer


#
# Tetris Game
#
# Presents the unified interface to the Tetris game
#

export class TetrisGame

  ->
    log "TetrisGame::new - new TetrisGame"
    @renderer = new Renderer

  run-frame: (game-state) ->
    game-state

  render: (game-state, output) ->
    switch game-state.metagame-state
    | \no-game => @renderer.render-start-menu game-state
    | \pause   => @renderer.render-pause-menu game-state
    | \game    => @renderer.render-game       game-state
    | \win     => @renderer.render-win-screen game-state
    | otherwise => void

