
# Simple Livescript Tetris

An exercise I set for myself one weekend. Simple, but good-feeling tetris game
in Livescript on Canvas.

## Try It

GH Pages deployment soon

## Install

- `git clone https://github.com/lakmeer/simple-livescript-tetris.git`
- `npm install`
- `gulp`
- visit `localhost:8080`

### Controls

- Arrows: obviously
- Space: hard-drop
- X: rotate clockwise
- Z: counter-clockwise
- Enter: Confirm/Proceed
- Escape: Pause/Cancel

## Todo

- Full-clear bonus
- Alternative renderers. Part of this exercise is to disconnect the renderer
  and game logic as much as possible - it should be possbile to totally swap
  out the whole renderer. Maybe a DOM version that supports CSS styling?
- Localstorage high scores
- Localstorage game settings like speed or difficulty
- Braid-style time-travelly undos?
- B-type gameplay modes
- Sound? Maybe
- Split main game file into modules which have their metagamestate equivalent
  of the `advance-game` function. Then dispatch to these modules from the main
  `TetrisGame.update` function
- Should each module also get it's own chunk of the gamestate? They should
  probably be allowed to each initialise that chunk as well
- Three JS renderer with VR support
- Reinstate key repeat, but just for left and right. Do it as part of the
  game engine, not the input handler. Input handler should probably move away
  from event-based system

