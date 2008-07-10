using(namespace('datastructures.trie')).run(function(gt) {
   
    gt.Trie = function(spec){
        var root = {},
            i,N;
        
        this.root = root;
        if (spec) {
            if (typeof spec.length === 'number') {
                for (i=0,N=spec.length;i<N;i++) {
                    this.insert(spec[i]);
                }
            } else {
                for (i in spec) if (spec.hasOwnProperty(i)) {
                    this.insert(i,spec[i]);
                }
            }
        }
    };

    gt.Trie.prototype = {
        
        size: 0,
        internalSize:1,
        get: function(str){return this.lookup(str).value;},
        
        lookup: function(str){
            var node = this.root,
                best_match,
                best_index;
            for (var i=0,c_i,N=str.length;i<N;i++){
                if (node.hasOwnProperty('value')){
                     best_match=node;
                     best_index = i;
                 }
                c_i = str.charAt(i);
                if (node.hasOwnProperty(c_i)) {
                    node = node[c_i];
                } else {
                    return {match:false, prefix:node, 
                            best_match:best_match, best_index: best_index,
                            depth:i};
                }
            }
            var match = node.hasOwnProperty('value'),
                res = {
                    match: match,
                    prefix: node,
                    depth: str.length
                };
            if (match) {res.value = node.value;}
            return res;
        },
        
        insert: function(str,node){
            var look = this.lookup(str),
                i,N,
                prefix_node;
            if (look.match) {
                look.prefix.value = node;
                return look;
            } else {
                this.size += 1;
                prefix_node = look.prefix;
                for (i = look.depth, N = str.length;i<N;i++) {
                    prefix_node = prefix_node[str.charAt(i)] = {};
                    this.internalSize += 1;
                }
                prefix_node.value = node;
                look.prefix = prefix_node;
                return look;
            }
        }
        
        
        
    };
    
});
