
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

    # Apply VR stereo rendering to renderer
    @effect = new THREE.VREffect @renderer
    @effect.setSize window.innerWidth, window.innerHeight

    # Bind listeners
    window.addEventListener \keydown, @zero-sensor, true
    window.addEventListener \resize, @resize, false
    document.body.addEventListener \dblclick, @go-fullscreen

  enable-shadow-casting: ->
    @renderer.shadow-map-enabled = yes
    @renderer.shadow-map-soft = yes
    @renderer.shadowCameraNear = 3
    @renderer.shadowCameraFar = 1000
    @renderer.shadowCameraFov = 50

    @renderer.shadowMapBias = 0.0039
    @renderer.shadowMapDarkness = 0.5
    @renderer.shadowMapWidth = 1024
    @renderer.shadowMapHeight = 1024

  go-fullscreen: ~>
    @effect.set-full-screen yes

  zero-sensor: ({ key-code }:event) ~>
    event.prevent-default!
    if key-code is 86 then @controls.zero-sensor!

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

  root:~
    -> @scene

  add: ->
    for obj in arguments
      @scene.add if obj.root? then that else obj

