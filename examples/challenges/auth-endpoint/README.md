# Example challenge: Auth endpoint

A complete, working example of a DevForces NodeJS challenge. Use it to smoke-test
the submit/judge pipeline end-to-end.

## What's here

```
auth-endpoint/
├── base/              # starter files — copied into each user's workspace on "join"
│   ├── package.json   # declares the user's runtime dep (express)
│   ├── app.js         # reference solution (exports the Express app)
│   └── index.js       # lets the user run the server manually in the terminal
├── tests.js           # the grader (jest + supertest) — injected into the pod at judge time
└── upload.sh          # pushes the above to the correct S3 keys
```

> `base/app.js` here is a **full reference solution** so all 7 tests pass — handy
> for verifying the pipeline. For a real contest, replace it with a stub
> (`// TODO` bodies) so contestants actually implement it.

## The contract the judge relies on

- The app file must `module.exports = app` and **must not** call `app.listen` at
  import time. `tests.js` uses **supertest**, which drives the app **in-process**
  (no server, no ports).
- The judge runs `npx jest tests.js --json` in `/workspace/<c>/<ch>/<u>/`. The
  runner image (`devforces-runner:v2.6+`) provides Node/npx + global jest +
  supertest. Score = `round(passed / total * max_points)` (7 tests here).

## S3 layout produced by `upload.sh`

```
s3://<bucket>/base/<CONTEST_ID>/challenges/<CHALLENGE_ID>/{package.json,app.js,index.js}
s3://<bucket>/contests/<CONTEST_ID>/challenges/<CHALLENGE_ID>/tests.js
```

## Usage

```bash
./upload.sh <CONTEST_ID> <CHALLENGE_ID> [bucket]   # default bucket: devforces
```

Then ensure the matching DB rows exist:
- `Challenge` row (`max_points` set, `tech_stack = NODEJS`)
- `ContestToChallengeMapping` for `(CONTEST_ID, CHALLENGE_ID)`
- `Contest` `status = ACTIVE`

## `express` resolvability in the pod

`tests.js → app.js → require("express")`. Pods have no outbound internet, so the
user cannot `npm install express` in the workspace. As of runner image **v2.7+**,
`express` is installed globally alongside jest/supertest with `NODE_PATH` set, so
this challenge runs offline out of the box. A challenge needing **other**
dependencies must ship them in `base/node_modules/` (or rely on pod egress). This
app intentionally depends on **express only** (the token is hand-rolled base64).

## Run it locally (optional sanity check)

```bash
cd base && npm install
cp ../tests.js .
npx jest tests.js
```
