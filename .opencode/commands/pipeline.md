---
description: Run review → test → validate pipeline on recent changes
agent: build
---

Run the full quality pipeline on the `app/` directory.

## Stage 1: Review
Invoke @reviewer to review the code changes against `specs/core.md` and the relevant work packages.
- Check for correctness, quality, and spec alignment
- Identify bugs, security issues, and design problems
- End with `VERDICT: PASS` or `VERDICT: FAIL`

## Stage 2: Test
Invoke @tester to write and run tests for the implemented work packages.
- Cover happy paths, edge cases, and error conditions
- Run the tests and report results
- End with `VERDICT: PASS` or `VERDICT: FAIL`

## Stage 3: Validate
Invoke @validator to compare the implementation against every acceptance criterion in `specs/core.md`.
- Produce a structured validation report with pass/fail per AC
- Run the build and existing tests
- End with `VERDICT: PASS` or `VERDICT: FAIL`

## On Failure
If any stage returns `VERDICT: FAIL`:
1. Save the failure details to `.state/` as JSON
2. Report what failed and why
3. Suggest which work packages need rework

## On Success
If all three stages pass:
1. Save the results to `.state/` as JSON
2. Report the successful validation

$ARGUMENTS
