var express = require('express');
var cors = require('cors'); // Use cors module for enable Cross-origin resource sharing

const port = process.env.PORT || 8080;
const app = express();
app.use(cors()); // for all routes

app.settings.port = port; // TODO better?

(require('./repl.js'))(app);
(require('./getschema.js'))(app);
(require('./readconfig.js'))(app);
//(require('./writeconfig.js'))(app);

app.listen(port, function handleSuccess() {
  console.log(`backend listening on http://localhost:${port}/`)
})
