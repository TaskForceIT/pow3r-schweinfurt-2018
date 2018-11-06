const fs = require("fs");
const app = require("express")();
const server = require("https").createServer(
  {
    key: fs.readFileSync("/etc/letsencrypt/live/p3.gueney.org/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/p3.gueney.org/fullchain.pem")
  },
  app
);
const io = require("socket.io")(server);
const generateId = require("./idGenerator");
const path = require("path");

let clients = [];
let userAgents = [];
let randomClient;

io.on("connection", client => {
  if (!client.handshake.query.admin) {
    client.customId = generateRandomId();
    clients.push(client);
    console.log(`client: ${client.customId} connected`);
    client.emit("clientId", client.customId);
  }

  io.sockets.emit("users", clients.length);

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
        return index;
      }
    });
    clients.splice(index, 1);
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

server.listen(3000, () => {
  console.log("Listening on http://localhost:443");
});

function generateRandomId() {
  let customId;
  let exists = [];

  do {
    customId = generateId();
    exists = clients.filter(element => element.customId === customId);
  } while (exists.length);
  return customId;
}
