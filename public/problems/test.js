/*
//startdesc
This is a test desc
//enddesc
 */

//displaystart
function findNthFibonacci(n){
    //usercode
    let a = 0, b = 1, c;
    if(n == 0) return a;
    for(let i = 2; i <= n; i++){
        c = a + b;
        a = b;
        b = c;
    }
    return b;
    //endsolution
}
//displayend

/*
//teststart
findNthFibonacci(5) == 5
findNthFibonacci(10) == 55
findNthFibonacci(15) == 610

//hidden
findNthFibonacci(0) == 0
findNthFibonacci(1) == 1
findNthFibonacci(2) == 1
findNthFibonacci(3) == 2
findNthFibonacci(4) == 3
findNthFibonacci(6) == 8
 */


