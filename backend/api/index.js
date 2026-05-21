// Vercel serverless entrypoint. Vercel's @vercel/node runtime expects a
// default-exported request handler — Express's `app` is one, so we just
// import the existing app and re-export.
//
// The traditional `node src/index.js` for local dev still works; this file
// only matters for production-on-Vercel.

const app = require('../src/app');

module.exports = app;
