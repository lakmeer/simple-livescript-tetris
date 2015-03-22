
# Require

{ id, log } = require \std


#
# Class
#

export class Base
  (@opts, gs) ->

    # Base can configure it's own offset relative to it's canonical position
    @root = new THREE.Object3D
    @registration = new THREE.Object3D
    @root.add @registration

    # Define geometry available
    @geom = {}

    # Define materials available
    @mats =
      normal: new THREE.MeshNormalMaterial!

  show-bounds: (scene) ->
    @bounds = new THREE.BoundingBoxHelper @root, 0x555555
    @bounds.update!
    scene.add @bounds

  add-to: (obj) ->
    obj.add @root

  position:~
    -> @root.position

  visible:~
    -> @root.visible
    (state) -> @root.visible = state

