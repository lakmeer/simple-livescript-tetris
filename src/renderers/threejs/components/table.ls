
# Require

{ id, log } = require \std

{ Base } = require \./base
{ mesh-materials } = require \../palette


#
# Table
#

export class Table extends Base

  repeat = 2

  (@opts, gs) ->
    super ...

    # Desk dimensions at work: 120cm x 65cm
    size = [ 0.8, 1.2 ]

    # Texture
    map = THREE.ImageUtils.load-texture 'assets/wood.diff.jpg'
    map.wrap-t = map.wrap-s = THREE.RepeatWrapping
    map.repeat.set repeat, repeat

    # Normal
    nrm = THREE.ImageUtils.load-texture 'assets/wood.nrm.jpg'
    nrm.wrap-t = nrm.wrap-s = THREE.RepeatWrapping
    nrm.repeat.set repeat, repeat

    # Material
    table-mat = new THREE.MeshPhongMaterial do
      map: map
      normal-map: nrm
      normal-scale: new THREE.Vector2 -0.1, 0.1

    # Table
    @geom.table = new THREE.BoxGeometry size.0, 0.01, size.1
    @table = new THREE.Mesh @geom.table, table-mat
    @table.receive-shadow = yes
    @table.cast-shadow = yes

    # Positioning
    @registration.add @table
    @registration.position.y = -0.005
    @registration.position.z = -0.3

