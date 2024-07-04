// Function to multiply a number by values from 1 to 12
function multipy_kun(number) {
    for (let i = 1; i <= 12; i++) {
        console.log(`${number} * ${i} = ${number * i}`); //print result Line by line
    }
}

// Example usage
const inputNumber = 2; // Change this to any number you want to multiply
multipy_kun(inputNumber);
