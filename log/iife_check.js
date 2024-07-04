// test how to use IIFE (Immediately Invoked Function Expressions) 

var call_fn = (function plus(a, b){
    let sum = a+b
    return sum
})(5,17)

console.log(call_fn)
