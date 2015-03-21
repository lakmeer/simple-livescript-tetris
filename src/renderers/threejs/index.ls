
# Require

{ id, log, sin, cos, pi, tau, max, rand, floor, map } = require \std

THREE = require \three-js-vr-extensions # puts THREE in global scope

{ Palette } = require \./palette
{ SceneManager } = require \./scene-manager
{ Table, Frame, Brick, Lighting, GuideLines, ArenaCells, BrickPreview } = require \./components


#
# Three.js Renderer
#
# Render game with real 3d blocks and eventually add VR support
#

export class ThreeJsRenderer
  (@opts, gs) ->
    log "New 3D Renderer:", @opts

    # Setup three.js WebGL renderer with MozVR extensions
    @scene-man = new SceneManager @opts
    @output-canvas = @scene-man.dom-element

    # Build scene
    @parts =
      table       : new Table        @opts, gs
      frame       : new Frame        @opts, gs
      lighting    : new Lighting     @opts, gs
      guide-lines : new GuideLines   @opts, gs
      arena-cells : new ArenaCells   @opts, gs
      this-brick  : new Brick        @opts, gs
      next-brick  : new BrickPreview @opts, gs

    # Position various parts correctly
    @parts.lighting.position <<< y: gs.arena.height / 2, z: 7


    # Add everything to scene
    for name, part of @parts
      @scene-man.add part

    @scene-man.camera.position.set 0, 10, 20

    # Deploy helpers
    @show-scene-helpers!

  show-scene-helpers: ->
    grid = new THREE.GridHelper 30, 1
    axis = new THREE.AxisHelper 5
    light = new THREE.PointLightHelper @parts.lighting.light, 1
    @scene-man.add grid, light

    @parts.arena-cells.show-bounds @scene-man.root
    @parts.this-brick.show-bounds @scene-man.root

    @scene-man.camera.position <<< x: 10, y: 20, z: 10
    @scene-man.camera.look-at new THREE.Vector3 0, 10, 0

  position-debug-camera: (gs) ->
    r = 15
    phase = pi/4 * sin gs.elapsed-time / 10000
    @scene-man.camera.position.x = r * sin phase
    @scene-man.camera.position.z = r * cos phase
    @scene-man.camera.look-at new THREE.Vector3 0, 10, 0

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
    jolt = @calculate-jolt gs
    @parts.arena-cells.show-zap-effect jolt, gs
    @scene-man.root.position.y = jolt
    #@position-debug-camera gs

  render-arena: ({ arena, brick }:gs) ->
    @parts.arena-cells.update-cells arena.cells

    # Update falling brick
    @parts.this-brick.display-shape brick.current
    @parts.this-brick.update-pos brick.current.pos

    # Update preview brick
    @parts.next-brick.display-shape brick.next
    @parts.next-brick.update-wiggle gs

    # Jitter and jolt
    @scene-man.root.position.y = @calculate-jolt gs

    # Debug camera-motion
    @position-debug-camera gs

  render: (gs) ->
    @scene-man.update!
    switch gs.metagame-state
    | \game => @render-arena gs
    | \start-menu  => log \start-menu
    | \no-game     => log \no-game
    | \remove-lines => @render-line-zap gs
    | otherwise => log "ThreeJsRenderer::render - Unknown metagamestate:", gs.metagame-state
    @scene-man.render!

  append-to: (host) ->
    host.append-child @output-canvas

