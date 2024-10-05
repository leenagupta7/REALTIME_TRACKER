const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const port = 3000 || process.env.PORT;
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connection
io.on("connection", function (socket) {
    console.log("A user connected");

    // Handle receiving location data from the client
    socket.on('send-location', function (data) {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on('disconnect', function () {
        io.emit('user-disconnected', socket.id);
    });
});

app.get("/", function (req, res) {
    res.render("index");
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
