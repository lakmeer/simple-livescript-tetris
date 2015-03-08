
# Templates

template =

  cell: ->
    if it then "▒▒" else "  "

  brick: ->
    this.shape.map (.map template.cell .join ' ') .join "\n        "

  keys: ->
    if @length
      for key-summary in this
        key-summary.key + '-' + key-summary.action + "|"
    else
      "(no change)"

  normal: -> """
     meta - #{@metagame-state}
     time - #{@elapsed-time}
    frame - #{@elapsed-frames}
    score - #{@score}
     keys - #{template.keys.apply @input-state}
     drop - #{if @force-down-mode then \force else \auto}

    brick - #{template.brick.apply @current-brick}

     next - #{template.brick.apply @next-brick}
  """


#
# Debug Output
#
# Shows visualisation of gamestate in some useful way
#

export class DebugOutput
  render: (state, output) ->
    output.innerText = template.normal.apply state

