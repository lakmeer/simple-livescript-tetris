
# Require

{ id, log } = require \std


# Helpers

el = document~create-element


#
# Dom Renderer
#

export class DomRenderer

  (@opts) ->
    @dom =
      main : el \div


  render: (game-state) ->


  append-to: (host) ->
    host.append-child @dom.main


