
#
# "Standard Library" (after a fashion)
#
# Various helper functions
#

export id = -> it

export log = -> console.log.apply console, &; &0

export raf =
  if window.request-animation-frame? then that
  else if window.webkit-request-animation-frame? then that
  else if window.moz-request-animation-frame? then that
  else (λ) -> set-timeout λ, 1000 / 60

