import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'totalTimePipe'
})
export class TotalTimePipe implements PipeTransform {

    transform(totalTime: number): string {
        let millisecondsInSecond: number = 1000;  // make variable to store the number of milliseconds in a second
        let millisecondsInMinute: number = millisecondsInSecond * 60;  // make a variable to store the number of milliseconds in a minute
        let millisecondsInHour: number = millisecondsInMinute * 60;  // make a variable to store the number of milliseconds in a hour

        //We are using Math.trunc() instead of .toFixed(0) because on rare occasions you will get outputs that don't make sense because of some odd error that shouldn't happen.  For example, in the hours conversion, I got an output that resulted in 59.876 seconds in this file.  The .toFixed(0) is meant to include 0 positions after the decimal point.  However, it somehow returned 60 when it should have been 59.  The Math.Trunc() function fixes this issue.
        // Seconds Conversion
        if (totalTime < millisecondsInMinute) {
            let seconds: number = Math.trunc(totalTime / millisecondsInSecond);
            return `${seconds} sec`;
        }

        // Minutes Conversion
        if (totalTime >= millisecondsInMinute && totalTime < millisecondsInHour) {
            let minutes: number = Math.trunc(totalTime / millisecondsInMinute);
            let seconds: number = Math.trunc(totalTime / millisecondsInSecond % 60);  // This first converts the total time from milliseconds to minutes, and then we find the remainder by using modulus division to convert it from total fractional minutes (> 60) to remaining fractional minutes (< 60).
            return `${minutes} min ${seconds} sec`;
        }

        // Hours Conversion
        if (totalTime >= millisecondsInHour) {
            let hours: number = Math.trunc(totalTime / millisecondsInHour);
            let minutes: number = Math.trunc(totalTime / millisecondsInMinute % 60);  // This first converts the total time from milliseconds to minutes, and then we find the remainder by using modulus division to convert it from total fractional minutes (> 60) to remaining fractional minutes (< 60).
            let seconds: number = Math.trunc(totalTime / millisecondsInSecond % 60);  // This first converts the total time from milliseconds to seconds, and then we find the remainder by using modulus division to convert it from total fractional seconds (> 60) to remaining fractional seconds (< 60).
            return `${hours} hr ${minutes} min ${seconds} sec`;
        }

        return `${totalTime} ms`;
    }
}
