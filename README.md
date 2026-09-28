# Secure Application Integration — EdVyro Task 3

This project connects an internship frontend to a Node.js/Express API and adds a secure application workflow.

## Included
- API-driven internship loading
- Visible loading and failure states
- Search and domain filtering
- Client-side HTML validation
- Server-side validation
- Application persistence in SQLite
- Helmet secure headers
- Express rate limiting
- Parameterized SQLite queries
- Integration tests for successful and rejected submissions
- Responsive frontend

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000`

## Run tests

```bash
npm test
```

## Test flow
1. Open the site.
2. Wait for internship records from `/api/internships`.
3. Filter/search records.
4. Select an internship and submit a valid application.
5. Try an invalid email/short cover letter to see rejection.
6. `npm test` runs automated integration checks.

## Submission
Upload the complete project to a public GitHub repository and submit that single repository URL as the proof link.

The included records are predictable fictional integration-test records. If EdVyro's downloadable "Integration test records" file is provided, replace the demo records with the supplied records before final submission.
