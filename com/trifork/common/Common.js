(function() {
	
    var Common = function() {
            /**
             * This function constructs and returns a new object, using the
             * <code>o</code> parameter as a prototype. This is equivalent to Crockford's 
             * object function.
             * 
             * @param {Object} o
             * @return a new object which has <code>o</code> as its prototype.
             */
            var object = (function() {
                 function F() {}
                 return function(o) {
                     F.prototype = o;
                     return new F();
                 };
            })();
            
            
            var copy = (function(){
                function shallow(tgt,src) {
                    for (var p in src) if (src.hasOwnProperty(p)) {
                        tgt[p] = src[p];
                    }
                    return tgt;
                }
                function deep(tgt,src) {
                    for (var p in src) {
                        tgt[p] = src[p];
                    }
                    return tgt;
                }
                return function(deep,tgt,src){
                    if (arguments.length === 3) {
                      if (deep) {
                          return deep(tgt,src);
                      }
                      else {
                          return shallow(tgt, src);
                      }    
                    } else {//src === undefined
                        return shallow(deep,tgt);
                    }                    
                };
            })();

	
          /**
           * This function constructs a namespace using a namespace specification object. 
           * 
           * <h3>Example 1</h3>
           * <code>
           * com.trifork.common.Common.namespace({
           *    com: {
           *    	trifork: {
           *    		utils: {},
           *    		myapplication: ['model','view', 'controller']
           *      }
           *    }
           * });
           * </code>
           * 
           * <h3>Example 2</h3>
           * <code>
           * com.trifork.common.Common.namespace({
           *    B1:{}, B2:["B21","B22"]
           * },B);
           * </code>
           * Extends B with two properties: B1 and B2. B1 is an empty object, while B2 has two properties B21 and B22,
           * which in turn are empty objects.
           *  
           * @param {Object} spec a namespace specification
           * @param {Object} (Optional) context used to extend namespaces (see example 2 above): defaults to window.
           * @return void
           */
          var namespace = (function() {
              var validIdentifier = /^(?:[a-zA-Z_]\w*[.])*[a-zA-Z_]\w*$/;
              function inOrderDescend(t,initialContext) {
                  var i,N;
                  if (typeof t === 'object') {
                      if (t instanceof Array) {//an array of strings
                          for (i=0,N=t.length;i<N;i++) {
                              initialContext[t[i]] = initialContext[t[i]] || {};
                          }
                      }
                      else {//t is a specification object e.g, {com: {trifork: ['model,view']}}
                          for (i in t) if (t.hasOwnProperty(i)) {
                              initialContext[i] = initialContext[i] || {};
                              inOrderDescend(t[i], initialContext[i]);//recursively descend tree
                          }
                      }
                  } else if (typeof t === 'string') {
                       return (function handleStringCase(){
                          var context, parts;
                          if (!validIdentifier.test(t)) {
                              throw new Error('"'+t+'" is not a valid name for a package.');
                          }
                          context = initialContext;
                          parts = t.split('.');
                          for (i=0,N=parts.length;i<N;i++) {
                              t = parts[i];
                              context[t] = context[t] || {};
                              context = context[t];
                          }
                          return context;
                       })();
                  }
                  else {
                     throw new TypeError();
                  }
              }
              return function(spec,context) { 
                  return inOrderDescend(spec, context||window);   
              };
          })();

			
          /**
           * Kind of a trivial function ;-) it is included for writing readable JavaScript which
           * uses packages. 
           * 
           * com.trifork.common.Common.using(X).run(f) is similar to f(X), 
           * but f is called with <code>this</code> set to X.
           * 
           * More precisely <code>com.trifork.common.Common.using(X).run(f)</code> is equivalent to
           * <code>f.call(X,X)</code>.
           * 
           * This provides a form of syntactic sugar.
           * 
           * Example: Suppose you've done <code>com.trifork.common.Common.namespace({Long:{Boring:"Namespace"}}});</code>
           * Now you want define an object in the Long.Boring.Namespace object, say Widget. Normally you would do
           * <code>
           *  Long.Boring.Namespace.Widget = function ()  {//constructor}
           *  Long.Boring.Namespace.prototype.fn1 = ...;
           *  Long.Boring.Namespace.prototype.fn2 = ...;
           * </code> 
           *  Alternatively you can do:
           * <code>
           * var shrt = Long.Boring.Namespace.Widget;
           * shrt.Widget ...
           * shrt.prototype.fn1...
           * </code>
           * But this breaks global namespace. Alternatively 
           * <code>
           * function() {
           * 	var shrt = Long.Boring.Namespace.Widget;
           *  ...
           * }();
           *  </code>
           * 
           * The <code>using</code> function is similar, it just reads nicer. For example.
           * <code>
           * com.trifork.common.Common.using(Long.Boring.Namespace).run(
           * function() {
           * 	this.Widget = ...;
           *  this.Widget.prototype.fn1 = ...;
           *  ...	
           * });
           * </code>
           * 
           * Alternatively you can let <code>fn</code> take a parameter which is bound to <code>ns</code> 
           * (so you can use that name instead of <code>this</code>).
           * Variable args: the namespace objects (i.e., package)
           * @return {Object} an object containing a run function which calls an input parameter <code>fn</code> 
           * with <code>arguments</code>.
           */
          function using() {
                  var args = arguments;
                  return {
                      run: function(fn){
                           return fn.apply(args[0],args);
                      }
                   };
          }

          /**
           * Simply executes a function. Why would you want that?
           * 
           * Equivalent to using().run(fn)
           * 
           * Try reading:
           * 
           * var x = function() {//long code,
           * //several screens...
           * //now, is x a function or the result of applying this function?
           * ..
           * }();//we turned out applying it.
           * 
           * Instead
           * 
           * var x = inline(function(){...
           * 
           * });
           * @param {Function} fn the function to call
           * @param {[Object]} scope [Optional] parameter to set as 'this'
           * when calling fn.
           */
          function inline(fn,scope) {
                  return scope?fn.call(scope):fn();
          }

          /**
           * Expose public methods
           */
          return {
                  inline: inline,
                  object: object,
                  namespace:namespace,
                  using: using,
                  copy: copy
          };
    }();


    Common.namespace({
            com: {
                trifork: 'common'
            }
    });

    //extern com
    Common.using(com.trifork.common).run(function(c) {c.Common = Common;});

    namespace = Common.namespace;
    using = Common.using;
    object = Common.object;
})();
	
