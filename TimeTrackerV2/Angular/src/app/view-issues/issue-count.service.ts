import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IssueCountService {
  private readonly changes = new Subject<void>();
  readonly changes$ = this.changes.asObservable();

  refresh(): void {
    this.changes.next();
  }
}
