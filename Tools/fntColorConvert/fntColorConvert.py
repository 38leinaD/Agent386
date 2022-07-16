#!/bin/python
# (c) 2013 by fruitfly (Daniel Platz)

import sys
from PIL import Image

def conv(r, g, b, a):
    if r == 0 and g == 0 and b == 0 and a == 255:
        return (255, 255, 255, 255)
    else:
        return (r, g, b, a)

if len(sys.argv) < 3:
    print 'Provide parmaters [srcFile] and [destinationFile]';
else:        
    im = Image.open(sys.argv[1])
    im.putdata([conv(r, g, b, a) for (r, g, b, a) in im.getdata()])
    im.save(sys.argv[2])