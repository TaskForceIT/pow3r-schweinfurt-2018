const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connection", client => {
  console.log("client connected");
  client.on("event", data => {
    console.log(data);
  });
  client.on("disconnect", () => {
    console.log("client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
