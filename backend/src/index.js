// Local dev / VM entrypoint. Wraps the Express app from src/app.js in a
// listening server. On Vercel this file is NOT executed — Vercel imports
// api/index.js which re-exports the app directly to the serverless runtime.

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
