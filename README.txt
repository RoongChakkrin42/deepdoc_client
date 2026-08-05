===============================================================================
DeepDoc Client  —  submission and review interface
Front end  ·  Next.js 15 · TypeScript · MUI 7 · Redux Toolkit
===============================================================================

Companion repository: deepdoc (the NestJS API)
Full technical documentation with code walkthroughs: README.md


-------------------------------------------------------------------------------
1. WHAT THIS IS  (for non-technical readers)
-------------------------------------------------------------------------------

The web interface for DeepDoc, a system that uses Google's Gemini AI to grade
Thai university project reports against an official 100-point rubric.

It has two audiences and two screens:

  /submit    Public. A department fills in its details and uploads its project
             report plus supporting evidence documents, one upload slot per
             assessment criterion.

  /results   Reviewers only, behind a login. A ranked table of every submission
             for a given year, with per-criterion scores. Opening a row shows
             the AI's written justification for each score and links to the
             original PDFs.

Because grading takes time, a submission does not block the browser. The upload
returns immediately and the results screen updates itself as the AI finishes.


-------------------------------------------------------------------------------
2. WHAT IT DEMONSTRATES  (for technical readers)
-------------------------------------------------------------------------------

  THE FORM BUILDS ITSELF FROM THE API
  /submit hardcodes no fields. It fetches GET /submissions/form-schema on mount
  and generates a section per rubric dimension and an upload field per
  criterion, using the multipart field names the server specifies. Adding an
  assessment criterion on the backend makes a new field appear here with no
  change to this repository. Before the rewrite the same field names were
  duplicated across the React form, the server's controller and its upload
  configuration — and had already drifted out of sync, so the form was silently
  failing to collect four of the fifteen required document types.

  ASYNCHRONOUS WORK IS REPRESENTED HONESTLY
  Grading takes tens of seconds, so the API returns 202 Accepted immediately.
  The results page polls, but only while at least one submission is actually
  pending or processing, and it stops as soon as everything has settled. Each
  row carries a status chip; failures show their reason and can be re-run from
  the table without re-uploading anything.

  ONE PLACE TALKS TO THE NETWORK
  src/lib/api.ts holds the axios instance, the bearer-token interceptor, and a
  401 handler that spends the refresh token once, replays the failed request,
  and clears the session if that also fails. Concurrent 401s share a single
  in-flight refresh rather than each starting their own.

  FAILURE MODES ARE DESIGNED, NOT DISCOVERED
  Requests carry a timeout, because a backend that accepts a TCP connection but
  never answers would otherwise leave the UI on a spinner forever with nothing
  to report. Uploads get a separate, longer budget. Error messages name the URL
  that was actually called, which turns "it's stuck" into a diagnosable report.

  TYPED AGAINST THE SERVER
  src/lib/types.ts mirrors the API's response payloads, so a change in the
  backend's shape surfaces as a compile error rather than an undefined at
  runtime.


-------------------------------------------------------------------------------
3. STRUCTURE
-------------------------------------------------------------------------------

  src/pages/         _app, index (redirect), submit, results
  src/components/    Layout, LoginDialog, submit/, results/
  src/lib/           api.ts (network layer), types.ts (API contract)
  src/store/         Redux Toolkit + redux-persist
  src/theme.ts       MUI theme

Session state is persisted to localStorage behind a PersistGate, so a page
refresh no longer logs the reviewer out. The store swaps in a no-op storage
during server-side rendering, because redux-persist reaches for localStorage at
import time and that does not exist on the server.


-------------------------------------------------------------------------------
4. RUNNING IT
-------------------------------------------------------------------------------

  npm install
  cp .env.example .env.local      # point NEXT_PUBLIC_BACKENDURL at the API
  npm run dev                     # http://localhost:3000

  npm run build
  npm run lint

The API from the deepdoc repository must be running, and this app's origin must
be listed in that server's CORS_ORIGINS.

Note that .env.local takes precedence over .env in Next.js. If requests are
going somewhere unexpected, check .env.local first.


-------------------------------------------------------------------------------
5. PROJECT BACKGROUND
-------------------------------------------------------------------------------

Originally written as a favour for a lecturer at Chulalongkorn University, and
never deployed for real use. Rebuilt as a portfolio piece.

The rewrite converted the entire codebase from JavaScript to TypeScript, split
an 818-line form component into a data-driven one, removed a dead page that
called an endpoint which no longer existed, connected the session persistence
that had been installed as a dependency but never wired up, enabled the form
validation that had been written and then commented out, and removed a working
set of administrator credentials that had been committed to the repository as
default form state.
