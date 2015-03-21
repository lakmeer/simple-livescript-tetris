
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

    size = 50

    # Texture
    texture = THREE.ImageUtils.load-texture 'assets/marble.jpg'
    table-mat = new THREE.MeshPhongMaterial map: texture

    # Table
    @geom.table = new THREE.BoxGeometry size, 1, size
    @table = new THREE.Mesh @geom.table, table-mat

    # Positioning
    @registration.add @table
    @registration.position.y = -0.5


