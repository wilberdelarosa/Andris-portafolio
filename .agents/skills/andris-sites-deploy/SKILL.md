---
name: andris-sites-deploy
description: "Prepare, publish, and verify this Andris portfolio on GPT Sites; use when deploying, repairing a failed Sites release, or handing off its publication workflow."
---

# Andris portfolio deployment to GPT Sites

Use this skill for the application in `app/` and its existing GPT Sites project. The goal is to publish the exact validated source revision, keep secrets out of Git, and make each deployment failure reduce the chance of the same failure recurring.

## Project-specific delivery contract

- Read the root `AGENTS.md`, the app's `README.md`, `app/.openai/hosting.json`, and `docs/AI-DEV-PLAYBOOK-2026.md` before changing release configuration.
- The root repository and the nested `app/` repository are separate Git repositories in the working checkout. Inspect and report both statuses before committing. Keep each source commit and Sites version tied to the same app source state.
- Reuse the project and static directory already configured in `app/.openai/hosting.json`; do not create another Site.
- The app currently publishes a Next.js static export. Use the `build:sites` script and stage the declared output directory. Do not assume a Cloudflare Worker or local Next server is part of the Sites runtime.
- Use the configured Sites tools to save a version, publish it, wait for success, and verify the live URL and custom domains. Never report success based only on a successful upload request.
- Do not expose, print, commit, or place in logs `.env*`, `.dev.vars`, Supabase credentials, access tokens, passwords, or signed URLs. Public client configuration may be compiled into the static app; server secrets must never be.
- Follow `sites-compatibility-check` for static artifact validation and `andris-portfolio-main-ready` for this repository's main-branch and release invariants.

## Deployment workflow

1. Inspect repository state, remotes, current branch, latest commit, package manager, build scripts, hosting manifest, environment requirements, and current Sites version/deployment. Preserve unrelated user changes.
2. Check that project data and migrations are present and current when the release includes schema or CMS changes. Compare both remote migration version IDs and names with local files; matching names under different IDs are history drift. Verify each mapping and reconcile file IDs before publishing, and never blindly reapply a migration already recorded remotely. Use the Supabase skill for database operations; never assume a local `.env` proves that production is configured.
3. Run the app's required lint, typecheck, unit/contract, build, and relevant browser checks. Build from a clean generated-output directory. Confirm expected routes, `index.html`, generated API snapshots, migrations, media, and manifest are in the actual artifact.
4. If a validation fails, stop before publication. Capture the failing command, relevant redacted error, and environment (OS, Node version, package manager, build mode). Find the cause, implement the smallest safe correction, and rerun the failed check plus affected release checks. Do not bypass the gate. Permit at most one deployment retry after a verified correction; if it still fails, leave production untouched and report the specific blocker.
5. Run GitNexus impact analysis before changing a function, class, or method when the project's instructions require it; run GitNexus change detection before committing. Review staged files and secret patterns. Commit and push the intended main changes without force-pushing.
6. Build and package the exact pushed app revision. Save a new version for the existing Sites project, deploy that saved version, wait for terminal success, and check the live homepage plus representative direct routes and custom domains.
7. Add every new failure and its verified resolution to [deployment lessons](references/deployment-lessons.md). Redact all sensitive values. Include the trigger, actual cause, fix, checks that proved the fix, and a preventive step. Update this skill's workflow only when a lesson demonstrates a general improvement; do not encode one-off accidents as universal rules.

## Reporting

Report the source commit, app source commit when applicable, Sites version/deployment result, live URL, checks run, and any remaining limitation. Distinguish an active production release from a locally validated or merely uploaded artifact. Never claim a release is error-free; state what was verified and what could not be verified.
