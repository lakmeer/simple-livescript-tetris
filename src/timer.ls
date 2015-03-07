
# Require

{ id, log } = require \std


# Meta-state

all-timers = []


#
# Timer
#
# Tracks wehther a given amount of time has passed since first triggered
#

export class Timer

  (@target-time, begin = no) ->
    @current-time = 0
    @state = if begin then \active else \expired
    @active = begin
    @expired = not begin
    all-timers.push this

  set-expired: ->
    @state = \expired
    @active = no
    @expired = yes

  set-active: ->
    @state = \active
    @active = yes
    @expired = no

  update: (Δt) ->
    if @active
      @current-time += Δt

      if @current-time >= @target-time
        @set-expired!

  reset: (time = @target-time) ->
    @current-time = 0
    @target-time = time
    @set-active!

  destroy: ->
    all-timers.aplice (all-timers.index-of this), 1

  @update-all = (Δt) ->
    all-timers.map (.update Δt)

