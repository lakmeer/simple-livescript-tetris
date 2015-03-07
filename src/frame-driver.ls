
# Require

{ id, log, raf } = require \std


#
# Frame Driver
#
# Small engine that creates a frame loop
#

export class FrameDriver
  (@on-frame) ->
    log "FrameDriver::new - new FrameDriver"
    @state =
      time: 0
      frame: 0
      running: yes

  frame: ~>
    now = Date.now!
    Δt = @state.time - now

    @state.time = now
    @state.frame = @state.frame + 1

    @on-frame Δt, @state.time, @state.frame

    if @state.running
      raf @frame

  start: ->
    log "FrameDriver::Start - starting"
    @state.time = Date.now!
    @state.running = yes
    raf @frame

  stop: ->
    log "FrameDriver::Stop - stopping"
    @state.running = no

