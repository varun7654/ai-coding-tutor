public class Testing {
    // Problem Display
    public static int calculateNthFibonacci(int n) {
        // User Input
        if (n == 0) {
            return 0;
        } else if (n == 1) {
            return 1;
        }

        int a = 0;
        int b = 1;
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }

        return b;
        // End Solution
    }
    // End Problem Display


    @Test(displayName = "Test 0", expected = "0")
    public int test0() {
        return calculateNthFibonacci(0);
    }

    @Test(displayName = "Test 1", expected = "1")
    public int test1() {
        return calculateNthFibonacci(1);
    }

    @Test(displayName = "Test 2", expected = "1", hidden = true)
    public int test2() {
        return calculateNthFibonacci(2);
    }

    @Test(displayName = "Test 3", expected = "2", hidden = true)
    public int test3() {
        return calculateNthFibonacci(3);
    }


}






