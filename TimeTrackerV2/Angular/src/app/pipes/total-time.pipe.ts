import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'totalTimePipe'
})
export class TotalTimePipe implements PipeTransform {

  transform(totalTime: number): string {
    if (totalTime < 60000)
      return `${(totalTime / 1000).toFixed(2)} sec`;

    // Megabyte conversion
    if (totalTime >= 60000 && totalTime < 3600000)
      return `${(totalTime / 1000 / 60).toFixed(2)} min`;

    // Gigabyte conversion
    if (totalTime >= 3600000)
      return `${(totalTime / 1000 / 60 / 60).toFixed(2)} hr`;

    return `${totalTime} ms`;
  }
}
