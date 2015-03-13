
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
- Space: rotate (clockwise)
- X: rotate clockwise
- Z: counter-clockwise
- Enter: Confirm/Proceed
- Escape: Pause/Cancel

## Todo

- Scoring. Currently counts lines but a system like on the Gameboy is planned.
- Alternative renderers. Part of this exercise is to disconnect the renderer
  and game logic as much as possible - it should be possbile to totally swap
  out the whole renderer. Maybe a DOM version that supports CSS styling?
- Localstorage high scores
- Proper menus
- B-type gameplay modes
- Sound? Maybe
- More juicy VFX

