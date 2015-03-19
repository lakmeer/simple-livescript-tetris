
# Require

{ id, log, sin, pi, tau, rand, floor } = require \std

{ Palette } = require \./palette

THREE = require \three-js-vr-extensions # puts THREE in global scope


#
# Three.js Renderer
#
# Render game with real 3d blocks and eventually add VR support
#

export class ThreeJsRenderer
  (@opts, gs) ->
    log "New 3D Renderer:", @opts

    # Setup three.js WebGL renderer
    @renderer = new THREE.WebGLRenderer antialias: true

    # Create a three.js scene
    aspect   = window.inner-width / window.inner-height
    @scene    = new THREE.Scene!
    @camera   = new THREE.PerspectiveCamera 75, aspect, 1, 10000
    @controls = new THREE.VRControls @camera

    # Apply VR stereo rendering to renderer
    @effect = new THREE.VREffect @renderer
    @effect.setSize window.innerWidth, window.innerHeight

    # Listen for double click event to enter full-screen VR mode
    go-fullscreen = ~>
      log \go-fullscreen?
      @effect.set-full-screen yes

    # Zero positional sensor on 'V'
    on-key = ({ key-code }:event) ~>
      event.prevent-default!
      if key-code is 86 then @controls.zero-sensor!

    # Handle window resizes
    on-resize = ~>
      @camera.aspect = window.innerWidth / window.innerHeight
      @camera.updateProjectionMatrix!
      @effect.setSize window.innerWidth, window.innerHeight

    # Bind listeners
    window.addEventListener \keydown, on-key, true
    window.addEventListener \resize, on-resize, false
    document.body.addEventListener \dblclick, go-fullscreen

    # Append the canvas element created by the renderer to document body
    @output-canvas = @renderer.dom-element

    # Pre-create geometry instead of creatinga nd destroying every frame
    @geom = {}
    @create-brick-cells!
    @create-arena-cells gs.arena
    @create-preview gs.arena.width, gs.arena.height

    # Add brick to arena's coordinate system
    @geom.arena.add @geom.brick

    # Create selection of materials so we can repurpose our bricks
    @mats = @create-materials-gallery!
    @zap-material = new THREE.MeshLambertMaterial color: \white

    # Add a light
    @light = new THREE.PointLight 0xffffff, 1, 0
    @light.position.set 0, 0, 0
    @scene.add @light

  create-demo-cube: ->
    geometry = new THREE.BoxGeometry 10, 10, 10
    material = new THREE.MeshNormalMaterial!

    cube = new THREE.Mesh geometry, material
    cube.position <<< z: -20

    @scene.add cube

    animate = ~>
      cube.rotation.y += 0.01
      @controls.update
      @effect.render @scene, @camera
      raf animate
    animate!

  create-materials-gallery: ->
    for color in Palette.tile-colors
      new THREE.MeshLambertMaterial color: color

  create-brick-cells: ->
    geometry = new THREE.BoxGeometry 0.9, 0.9, 0.9
    material = new THREE.MeshNormalMaterial!

    @geom.brick = new THREE.Object3D
    @scene.add @geom.brick

    @geom.brick-cells =
      for i from 0 to 3
        cube = new THREE.Mesh geometry, material
        @geom.brick.add cube
        cube

  create-arena-cells: ({ cells, width, height }) ->
    geometry = new THREE.BoxGeometry 0.9, 0.9, 0.9
    material = new THREE.MeshNormalMaterial!

    @geom.arena-root   = new THREE.Object3D
    @geom.arena-offset = new THREE.Object3D
    @geom.arena        = new THREE.Object3D
    @geom.arena-root.add @geom.arena-offset
    @geom.arena-offset.add @geom.arena
    @scene.add @geom.arena-root

    # Flip and position correctly
    @geom.arena-root.position <<< z: -20

    # Center components within 3d region
    @geom.arena-offset.position <<< x: width/-2, y: height/2
    @geom.arena-offset.rotation.x = pi

    line-mat  = new THREE.LineBasicMaterial color: 0x555555
    line-mesh = new THREE.Geometry!
    line-mesh.vertices.push new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, height, 0)

    for i from 0 to 9
      line = new THREE.Line line-mesh, line-mat
      line.position <<< x: i, y: -0.5
      @geom.arena.add line

    backing-geom = new THREE.BoxGeometry width, height, 1.1
    backing-mat  = new THREE.MeshBasicMaterial do
      color: \white
      wireframe: on
      side: THREE.BackSide

    backing = new THREE.Mesh backing-geom, backing-mat
      #@geom.arena-root.add backing
    backing.position <<< x: width/2 - 0.5, y: height/2 - 0.5, z: 0

    @geom.arena-cells =
      for row, y in cells
        for cell, x in row
          cube = new THREE.Mesh geometry, material
          cube.position <<< { x, y }
          @geom.arena.add cube
          cube

  create-preview: (width, height) ->
    geometry = new THREE.BoxGeometry 0.9, 0.9, 0.9
    material = new THREE.MeshNormalMaterial!
    bounds-geom = new THREE.BoxGeometry 4.1, 4.1, 1.1
    bounds-mat  = new THREE.MeshBasicMaterial do
      color: \white
      wireframe: on

    @geom.next        = new THREE.Object3D
    @geom.next-offset = new THREE.Object3D

    @geom.next.add @geom.next-offset
    @geom.next.position <<< x: -0.5, y: height/2 + 3.5, z: -20
    @geom.next.rotation.x = pi

    next-box = new THREE.Mesh bounds-geom, bounds-mat
    #@geom.next.add next-box

    @geom.next-cells =
      for i from 0 to 3
        cube = new THREE.Mesh geometry, material
        @geom.next-offset.add cube
        cube

    @scene.add @geom.next

  map-brick-shape-to-boxes: (brick-cells, shape) ->
    brick-cell-index = 0
    for row, y in shape
      for cell, x in row
        if cell
          brick-cell = brick-cells[brick-cell-index]
          brick-cell.position <<< { x, y }
          brick-cell.material = @mats[cell]
          brick-cell-index += 1

  toggle-row-of-cells: (arena, row-ix, state) ->
    for cell, x in arena.cells[row-ix]
      box = @geom.arena-cells[row-ix][x]
      box.visible = state
      if state
        box.material = @zap-material

  render-line-zap: ({ arena, rows-to-remove, timers }:gs) ->
    on-off = (floor timers.removal-animation.current-time) % 2
    zz     = rows-to-remove.length / 20
    jitter = [ (rand -zz, zz), (rand -zz, zz) ]

    for row-ix in rows-to-remove
      @toggle-row-of-cells arena, row-ix, on-off

    @geom.arena.position.x = jitter.0
    @geom.arena.position.y = jitter.1

    @effect.render @scene, @camera

  pretty-offset: (type) ->
    switch type
    | \square => [0 0]
    | \zig    => [0.5 0]
    | \zag    => [0.5 0]
    | \left   => [0.5 0]
    | \right  => [0.5 0]
    | \tee    => [0.5 0]
    | \tetris => [0 -0.5]

  render-arena: ({{ cells, width, height }:arena, brick }:gs) ->

    # Map arena state onto geometry
    for row, y in cells
      for cell, x in row
        @geom.arena-cells[y][x].visible = !!cell
        @geom.arena-cells[y][x].material = @mats[cell]

    # Use existing geometry to portray falling brick
    @map-brick-shape-to-boxes @geom.brick-cells, brick.current.shape
    @geom.brick.position.x = brick.current.pos.0
    @geom.brick.position.y = brick.current.pos.1

    # Update preview
    @map-brick-shape-to-boxes @geom.next-cells, brick.next.shape
    @geom.next.rotation.y = 0.2 * sin gs.elapsed-time / 500
    pretty-offset = @pretty-offset brick.next.type
    @geom.next-offset.position.x = -1.5 + pretty-offset.0
    @geom.next-offset.position.y = -1.5 + pretty-offset.1

    @effect.render @scene, @camera

  render: (gs) ->
    @controls.update!
    switch gs.metagame-state
    | \game => @render-arena gs
    | \start-menu  => log \start-menu
    | \no-game     => log \no-game
    | \remove-lines => @render-line-zap gs
    | otherwise => log "Unknown metagamestate:", gs.metagame-state

  append-to: (host) ->
    host.append-child @output-canvas

