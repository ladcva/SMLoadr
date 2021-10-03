# acorn-object-rest-spread
Support for [Object Rest/Spread Properties proposal](https://github.com/tc39/proposal-object-rest-spread) in [Acorn 5](https://github.com/ternjs/acorn) - a tiny, fast JavaScript parser, written completely in JavaScript.

## Usage

You can use module directly in order to get Acorn instance with plugin installed:

```javascript
var acorn = require('acorn-object-rest-spread');
```

Or you can use `inject.js` to inject multiple plugins into Acorn:

```javascript
var acorn = require('acorn')
var injectAcornJsx = require('acorn-jsx/inject');
var injectAcornObjectRestSpread = require('acorn-object-rest-spread/inject');
injectAcornJsx(acorn);
injectAcornObjectRestSpread(acorn);
```

Then, use the `plugins` option whenever you need to support Object Rest/Spread while parsing:

```javascript
var ast = acorn.parse(code, {
  plugins: {objectRestSpread: true}
});
```
