
# Require

{ id, log, sin, cos, pi, tau, max, lerp, rand, floor, map } = require \std

THREE = require \three-js-vr-extensions # puts THREE in global scope

{ Palette } = require \./palette
{ SceneManager } = require \./scene-manager
{ Title, Table, Frame, Brick, Lighting, GuideLines, ArenaCells, BrickPreview } = require \./components


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
      title       : new Title        @opts, gs
      table       : new Table        @opts, gs
      frame       : new Frame        @opts, gs
      lighting    : new Lighting     @opts, gs
      guide-lines : new GuideLines   @opts, gs
      arena-cells : new ArenaCells   @opts, gs
      this-brick  : new Brick        @opts, gs
      next-brick  : new BrickPreview @opts, gs

    # Position various parts correctly
    @parts.lighting.position <<< y: height / 2, z: 7
    @parts.next-brick.position <<< y: height + 5

    # Add everything to scene
    for name, part of @parts
      @scene-man.add part

    @r = 20
    @y = 10

    # Debug
    @scene-man.camera.position.set 0, @y, @r
    @show-scene-helpers!
    document.add-event-listener \mousemove, ({ pageX, pageY }) ~>
      @position-debug-camera(
        lerp -1, 1, pageX / window.inner-width
        lerp -1, 1, pageY / window.inner-height)


    # Particle effect

    @pcount = 1800
    @particles = new THREE.Geometry!
    @pmat = new THREE.PointCloudMaterial do
      color: 0xffbb99
      size: 20

    for p from 0 to @pcount
      x = rand 250, 750
      y = rand 250, 750
      z = rand 250, 750
      v = new THREE.Vector3 x, y, z
      @particles.vertices.push v

    @psystem = new THREE.PointCloud @particle, @pmat
    @psystem.position.y = height/2
    @scene-man.add @psystem

  show-scene-helpers: ->
    grid  = new THREE.GridHelper 10, 1
    axis  = new THREE.AxisHelper 5
    light = new THREE.PointLightHelper @parts.lighting.light, 1
    @scene-man.add grid, light

    #@parts.arena-cells.show-bounds @scene-man.root
    #@parts.this-brick.show-bounds @scene-man.root
    #@parts.title.show-bounds @scene-man.root

    #@scene-man.camera.position <<< x: 10, y: 15, z: 10
    @scene-man.camera.look-at new THREE.Vector3 0, @y, 0

  position-debug-camera: (phase, vphase = 0) ->
    @scene-man.camera.position.x = @r * sin phase
    @scene-man.camera.position.y = 10 + @r * -sin vphase
    @scene-man.camera.position.z = @r * cos phase
    @scene-man.camera.look-at new THREE.Vector3 0, 10, 0

  auto-rotate-debug-camera: (gs) ->
    return
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
    #@position-debug-camera gs

  render-arena: ({ arena, brick }:gs) ->
    @parts.title.visible = false
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

  render-start-menu: (gs) ->
    @parts.title.visible = true
    @auto-rotate-debug-camera gs

  render: (gs) ->
    @scene-man.update!
    switch gs.metagame-state
    | \game         => @render-arena gs
    | \no-game      => log \no-game
    | \start-menu   => @render-start-menu gs
    | \remove-lines => @render-line-zap gs
    | otherwise     => log "ThreeJsRenderer::render - Unknown metagamestate:", gs.metagame-state
    @scene-man.render!

  append-to: (host) ->
    host.append-child @output-canvas

