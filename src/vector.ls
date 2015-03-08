

#
# Vector
#
# Simple vector utils. There's not many real vectors in this project but it's
# useful to be able to express these higher level operations nicely.
#

export V2 =
  add: (a, b) -> [ a.0 + b.0, a.1 + b.1 ]

