
# Require

{ id, log } = require \std

{ Base } = require \./base


#
# Class
#

export class Lighting extends Base
  (@opts, gs) ->
    super ...

    @light = new THREE.PointLight 0xffffff, 1, 1
    @light.position.set 0, 1, -0.1
    @root.add @light

    @spotlight = new THREE.SpotLight 0xffffff, 1, 100, 0.3
    @spotlight.position.set 0, 0.1, 0 #gs.arena.height * 0.06, 0
    @spotlight.look-at new THREE.Vector3 0, 0, 0

    # Shadows
    @spotlight.cast-shadow = yes

    @spotlight.shadow-darkness = 0.5
    @spotlight.shadow-bias = 0.0001
    @spotlight.shadow-map-width = 1024
    @spotlight.shadow-map-height = 1024

    @spotlight.shadow-camera-visible = yes
    @spotlight.shadow-camera-near = 10
    @spotlight.shadow-camera-far = 2500
    @spotlight.shadow-camera-fov = 50

    @root.add @spotlight

