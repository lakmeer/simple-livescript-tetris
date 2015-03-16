
# Require

{ id, log } = require \std


# Templates

template =

  cell: ->
    if it then "▒▒" else "  "

  score: ->
    JSON.stringify this, null, 2

  brick: ->
    @shape.map (.map template.cell .join ' ') .join "\n        "

  keys: ->
    if @length
      for key-summary in this
        key-summary.key + '-' + key-summary.action + "|"
    else
      "(no change)"

  normal: -> """
    score - #{template.score.apply @score}
    lines - #{@lines}

     meta - #{@metagame-state}
     time - #{@elapsed-time}
    frame - #{@elapsed-frames}
     keys - #{template.keys.apply @input-state}
     drop - #{if @force-down-mode then \soft else \auto}
  """


#
# Debug Output
#
# Shows visualisation of gamestate in some useful way.
# This class conflates it's view layer but meh, it's debug only.
#

export class DebugOutput

  ->
    @dbo = document.create-element \pre
    document.body.append-child @dbo

  render: (state) ->
    switch state.metagame-state
    | \game         => @dbo.innerText = template.normal.apply state
    | \start-menu   => @dbo.innerText = "Start menu"
    | \remove-lines => @dbo.innerText = template.normal.apply state
    | otherwise     => @dbo.innerText = "Unknown metagame state: " + state.metagame-state

