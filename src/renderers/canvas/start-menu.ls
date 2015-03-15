
# Require

{ id, log, floor } = require \std

{ Blitter }     = require \./blitter
{ TextBlitter } = require \./text-blitter


#
# Start Menu View
#
# Draws the various options and the selection state of them
#

export class StartMenuView extends Blitter
  ->
    super ...
    @text  = new TextBlitter {}, @w*2/3, @h/20
    @title = new TextBlitter {}, @w*2/3, @h/10

  render: ({ menu-data, current-index }) ->
    @clear!
    for entry, i in menu-data
      @text.render entry.text
      if i is current-index
        @text.render-frame!
      @text.blit-to this, (floor @w/6), (floor @h/2 + @h/15 * i)

      @title.render \TETRIS
      @title.blit-to this, @w/6, @h/6

