const https = require("https");
const http = require("http");
const fs = require("fs");

module.exports = function(config, app) {
  if (config.ssl.enabled) {
    return https.createServer(
      {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert)
      },
      app
    );
  } else {
    return http.createServer(app);
  }
};
