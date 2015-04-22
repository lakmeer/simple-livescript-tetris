
# Require

{ id, log, sin, cos, pi, tau, max, lerp, rand, floor, map } = require \std

THREE = require \three-js-vr-extensions # puts THREE in global scope

{ Palette } = require \./palette
{ SceneManager } = require \./scene-manager
{ Title, Table, Frame, Brick, Lighting } = require \./components
{ GuideLines, ArenaCells, BrickPreview } = require \./components
{ ParticleEffect, StartMenu } = require \./components


#
# Three.js Renderer
#
# Render game with real 3d blocks and eventually add VR support
#

export class ThreeJsRenderer
  (@opts, {{ width, height }:arena }: gs) ->
    log "New 3D Renderer:", @opts

    # Setup three.js WebGL renderer with MozVR extensions
    @scene-man = new SceneManager @opts
    @output-canvas = @scene-man.dom-element

    # Build scene
    @parts =
      title       : new Title          @opts, gs
      table       : new Table          @opts, gs
      frame       : new Frame          @opts, gs
      lighting    : new Lighting       @opts, gs
      guide-lines : new GuideLines     @opts, gs
      arena-cells : new ArenaCells     @opts, gs
      this-brick  : new Brick          @opts, gs
      next-brick  : new BrickPreview   @opts, gs
      particles   : new ParticleEffect @opts, gs
      start-menu  : new StartMenu @opts, gs

    # Position various parts correctly
    @parts.lighting.position <<< y: height / 2, z: 7
    @parts.next-brick.position <<< y: height + 5
    @parts.table.table.receive-shadow = yes
    @parts.this-brick.brick.cast-shadow = yes

    # Add everything to scene
    for name, part of @parts
      @scene-man.add part

    @r = 15
    @y = 3

    @scene-man.root.position.set 0, -@y, -@r

    log @scene-man.root, @scene-man.root.position

    # Debug
    #@scene-man.camera.position.set 0, @y, @r
    @scene-man.camera.look-at new THREE.Vector3 0, @r, @y
    @show-scene-helpers!
    #@position-debug-camera 1, 1

    #@scene-man.camera.position.set 0, 5, 10
    @scene-man.controls.zero-sensor!

    document.add-event-listener \mousemove, ({ pageX, pageY }) ~>
      return
      @position-debug-camera(
        lerp -1, 1, pageX / window.inner-width
        lerp -1, 1, pageY / window.inner-height)


  show-scene-helpers: ->
    grid  = new THREE.GridHelper 10, 1
    axis  = new THREE.AxisHelper 5
    light = new THREE.PointLightHelper @parts.lighting.light, 1
    spot  = new THREE.SpotLightHelper @parts.lighting.spotlight, 1
    #@scene-man.add grid, light

    #@parts.arena-cells.show-bounds @scene-man.root
    #@parts.this-brick.show-bounds @scene-man.root
    #@parts.title.show-bounds @scene-man.root

    #@scene-man.camera.position <<< x: 10, y: 15, z: 10
    @scene-man.camera.look-at new THREE.Vector3 0, @y, 0

  position-debug-camera: (phase, vphase = 0) ->
    @scene-man.root.position.y = -@y
    return
    @scene-man.camera.position.x = @r * sin phase
    @scene-man.camera.position.y = @y + @r * -sin vphase
    @scene-man.camera.position.z = @r * cos phase
    @scene-man.camera.look-at new THREE.Vector3 0, 10, 0

  auto-rotate-debug-camera: (gs) ->
    #@scene-man.camera.position.set 0, @y, @r
    #return
    @position-debug-camera pi/10 * sin gs.elapsed-time / 1000

  calculate-jolt: ({ rows-to-remove, timers }:gs) ->
    p =
      if timers.removal-animation.active
        (1 - timers.removal-animation.progress)
      else if timers.hard-drop-effect.progress
        max (1 - timers.hard-drop-effect.progress)
      else
        0

    zz = rows-to-remove.length
    jolt = -1 * p * (1 + zz) * gs.options.hard-drop-jolt-amount

  render-line-zap: ({ arena, rows-to-remove, timers }:gs) ->
    jolt   = @calculate-jolt gs
    zz     = rows-to-remove.length / 20
    jitter = [ (rand -zz, zz), (rand -zz, zz) ]

    @parts.arena-cells.show-zap-effect jolt, gs
    @scene-man.root.position.x = jitter.0
    @scene-man.root.position.y = jitter.1 + jolt
    @auto-rotate-debug-camera gs

    # if rows were only just begun to be removed this frame, spawn particles,
    # but don't spawn them other times (just update them)
    if gs.flags.rows-removed-this-frame
      @parts.particles.reset-particles!
      for row-ix, i in rows-to-remove
        p = switch rows-to-remove.length
        | 1 => 100
        | 2 => 300
        | 3 => 600
        | 4 => 1200
        @parts.particles.revive p - i * p/rows-to-remove.length, arena.height - row-ix - 0.5

    @parts.particles.update timers.removal-animation.progress, gs.Δt


  render-arena: ({ arena, brick }:gs) ->

    # Switch appropriate scene parts on and off
    @parts.title.visible = false
    @parts.arena-cells.visible = true
    @parts.this-brick.visible = true
    @parts.next-brick.visible = true
    @parts.guide-lines.visible = true
    @parts.start-menu.visible = false

    # Render current arena state to blocks
    @parts.arena-cells.update-cells arena.cells

    # Update falling brick
    @parts.this-brick.display-shape brick.current
    @parts.this-brick.update-pos brick.current.pos

    # Show lines
    @parts.guide-lines.show-beam brick.current

    # Update preview brick
    @parts.next-brick.display-shape brick.next
    @parts.next-brick.update-wiggle gs, gs.elapsed-time

    # Jitter and jolt
    @scene-man.root.position.y = @calculate-jolt gs

    # Debug camera-motion
    @auto-rotate-debug-camera gs

    # Update any particles that happen to be alive
    @parts.particles.update gs.timers.removal-animation.progress, gs.Δt

  render-pause-menu: ({{ height }:arena, timers }:gs) ->

  render-start-menu: ({{ height }:arena, timers }:gs) ->
    @parts.title.visible = true
    @parts.arena-cells.visible = false
    @parts.guide-lines.visible = false
    @parts.this-brick.visible = false
    @parts.next-brick.visible = false
    @parts.start-menu.visible = true

    if timers.title-reveal-timer.active
      @parts.title.dance gs.elapsed-time
      @parts.title.reveal timers.title-reveal-timer.progress
    else
      @parts.title.dance gs.elapsed-time

    @auto-rotate-debug-camera gs

    @parts.start-menu.update-selection gs.start-menu-state, gs.elapsed-time


  render-fail-screen: ({{ height }:arena, timers }:gs) ->


  render: (gs) ->
    @scene-man.update!
    switch gs.metagame-state
    | \game         => @render-arena gs
    | \no-game      => log \no-game
    | \start-menu   => @render-start-menu gs
    | \pause-menu   => @render-pause-menu gs
    | \remove-lines => @render-line-zap gs
    | \failure      => @render-fail-screen gs
    | otherwise     => log "ThreeJsRenderer::render - Unknown metagamestate:", gs.metagame-state
    @parts.particles.update 1, gs.Δt
    @scene-man.render!

  append-to: (host) ->
    host.append-child @output-canvas

