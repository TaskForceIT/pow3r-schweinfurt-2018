const fs = require("fs");
const path = require("path");
const app = require("express")();
const https = require("https");
const http = require("http");
const generateRandomId = require("./idGenerator");

let server;
if (fs.existsSync("/etc/letsencrypt/live/p3.taskforce-it.de/privkey.pem")) {
  server = https.createServer(
    {
      key: fs.readFileSync(
        "/etc/letsencrypt/live/p3.taskforce-it.de/privkey.pem"
      ),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/p3.taskforce-it.de/fullchain.pem"
      )
    },
    app
  );
} else {
  server = http.createServer(app);
}

const io = require("socket.io")(server);

let clients = [];
let userAgents = {
  Android: 0,
  iOS: 0,
  Windows: 0,
  Unbekannt: 0
};
let randomClient;

io.on("connection", client => {
  let userAgent = client.handshake.headers["user-agent"];
  if (!client.handshake.query.admin) {
    client.customId = generateRandomId(clients);
    clients.push(client);
    client.emit("clientId", client.customId);
    if (userAgent.match(/windows/gi)) {
      userAgents.Windows++;
    } else if (userAgent.match(/android/gi)) {
      userAgents.Android++;
    } else if (userAgent.match(/mac os/gi)) {
      userAgents.iOS++;
    } else {
      userAgents.Unbekannt++;
    }
  }

  io.sockets.emit("users", clients.length);
  io.sockets.emit("user-agents", userAgents);

  client.on("admin", data => {
    randomClient = clients[Math.floor(Math.random() * clients.length)];
    randomClient.emit("selection");
  });

  client.on("sendMessage", data => {
    if (client.id === randomClient.id) {
      console.log("Sending message", data);
      io.sockets.emit(
        "message",
        "Präsentation ist cool. Die Task Force Leute haben es echt drauf!"
      );
    }
  });

  client.on("disconnect", () => {
    console.log(`client: ${client.customId} disconnected`);
    let index = clients.filter((element, index) => {
      if (client.id === element.id) {
        let thisUserAgent = element.handshake.headers["user-agent"];

        if (thisUserAgent.match(/windows/gi)) {
          userAgents.Windows--;
        } else if (thisUserAgent.match(/android/gi)) {
          userAgents.Android--;
        } else if (thisUserAgent.match(/mac os/gi)) {
          userAgents.iOS--;
        } else {
          userAgents.Unbekannt--;
        }
        return index;
      }
    });
    clients.splice(index, 1);
    io.sockets.emit("user-agents", userAgents);
    io.sockets.emit("users", clients.length);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/admin.html"));
});

app.get("/dash", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/dashboard.html"));
});

server.listen(443, () => {
  console.log("Listening on http://localhost:443");
});
