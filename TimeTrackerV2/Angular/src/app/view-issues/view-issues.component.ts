import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { IssueCountService } from './issue-count.service';


interface Issue {
  bugReportID: number;
  category: 'bug' | 'account-access';
  description: string;
  name: string;
  type: string | null;
  username: string | null;
  replyEmail: string | null;
}

@Component({
  selector: 'app-view-issues',
  templateUrl: './view-issues.component.html',
  styleUrls: ['./view-issues.component.css']
})


export class ViewIssuesComponent implements OnInit {
  errMsg = '';
  loading = true;
  updating = false;
  unresolvedIssues: Issue[] = [];
  resolvedIssues: Issue[] = [];
  private readonly options = { withCredentials: true };

  constructor(private http: HttpClient, private issueCount: IssueCountService) {}

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    this.errMsg = '';
    forkJoin({
      unresolved: this.http.get<Issue[]>(`${environment.apiURL}/api/getUnresolvedIssues/`, this.options),
      resolved: this.http.get<Issue[]>(`${environment.apiURL}/api/getResolvedIssues/`, this.options),
    }).subscribe({
      next: ({ unresolved, resolved }) => {
        this.unresolvedIssues = unresolved;
        this.resolvedIssues = resolved;
        this.loading = false;
      },
      error: (response) => {
        this.loading = false;
        this.errMsg = response.error?.message || 'Could not load issues.';
      },
    });
  }

  replyLink(email: string): string {
    return 'mailto:' + encodeURIComponent(email).replace('%40', '@') +
      '?subject=' + encodeURIComponent('TimeTracker account help');
  }

  setResolved(issue: Issue, resolved: boolean): void {
    if (this.updating) return;
    this.updating = true;
    this.errMsg = '';
    const route = resolved ? 'markIssueResolved' : 'markIssueUnresolved';
    this.http.post(`${environment.apiURL}/api/${route}/`, {
      bugReportID: issue.bugReportID,
      category: issue.category,
    }, this.options).subscribe({
      next: () => {
        this.updating = false;
        this.issueCount.refresh();
        this.loadPage();
      },
      error: (response) => {
        this.updating = false;
        this.errMsg = response.error?.message || 'Could not update this issue.';
      },

    });
  }
}
