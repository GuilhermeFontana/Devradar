const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const routes = require('./routes');
const { setupWebsocket } = require('./websocket');

const app = express();
const server = http.Server(app);

setupWebsocket(server);

mongoose.connect('mongodb+srv://gui:gui@guicluster.lrzrjau.mongodb.net/dev-radar?retryWrites=true&w=majority')

app.use(cors({origin: true}))

app.use(express.json());
app.use(routes)

server.listen(3333);

console.log("Server listening on: http://localhost:3333");