
/*
========================================
 Apex Time Class Demo
 Demonstrates all Time methods with debug logs
========================================
*/

public class TimeClass {

    public static void demonstrateTimeMethods() {

        System.debug('================ TIME CLASS DEMO START ================');

        // Create Time Instance
        Time myTime = Time.newInstance(18, 30, 2, 20);

        System.debug('Original Time : ' + myTime);

        // -------------------------------------------------
        // addHours()
        // -------------------------------------------------
        Time addedHours = myTime.addHours(3);

        System.debug('After Adding 3 Hours : ' + addedHours);

        // -------------------------------------------------
        // addMinutes()
        // -------------------------------------------------
        Time addedMinutes = myTime.addMinutes(15);

        System.debug('After Adding 15 Minutes : ' + addedMinutes);

        // -------------------------------------------------
        // addSeconds()
        // -------------------------------------------------
        Time addedSeconds = myTime.addSeconds(40);

        System.debug('After Adding 40 Seconds : ' + addedSeconds);

        // -------------------------------------------------
        // addMilliseconds()
        // -------------------------------------------------
        Time addedMilliseconds = myTime.addMilliseconds(1500);

        System.debug('After Adding 1500 Milliseconds : ' + addedMilliseconds);

        // -------------------------------------------------
        // hour()
        // -------------------------------------------------
        Integer hourValue = myTime.hour();

        System.debug('Hour Value : ' + hourValue);

        // -------------------------------------------------
        // minute()
        // -------------------------------------------------
        Integer minuteValue = myTime.minute();

        System.debug('Minute Value : ' + minuteValue);

        // -------------------------------------------------
        // second()
        // -------------------------------------------------
        Integer secondValue = myTime.second();

        System.debug('Second Value : ' + secondValue);

        // -------------------------------------------------
        // millisecond()
        // -------------------------------------------------
        Integer milliValue = myTime.millisecond();

        System.debug('Millisecond Value : ' + milliValue);

        // -------------------------------------------------
        // Additional Example
        // -------------------------------------------------
        Time customTime = Time.newInstance(1, 2, 3, 4);

        System.debug('Custom Time : ' + customTime);

        System.debug('Custom Time + 5 Hours : ' + customTime.addHours(5));

        System.debug('Custom Time + 30 Minutes : ' + customTime.addMinutes(30));

        System.debug('Custom Time + 120 Seconds : ' + customTime.addSeconds(120));

        System.debug('Custom Time + 5000 Milliseconds : ' + customTime.addMilliseconds(5000));

        System.debug('================ TIME CLASS DEMO END ================');
    }
}
// Execute Anonymous Window Script

//TimeClass.demonstrateTimeMethods();