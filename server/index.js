const env = process.env.NODE_ENV || "development";
const config = require("./config.json")[env];
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
let dashboardClient;
let adminClient;

io.on("connection", client => {
  if (client.handshake.query.admin) {
    adminClient = client;
    adminClient.on("admin", () => {
      console.log("select random client");
      if (randomClient) {
        console.log("deselect random");
        randomClient.emit("deselected");
      }
      randomClient = clients[Math.floor(Math.random() * clients.length)];
      console.log(randomClient.customId + " selected");
      randomClient.emit("selected");
    });
  } else if (client.handshake.query.dashboard) {
    dashboardClient = client;
  } else {
    client.customId = generateRandomId(clients);
    clients.push(client);
    client.emit("clientId", client.customId);
    userAgents[detectUserAgent(client)]++;
    console.log("Connected: ", client.customId);
  }

  io.sockets.emit("users", clients.length);
  io.sockets.emit("user-agents", userAgents);

  client.on("sendMessage", data => {
    if (client.id === randomClient.id) {
      console.log("Sending message", data);
      io.sockets.emit(
        "message",
        "Diese Präsentation ist cool. Die Task Force Leute haben es echt drauf!"
      );
    }
  });

  client.on("disconnect", () => {
    console.log("Disconnected: ", client.customId);
    clients.filter((element, index) => {
      if (client.id === element.id) {
        userAgents[detectUserAgent(element)]--;
        clients.splice(index, 1);
      }
    });
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
  console.log(`Listening on ${config.url}:${config.port}`);
});
