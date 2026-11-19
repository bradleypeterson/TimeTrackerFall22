# Sprint 5 — Password Recovery Testing

Tester: Su Man
Environment: Local Docker Compose, Angular, Express, SQLite, Mailpit
Hours reported: Week 1 — 6 hours; Week 2 — 7 hours; total — 13 hours.

## Password-reset API results

| Test | Expected | Actual | Result |
|---|---|---|---|
| Missing password and salt | 400 | 400 | PASS |
| Missing salt | 400 | 400 | PASS |
| Invalid password hash | 400 | 400 | PASS |
| Invalid salt | 400 | 400 | PASS |
| Invalid user ID | 400 | 400 | PASS |
| Admin targets nonexistent account 39 | 404 | 404, Account not found | PASS |
| Student targets another ID (unused ID 39) | 403 | 403, permission denied | PASS |
| Logged-out password-reset request | 401 | 401, login required | PASS |
| Incorrect current password during self-service change | Rejected; existing password remains usable | Confirmed by tester | PASS |

The unused-ID authorization test checks permission rejection before account lookup.
It does not test changing another existing account.

Credential fingerprints were reported unchanged across rejection tests.
The initial fingerprint pasted into chat was abbreviated; retain the full
terminal values or screenshots as comparison evidence.

## Other manual verification

- Successful password change, old-password rejection, and new-password login
  were reported working by the tester.
- Server logout returned 200; subsequent protected recovery requests returned 401.
- Student and instructor logout checks returned 401 after logout.
- Admin backend logout was tested directly.
- Setup rejects the account's current verified recovery email.
- A different email replaces the existing address after verification.
- Verification page opens without requiring login.

## Implementation

- Validate password-hash, salt, and target-ID formats.
- Authorize password changes using the server session and current database role.
- Require non-admin users to confirm their current password.
- Update credentials and invalidate recovery tokens in one transaction.
- Destroy the server session on logout.
- Reject duplicate setup of an account's current verified recovery email.
- Clear setup form inputs after successful email delivery.

## Remaining limitations and review

- Email delivery was tested with Mailpit; real inbox delivery is not verified.
- Production SMTP, session storage, cookie, and origin configuration require review.
- Password changes invalidate recovery links but do not revoke other existing sessions.
- Teammate PR review and feedback resolution remain pending.
- Request account help is a future enhancement, outside this sprint.
