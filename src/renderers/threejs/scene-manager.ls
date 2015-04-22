
# Require

{ id, log } = require \std

THREE = require \three-js-vr-extensions # puts THREE in global scope


#
# Scene Manager
#
# Handles three.js scene, camera, and vr management, exposes only relevant bits
#

export class SceneManager

  (@opts) ->

    aspect = window.inner-width / window.inner-height

    # Create a three.js scene
    @renderer = new THREE.WebGLRenderer antialias: true
    @scene    = new THREE.Scene!
    @camera   = new THREE.PerspectiveCamera 75, aspect, 1, 10000
    @controls = new THREE.VRControls @camera

    @root     = new THREE.Object3D
    @offset   = new THREE.Object3D

    # Apply VR stereo rendering to renderer
    @effect = new THREE.VREffect @renderer
    @effect.setSize window.innerWidth, window.innerHeight

    # Bind listeners
    window.addEventListener \keydown, @zero-sensor, true
    window.addEventListener \resize, @resize, false
    document.body.addEventListener \dblclick, @go-fullscreen

    @scene.add @root
    @root.add @offset

  enable-shadow-casting: ->
    @renderer.shadow-map-soft     = yes
    @renderer.shadow-map-enabled  = yes
    @renderer.shadow-camera-far   = 1000
    @renderer.shadow-camera-fov   = 50
    @renderer.shadow-camera-near  = 3
    @renderer.shadow-map-bias     = 0.0039
    @renderer.shadow-map-width    = 1024
    @renderer.shadow-map-height   = 1024
    @renderer.shadow-map-darkness = 0.5

  go-fullscreen: ~>
    log 'Starting fullscreen...'
    @effect.set-full-screen yes

  zero-sensor: ({ key-code }:event) ~>
    event.prevent-default!
    if key-code is 86 then @controls.reset-sensor!

  resize: ~>
    @camera.aspect = window.innerWidth / window.innerHeight
    @camera.updateProjectionMatrix!
    @effect.setSize window.innerWidth, window.innerHeight

  update: ->
    @controls.update!

  render: ->
    @effect.render @scene, @camera

  dom-element:~
    -> @renderer.dom-element

  add: ->
    for obj in arguments
      @offset.add if obj.root? then that else obj

