
# Require

{ id, log } = require \std

{ Base } = require \./base


#
# Class
#

export class Lighting extends Base
  (@opts, gs) ->
    super ...

    @light = new THREE.PointLight 0xffffff, 1, 100
    @root.add @light

