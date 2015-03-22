
# Require

{ id, log } = require \std

{ Base } = require \./base
{ mesh-materials } = require \../palette


#
# Table
#

export class Table extends Base
  (@opts, gs) ->
    super ...

    size = 100

    # Texture
    texture = THREE.ImageUtils.load-texture 'assets/marble.jpg'
    texture.repeat.set 2, 2
    texture.wrap-s = THREE.MirroredRepeatWrapping
    texture.wrap-t = THREE.MirroredRepeatWrapping
    table-mat = new THREE.MeshPhongMaterial map: texture

    # Table
    @geom.table = new THREE.BoxGeometry size, 1, size
    @table = new THREE.Mesh @geom.table, table-mat
    @table.receive-shadow = yes
    @table.cast-shadow = yes

    # Positioning
    @registration.add @table
    @registration.position.y = -0.5


