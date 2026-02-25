import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatStatus',
  standalone: true,
})
export class FormatStatusPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/_/g, ' ');
  }
}
