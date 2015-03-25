
{ id, log, sin, cos } = require \std

{ Base } = require \./base


#
# Start Menu
#
# Show list of options and their selection state
#

canvas-texture = do ->

  texture-size = 512

  text-cnv = document.create-element \canvas
  img-cnv  = document.create-element \canvas
  text-ctx = text-cnv.get-context \2d
  img-ctx  = img-cnv.get-context \2d

  img-cnv.width = img-cnv.height = texture-size

  ({ width, height, text, text-size = 10 }) ->
    text-cnv.width  = width * 100
    text-cnv.height = height * 100

    text-ctx.text-align    = \center
    text-ctx.text-baseline = \middle
    text-ctx.fill-style    = \white
    text-ctx.font          = "#{text-size * 100}px monospace"

    text-ctx.fill-text text, width * 50, height * 50, width * 100
    img-ctx.clear-rect 0, 0, texture-size, texture-size
    img-ctx.draw-image text-cnv, 0, 0, texture-size, texture-size
    return img-cnv.to-data-URL!


export class StartMenu extends Base

  (@opts, gs) ->
    super ...

    @options = []

    for option, ix in gs.start-menu-state.menu-data
      image = canvas-texture text: option.text, width: 40, height: 10
      tex   = THREE.ImageUtils.load-texture image
      geom  = new THREE.PlaneGeometry 16, 4
      mat   = new THREE.MeshPhongMaterial map: tex, alphaMap: tex, transparent: yes
      quad  = new THREE.Mesh geom, mat

      quad.position.y = 6 - ix * 4.5
      @options.push quad
      @root.add quad

    @registration.position.y = 10

  update-selection: (state, time) ->
    for quad, ix in @options when ix is state.current-index
      quad.scale.x = 1 + 0.05 *  sin time / 300
      quad.scale.y = 1 + 0.05 * -sin time / 300

