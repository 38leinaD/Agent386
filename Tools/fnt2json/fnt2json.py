#!/bin/python
# (c) 2013 by fruitfly (Daniel Platz)

import fileinput

def toJsonType(value):
    if len(value) == 0:
        return 'null'
    elif value[0] == '"':
        if value[1] == '"':
            return '"' + '\\\"' + '"'
        elif value[1] == '\\':
            return '"' + '\\\\' + '"'
        else:
            return '"' + value[1:-1] + '"'
    elif value.find(',') >= 0:
        return '[' + value + ']'
    else:
        try:
            int(value)
            return value
        except ValueError:
            return 'null'

print '{'

lines = []
for line in fileinput.input():
    lines.append(line)

buffer = '"char": [\n'
    
for (i,line) in enumerate(lines):
    tokens = line.split(' ')
    cmd = tokens.pop(0)
    
    if cmd != 'char':
        print ' "' + cmd + '": {'
        
        for (j,token) in enumerate(tokens):
            split = token.find('=')
            key = token[0:split]
            value = token[split+1:].strip()
            print '  "' + key + '": ' + toJsonType(value) + (', ' if j<len(tokens)-1 else '')
        
        print ' },';    
    else:
        
        buffer += "{\n"
        for (j,token) in enumerate(tokens):
            split = token.find('=')
            key = token[0:split]
            value = token[split+1:].strip()
            buffer += '  "' + key + '": ' + toJsonType(value) + (', ' if j<len(tokens)-1 else '') + '\n'
                
        buffer += "}"  + (', ' if i<len(lines)-1 else '')

    if i==len(lines)-1:
        buffer += ']'
        print buffer
    
print '}'



def type(value):
    if len(value) == 0:
        return '?'
    elif value[0] == '"':
        return 'string'
    elif value.find(',') >= 0:
        return 'array'
    else:
        try:
            int(value)
            return 'number'
        except ValueError:
            return '?'