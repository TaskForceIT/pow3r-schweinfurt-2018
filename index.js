const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let numberOfClients = 0;

io.on("connection", client => {
  numberOfClients++;
  io.sockets.emit("users", numberOfClients);

  client.on("disconnect", () => {
    numberOfClients--;
    io.sockets.emit("users", numberOfClients);
  });
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
