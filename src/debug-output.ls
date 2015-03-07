
# Templates

template =
  keys: ->
    if @length
      for key-summary in this
        key-summary.key + '-' + key-summary.action + "|"
    else
      "(no change)"

  normal: -> """
     meta - #{@metagame-state}
     next - #{@next-brick}
     time - #{@elapsed-time}
    frame - #{@elapsed-frames}
    brick - #{@current-brick}
    score - #{@score}
     keys - #{template.keys.apply @input-state}
  """


#
# Debug Output
#
# Shows visualisation of gamestate in some useful way
#

export class DebugOutput
  render: (state, output) ->
    output.innerText = template.normal.apply state

