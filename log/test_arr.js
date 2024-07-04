let arrName = [10, 20, 30, 40, 50];
let arrText = ['Toey', 'Pimda', 'Apple', 'Winter', 'Karina', 'Love', 'To', 'Much']

arrName.pop()
arrName.push(75)
arrName.shift()
arrName.unshift(45) //same like push

let arrConcat = arrName.concat(arrText)
console.log(arrConcat)

let arrReverse = arrConcat.reverse()
console.log(arrReverse) 

let reOrder = arrReverse.sort()
console.log(reOrder)

let check_length = reOrder.length;
console.log('\nLength of Array is: \n',check_length)

let sliceArr = reOrder.slice(10, 13)
console.log(sliceArr)