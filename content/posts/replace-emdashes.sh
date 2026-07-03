#!/bin/bash

find . -type f -name '*.md' -print0 |
  xargs -0 perl -CSDA -pi -e 's/\x{2014}/-/g'
