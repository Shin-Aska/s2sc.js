s2sc.js
===========

Programming Language Converter for Javascript

![alt tag](http://i.imgur.com/fcwJueC.png)

**s2sc** (*Source to Source Converter*) is a javascript code convertion framework
that aims to connect other programming languages to web browsers.

By default it only supports an incomplete Python to C conversion. There are plans 
for vice versa conversion and support for other languages.


Instructions
===========


Simply by calling s2sc.convert() will instruct s2sc to  generate an equivalent source code 
from its original language to its targeted language.

```javascript
s2sc.convert(s2sc.language.python, s2sc.language.c, "txt = 'Hello World!'")
```

Will return you the output string

![alt tag](http://i.imgur.com/8cMuro1.png)

For a live example, see how s2sc is used by application.js



Documentation
===========
Coming soon...
