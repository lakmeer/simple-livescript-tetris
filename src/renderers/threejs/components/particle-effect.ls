
# Require

{ id, log, pi, sin, cos } = require \std

{ Base } = require \./base

{ mesh-materials } = require \../palette


#
# Title
#

export class ParticleEffect extends Base

  size     = 0.3
  speed    = 3
  lifespan = 3000

  (@opts, {{ width, height }:arena }:gs) ->

    super ...

    @last-p = 10


    # Buffer geom

    particles  = 1200
    geometry   = new THREE.BufferGeometry!
    @positions  = new Float32Array particles * 3
    @velocities = new Float32Array particles * 3
    @lifespans  = new Float32Array particles * 3
    @colors     = new Float32Array particles * 3
    color      = new THREE.Color!

    @pos-attr = new THREE.BufferAttribute @positions, 3
    @col-attr = new THREE.BufferAttribute @colors, 3

    @reset-particles!

    geometry.addAttribute \position, @pos-attr
    geometry.addAttribute \color,    @col-attr
    geometry.computeBoundingSphere!

    material = new THREE.PointCloudMaterial size: size, vertexColors: THREE.VertexColors
    particleSystem = new THREE.PointCloud geometry, material

    @root.add particleSystem

  revive: (n, y) ->
    for i from 0 til n
      @lifespans[i] = lifespan/2 + Math.random! * lifespan/2
      @positions[i * 3 + 1] = y # + Math.random! - 0.5

  reset-particles: ->
    for i from 0 til @positions.length by 3

      n = 10

      x = 4.5 - Math.random! * 9
      z = 0.5 - Math.random!

      @positions[ i + 0 ] = x
      @positions[ i + 1 ] = 0
      @positions[ i + 2 ] = z

      @velocities[ i + 0 ] = x / 9
      @velocities[ i + 1 ] = Math.random! * 2
      @velocities[ i + 2 ] = z

      @colors[ i + 0 ] = 1
      @colors[ i + 1 ] = 1
      @colors[ i + 2 ] = 1

  accelerate-particle: (i, t) ->
      t = t/(1000/speed)
      acc = -0.98

      px = @positions[i + 0]
      py = @positions[i + 1]
      pz = @positions[i + 2]

      vx = @velocities[i + 0]
      vy = @velocities[i + 1]
      vz = @velocities[i + 2]

      px1 = px + 0.5 *  0  * t * t + vx * t
      py1 = py + 0.5 * acc * t * t + vy * t  # Apply gravity only in y direction
      pz1 = pz + 0.5 *  0  * t * t + vz * t

      vx1 = 0 * t + vx
      vy1 = acc * t + vy  # Apply gravity only in y direction
      vz1 = 0 * t + vz

      # Bounce
      if py1 < size/2
        py1 = size/2
        vx1 *= 0.7
        vy1 *= -0.6
        vz1 *= 0.7

      # Die
      if @lifespans[i/3] < 0
        py1 = -1000

      @positions[i + 0] =  px1
      @positions[i + 1] =  py1
      @positions[i + 2] =  pz1

      @velocities[i + 0] = vx1
      @velocities[i + 1] = vy1
      @velocities[i + 2] = vz1

  update: (p, Δt) ->

    #if p < @last-p then @reset-particles!

    @last-p = p

    for i from 0 til @positions.length by 3
      @accelerate-particle i, Δt
      @lifespans[i/3] -= Δt

    @pos-attr.needs-update = true


