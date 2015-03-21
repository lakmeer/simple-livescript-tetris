
# Require

{ id, log } = require \std

{ Base } = require \./base

{ line-materials } = require \../palette


#
# Class
#

export class GuideLines extends Base
  (@opts, gs) ->
    super ...

    @lines = []

    { width, height } = gs.arena

    mesh = new THREE.Geometry!
    mesh.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height, 0))

    @registration.position.x = width / -2 + 0.5

    for i from 0 to 9
      line = new THREE.Line mesh, line-materials[i]
      line.position <<< x: i, y: 0
      @lines.push line
      @registration.add line

