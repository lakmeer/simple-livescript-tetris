
# Require

{ id, log, pi, sin, cos, min, max } = require \std

{ Ease } = require \std
{ Base } = require \./base

{ mesh-materials } = require \../palette


#
# Title
#

export class Title extends Base

  block-text =
    tetris:
      * [ 1 1 1 2 2 2 3 3 3 4 4 0 5 6 6 6 ]
      * [ 0 1 0 2 0 0 0 3 0 4 0 4 5 6 0 0 ]
      * [ 0 1 0 2 2 0 0 3 0 4 4 0 5 6 6 6 ]
      * [ 0 1 0 2 0 0 0 3 0 4 0 4 5 0 0 6 ]
      * [ 0 1 0 2 2 2 0 3 0 4 0 4 5 6 6 6 ]
    vrt:
      * [ 1 0 1 4 4 6 6 6 ]
      * [ 1 0 1 4 0 4 6 0 ]
      * [ 1 0 1 4 4 0 6 0 ]
      * [ 1 0 1 4 0 4 6 0 ]
      * [ 0 1 0 4 0 4 6 0 ]

  (@opts, gs) ->
    super ...

    { width, height } = gs.arena

    word = block-text.vrt
    box-size = 1

    @height = height

    @geom.box   = new THREE.BoxGeometry box-size * 0.9, box-size * 0.9, box-size * 0.9
    @geom.strut = new THREE.BoxGeometry width, height, 0.9

    @strut = new THREE.Mesh @geom.strut, mesh-materials.0
    @strut.position.z = -1
    @strut.position.y = height/-2 + 0.5
    #@registration.add @strut

    title-offset =
      x: (word.0.length - 1)/(-2 * box-size)
      y: height/-2 - (word.length - 1)/(-1 * box-size)

    @title = new THREE.Object3D
    @title.position <<< title-offset

    @registration.add @title
    @registration.position <<< { x: 0, y: height - 0.5 }

    for row, y in word
      for cell, x in row
        if cell
          box = new THREE.Mesh @geom.box, mesh-materials[cell]
          box.position <<< { x: x/box-size, y: word.length/2 - y/box-size }
          @title.add box

  reveal: (progress) ->
    p = (min 1, progress)
    @registration.position.y = Ease.quint-out p, @height * 2, @height
    @registration.rotation.y = Ease.exp-out p, 30, 0
    @registration.rotation.x = Ease.exp-out p, -pi/10, 0
    # log @registration.position.y

  dance: (time) ->
    #@registration.rotation.y = -pi/2 + time / 1000
    @title.opacity = 0.5 + 0.5 * sin + time / 1000

