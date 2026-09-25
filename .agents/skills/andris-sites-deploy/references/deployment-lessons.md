# Deployment lessons

Append a short, sanitized record when a deployment or release check reveals a new failure. Preserve the date, trigger, cause, fix, proof, and preventive action. Never include credentials, environment-file contents, private customer data, or complete URLs that contain tokens.

## 2026-09-25 — Sites packaging under Windows

- **Trigger:** The Sites publishing helper tried to invoke npm directly from a POSIX shell, then a WSL archive path lacked Node.js.
- **Cause:** The helper crossed shell/runtime boundaries: Windows npm was not resolvable as a POSIX command, and WSL did not have the Node runtime used by the project scripts.
- **Fix:** Run project scripts through `cmd.exe /d /s /c "npm run …"` in the app directory. When the helper cannot package the output, use the repository's Node staging script and a Windows tar implementation, then validate the declared static directory and its `index.html` before upload.
- **Proof:** The staging script completed; the generated archive contained the static hosting manifest and homepage; Sites accepted the saved version and deployment reached success.
- **Prevent:** Detect the host shell before invoking package scripts. Prefer a single native runtime for build and packaging, and validate the archive before making a release.

## 2026-09-25 — Supabase migration history drift

- **Trigger:** A production deployment review found the same six migration names locally and remotely, but the local `0007`–`0012` prefixes did not match the timestamp IDs recorded by Supabase.
- **Cause:** The schema changes had been recorded remotely with timestamp IDs while the repository retained numbered filenames. Matching names alone hid the history mismatch and could make a future `db push` treat already-applied SQL as pending.
- **Fix:** Matched local files to the exact remote IDs, preserved their SQL byte-for-byte, updated the CMS download catalog, and did not run DDL against production again.
- **Proof:** Supabase reports 15 applied migration records; the app build emitted all 15 files with matching version IDs and the CMS browser checks passed.
- **Prevent:** Compare exact version IDs and names before deploying schema work. Treat ID/name drift as a release blocker until reconciled; do not use blind `db push` or manually rerun SQL on the active database.

## 2026-09-25 — GitHub push protection

- **Trigger:** GitHub rejected a normal push because a pre-existing unpublished commit contained an embedded credential in a development screenshot helper.
- **Cause:** A local-only helper with authentication material had been included in unpublished history.
- **Fix:** Remove the unused helper from unpublished commits, rewrite only local unpublished history, scan the rewritten range, and push as a normal fast-forward. Do not use a secret-scanning bypass.
- **Proof:** The credential-pattern scan returned no matches in the rewritten range; GitHub accepted the normal push.
- **Prevent:** Keep local credentials in ignored environment files, review staged files and secret-scan output before commit, and avoid embedding login data in scripts.

## 2026-09-25 — CI build reproduction isolation

- **Trigger:** A local attempt to reproduce GitHub CI from a separate worktree failed before compilation.
- **Cause:** The reproduction linked `node_modules` from outside Turbopack's filesystem root; that setup is not representative of GitHub's `npm ci` job.
- **Fix:** Reproduce from a clean source archive and install dependencies inside that copy. Do not use an external `node_modules` junction as evidence of an application build failure.
- **Proof:** Pending clean-copy build and the next GitHub Actions result.
- **Prevent:** Keep CI reproductions self-contained, with dependencies installed inside the checked-out project and local secret files excluded.

## 2026-09-25 — GitHub Actions lacked Supabase build configuration

- **Trigger:** GitHub's `Build GPT Sites artifact` failed while collecting `/proyectos/[slug]` after unit, lint, and type checks passed.
- **Cause:** The workflow did not pass the Supabase URL and anonymous key to the build. The static API generator therefore emitted zero project records, while server-rendered project pages still selected the Supabase repository and attempted a relative PostgREST URL, which Node cannot resolve.
- **Fix:** Store `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as encrypted repository Actions secrets, map them into the quality job, and preflight them before building. Keep the canonical public site URL and settings flag in the workflow environment.
- **Proof:** A clean source archive with dependencies installed locally and the same two environment variables generated all three project details and successfully prerendered all 15 routes.
- **Prevent:** Confirm CI receives the same public content configuration required by the static build. Never commit the key; fail with a clear missing-secret message before `next build`.
