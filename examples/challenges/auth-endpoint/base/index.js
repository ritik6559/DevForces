const app = require("./app");

// Lets the user run the server manually in the IDE terminal (`node index.js`).
// The judge does NOT use this file — it imports `app` directly via supertest.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth API listening on ${PORT}`));
