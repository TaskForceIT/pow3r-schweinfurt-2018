const env = process.env.NODE_ENV || "development";
const config = require("./config.json")[env];
const path = require("path");
const express = require("express");
const app = express();
const server = require("./createServer")(config, app);
const cors = require("cors");
const io = require("socket.io")(server);
const generateRandomId = require("./idGenerator");
const detectUserAgent = require("./detectUserAgent");

const clients = [];
const userAgents = {
  Android: 0,
  iOS: 0,
  Windows: 0,
  Unbekannt: 0,
};
let randomClient;

io.on("connection", client => {
  client.customId = generateRandomId(clients);
  clients.push(client);
  client.emit("clientId", client.customId);
  userAgents[detectUserAgent(client)]++;
  console.log("Conndected: ", client.customId);
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

app.set("view engine", "pug");
app.use("/static", express.static("views"));
app.use(cors());

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname + "/views/index.html"));
  res.render("index", { url: config.url, port: config.port });
});

app.get("/dash", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/dashboard.html"));
});

server.listen(config.port, () => {
  console.log(`Listening on ${config.url}:${config.port}`);
});
