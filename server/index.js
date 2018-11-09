const config = require("./config.json");
const path = require("path");
const app = require("express")();
const server = require("./createServer")(config, app);
const io = require("socket.io")(server);
const generateRandomId = require("./idGenerator");
const detectUserAgent = require("./detectUserAgent");

let clients = [];
let userAgents = {
  Android: 0,
  iOS: 0,
  Windows: 0,
  Unbekannt: 0
};
let randomClient;

io.on("connection", client => {
  if (!client.handshake.query.admin) {
    client.customId = generateRandomId(clients);
    clients.push(client);
    client.emit("clientId", client.customId);
    userAgents[detectUserAgent(client)]++;
    console.log("Connected: ", client.customId);
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
    console.log("Disconnected: ", client.customId);
    let index = clients.filter((element, index) => {
      if (client.id === element.id) {
        userAgents[detectUserAgent(element)]--;
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

server.listen(config.port, () => {
  console.log("Listening on port ", config.port);
});
