
# Require

{ id, log } = require \std


# Templates

template =

  cell: ->
    if it then "▒▒" else "  "

  brick: ->
    @shape.map (.map template.cell .join ' ') .join "\n        "

  keys: ->
    if @length
      for key-summary in this
        key-summary.key + '-' + key-summary.action + "|"
    else
      "(no change)"

  normal: -> """
     NEXT :
   #{template.brick.apply @brick.next}

    score - #{@score}
    lines - #{@lines}

     meta - #{@metagame-state}
     time - #{@elapsed-time}
    frame - #{@elapsed-frames}
     keys - #{template.keys.apply @input-state}
     drop - #{if @force-down-mode then \force else \auto}


  """
    #brick - #{template.brick.apply @brick.current}


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
    @dbo.innerText = template.normal.apply state


