
#
# "Standard Library" (after a fashion)
#
# Various helper functions
#

export id = -> it

export log = -> console.log.apply console, &; &0

export flip = (λ) -> (a, b) -> λ b, a

export delay = flip set-timeout

export floor = Math.floor

export random = Math.random

export rand = (min, max) -> min + floor random! * (max - min)

export random-from = (list) -> list[ rand 0, list.length - 1 ]


export raf = #(λ) -> set-timeout λ, 1000 / 4
  if window.request-animation-frame? then that
  else if window.webkit-request-animation-frame? then that
  else if window.moz-request-animation-frame? then that
  else (λ) -> set-timeout λ, 1000 / 60

