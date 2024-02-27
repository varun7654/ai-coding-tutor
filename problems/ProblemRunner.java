import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
public abstract class ProblemRunner {
    public static void main(String[] args) throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        if (args.length < 1) {
            System.out.println("No enough arguments.");
            return;
        }

        String problemName = args[0];

        Class<?> problemClass;
        try {
            problemClass = Class.forName(problemName);
        } catch (ClassNotFoundException e) {
            System.out.println("Problem not found.");
            return;
        }


        List<TestResult> results = new ArrayList<>();
        Object problemInstance = problemClass.getDeclaredConstructor().newInstance();
        Arrays.stream(problemClass.getMethods()).filter(method -> method.isAnnotationPresent(Test.class)).forEach(method -> {
            Test test = method.getAnnotation(Test.class);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream ps = new PrintStream(baos);
            PrintStream old = System.out;
            System.setOut(ps);

            String result = "";
            String error = "";
            try {
                result = (String) method.invoke(problemInstance);
            } catch (IllegalAccessException | InvocationTargetException e) {
                error = getStrippedError(e, method.getName());
            }

            System.out.flush();
            System.setOut(old);
            String output = baos.toString();
            TestResult testResult = new TestResult(test.displayName(), test.hidden(), test.expected(), result, test.expected().equals(result), output, error);
            results.add(testResult);
        });


    }

    public static String getStrippedError(Throwable e, String runningMethodName) {
        return e.toString().replaceFirst("java.lang.", "");
    }

    public record TestResult(String displayName, boolean hidden, String expected, String result, boolean passed, String output,
                             String error) {
    }
}