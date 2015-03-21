
# Require

{ id, log } = require \std

{ Base } = require \./base


#
# Class
#

export class Lighting extends Base
  (@opts, gs) ->
    super ...

    @light = new THREE.PointLight 0xffffff, 1.1, 50
    @root.add @light

