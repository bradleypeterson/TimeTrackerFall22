import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'totalTimePipe'
})
export class TotalTimePipe implements PipeTransform {

  transform(totalTime: number): string {
    // Seconds Conversion
    if (totalTime < 60000) {
        let seconds: string = (totalTime / 1000).toFixed(0);
        return `${seconds} sec`;
    }

    // Minutes Conversion
    if (totalTime >= 60000 && totalTime < 3600000) {
        let seconds: string = ((totalTime / 1000) % 60).toFixed(0);  // convert the totalTime to number of seconds and then to account for it being the number of minutes by finding the remainder value to convert it to seconds
        let minutes: string = (totalTime / 1000 / 60).toFixed(0)
        return `${minutes} min ${seconds} sec`;
    }

    // Hours Conversion
    if (totalTime >= 3600000){
        let seconds: string = ((totalTime / 1000) % 60 % 60).toFixed(0);
        let minutes: string = ((totalTime / 1000) % 60).toFixed(0)
        let hours: string = (totalTime / 1000 / 60 / 60).toFixed(0)
        return `${hours} hr ${minutes} min ${seconds} sec`;
    }

    return `${totalTime} ms`;
  }
}
