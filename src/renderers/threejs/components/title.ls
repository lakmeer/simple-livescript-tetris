
# Require

{ id, log, pi } = require \std

{ Base } = require \./base

{ mesh-materials } = require \../palette


#
# Title
#

export class Title extends Base

  title =
    * [ 1 1 1 2 2 2 3 3 3 4 4 0 5 6 6 6 ]
    * [ 0 1 0 2 0 0 0 3 0 4 0 4 5 6 0 0 ]
    * [ 0 1 0 2 2 0 0 3 0 4 4 0 5 6 6 6 ]
    * [ 0 1 0 2 0 0 0 3 0 4 0 4 5 0 0 6 ]
    * [ 0 1 0 2 2 2 0 3 0 4 0 4 5 6 6 6 ]

  (@opts, gs) ->
    super ...

    { width, height } = gs.arena

    @geom.box   = new THREE.BoxGeometry 0.45, 0.45, 0.45
    @geom.strut = new THREE.BoxGeometry width, height, 0.9

    @strut = new THREE.Mesh @geom.strut, mesh-materials.0
    @strut.position.z = -1
    @strut.position.y = height/-2 + 0.5
    #@registration.add @strut

    @title = new THREE.Object3D
    @title.position <<< { x: -3.75, y: -5 }
    @registration.add @title

    @registration.position <<< { x: 0, y: height - 0.5 }

    for row, y in title
      for cell, x in row
        if cell
          box = new THREE.Mesh @geom.box, mesh-materials[cell]
          box.position <<< { x: x/2, y: title.length/2 - y/2 }
          @title.add box

    reveal: ->
