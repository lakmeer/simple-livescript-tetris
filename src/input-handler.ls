
# Require

{ id, log } = require \std


# Reference Constants

KEY =
  RETURN : 13
  ESCAPE : 27
  SPACE  : 32
  LEFT   : 37
  UP     : 38
  RIGHT  : 39
  DOWN   : 40

ACTION_NAME =
  "#{KEY.RETURN}" : \confirm
  "#{KEY.ESCAPE}" : \back
  "#{KEY.SPACE}"  : \action
  "#{KEY.LEFT}"   : \left
  "#{KEY.UP}"     : \up
  "#{KEY.RIGHT}"  : \right
  "#{KEY.DOWN}"   : \down


# Pure Helpers

event-summary = (event-saver, key-direction) ->
  ({ which }) ->
    if ACTION_NAME[which]
      event-saver key: that, action: key-direction


#
# Input Handler
#
# Monitors keyboard input between frames and compiles a report about what has
# changed since last checked
#

export class InputHandler

  ->
    log "InputHandler::new - new InputHandler"
    @state = saved-events: []
    document.addEventListener \keydown, event-summary @save-event, \down
    document.addEventListener \keyup,   event-summary @save-event, \up

  save-event: (event-summary) ~>
    @state.saved-events.push event-summary

  changes-since-last-frame: ->
    changes = @state.saved-events
    @state.saved-events = []
    return changes

  @debug-mode = ->
    document.addEventListener \keydown, ({ which }) ->
      log "InputHandler::debugMode -", which, (ACTION_NAME[which] or '[unbound]')

  @on = (code, λ) ->
    document.addEventListener \keydown, ({ which }) ->
      if which is code
        λ!

