'use strict';

module.exports = function(acorn) {
  var tt = acorn.tokTypes;

  // modified version of parseObj from acorn/src/expression.js
  // with rest/spread code from https://github.com/babel/babylon/blob/master/src/parser/expression.js
  function parseObj(isPattern, refDestructuringErrors) {
    let node = this.startNode(), first = true, propHash = {}
    node.properties = []
    this.next()
    while (!this.eat(tt.braceR)) {
      if (!first) {
        this.expect(tt.comma)
        if (this.afterTrailingComma(tt.braceR)) break
      } else first = false

      let prop = this.startNode(), isGenerator, isAsync, startPos, startLoc
      if (this.options.ecmaVersion >= 6) {
        // code for spread is adapted from babylon parser
        if (this.type === tt.ellipsis) {
          prop = this.parseSpread()
          if (isPattern) {
            prop.type = "RestElement"
            prop.value = this.toAssignable(prop.argument, true)
          } else {
            prop.type = "SpreadElement"
          }
          node.properties.push(prop)
          continue
        }

        prop.method = false
        prop.shorthand = false
        if (isPattern || refDestructuringErrors) {
          startPos = this.start
          startLoc = this.startLoc
        }
        if (!isPattern)
          isGenerator = this.eat(tt.star)
      }

      this.parsePropertyName(prop)
      if (!isPattern && this.options.ecmaVersion >= 8 && !isGenerator && !prop.computed &&
        prop.key.type === "Identifier" && prop.key.name === "async" && this.type !== tt.parenL &&
        this.type !== tt.colon && !this.canInsertSemicolon()) {
        isAsync = true
        this.parsePropertyName(prop, refDestructuringErrors)
      } else {
        isAsync = false
      }
      this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors)
      this.checkPropClash(prop, propHash)
      node.properties.push(this.finishNode(prop, "Property"))
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  }

  acorn.plugins.objectRestSpread = function objectRestSpreadPlugin(parser) {
    acorn.Parser.prototype.parseObj = parseObj

    parser.extend("toAssignable", function(nextMethod) {
      return function(node, isBinding) {
        if (this.options.ecmaVersion >= 6 && node && node.type === "ObjectExpression") {
          node.type = "ObjectPattern"

          for (var i = 0; i < node.properties.length; i++) {
            var prop = node.properties[i]
            if (prop.kind === "init") {
              this.toAssignable(prop.value, isBinding)
            } else if (prop.type === "SpreadElement") {
              prop.value = this.toAssignable(prop.argument, isBinding)
            } else {
              this.raise(prop.key.start, "Object pattern can't contain getter or setter")
            }
          }
          return node
        }

        return nextMethod.call(this, node, isBinding)
      }
    })
  };

  return acorn;
};
