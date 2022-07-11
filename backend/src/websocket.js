const socket = require('socket.io');

const parseStringAsArray = require('./utils/parseStringAsArray')
const calculateDistance = require('./utils/calculateDistance')


let io
const connections = []

exports.setupWebsocket = (server) => {
    io = socket(server);

    io.on('connection', socket => {
        connections.push({
            id: socket.id,
            coordinates: {
                latitude: Number(socket.handshake.query.latitude),
                longitude: Number(socket.handshake.query.longitude)
            },
            distance: socket.handshake.query.distance,
            techs: parseStringAsArray(socket.handshake.query.techs)
        })
    })
}

exports.findAllConnections = () => {
    return connections
}

exports.findConnections = (coords, techs) => {
    return connections.filter(connection => {
        return calculateDistance(coords, connection.coordinates) < (connection.distance ?? 1) * 10000 
            && (connection.techs[0] === '' || connection.techs.some(tech => techs.includes(tech)))
    })
}

exports.sendMessage = (to, message, data) => {
    to.forEach(connection => {
        io.to(connection.id).emit(message, data)
    })
}