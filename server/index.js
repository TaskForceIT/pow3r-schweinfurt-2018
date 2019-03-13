const env = process.env.NODE_ENV || "development";
const config = require("./config.json")[env];
const path = require("path");
const express = require("express");
const app = express();
const server = require("./createServer")(config, app);
const cors = require("cors");
const io = require("socket.io")(server, {
  pingInterval: 10000,
  pingTimeout: 1000,
});
const generateRandomId = require("./idGenerator");
const detectUserAgent = require("./detectUserAgent");

const clients = [];
const dashboardClients = [];

const userAgents = {
  Android: 0,
  iOS: 0,
  Windows: 0,
  Unbekannt: 0,
};
let randomClient;

io.on("connection", client => {
  if (!client.handshake.query.dashboard) {
    client.customId = generateRandomId(clients);
    clients.push(client);
    client.emit("clientId", client.customId);
    userAgents[detectUserAgent(client)]++;
    console.log("Conndected: ", client.customId);
  } else {
    dashboardClients.push(client);
  }

  updateDashboards(dashboardClients);

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
    updateDashboards(dashboardClients);
  });
});

app.set("view engine", "pug");
app.use("/static", express.static("views"));
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
  // res.render("index", { url: config.url, port: config.port });
});

app.get("/dash", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/dashboard.html"));
});

app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/userlist.html"));
});

app.get("/selectUser", (req, res) => {
  if (randomClient) {
    randomClient.selected = false;
    randomClient.emit("deselected");
  }
  randomClient = clients[Math.floor(Math.random() * clients.length)];
  randomClient.selected = true;
  randomClient.emit("selected");
  res.statusCode = 200;
  console.log("random user selected");
  updateDashboards(dashboardClients);
  res.json({ success: true, selectedUser: randomClient.customId });
});

server.listen(config.port, () => {
  console.log(`Listening on ${config.url}:${config.port}`);
});

function updateDashboards(dashboardClients) {
  const userList = [];

  if (dashboardClients.length > 0) {
    clients.forEach(element => {
      userList.push({
        customId: element.customId,
        selected: element.selected,
      });
    });
    dashboardClients.forEach(dashboardClient => {
      dashboardClient.emit("userList", userList);
    });
    console.log("emit userlist");
  }
}
