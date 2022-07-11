import socketio from "socket.io-client"
import { env } from '../configs/env';


const socket = socketio(`${env.API_URL}${env.API_PORT}`, {
    autoConnect: false
});


function connect(
    latitude: number | undefined, 
    longitude: number | undefined, 
    distance: number, 
    techs: string | undefined
) {

    socket.io.opts.query = { 
        latitude, 
        longitude, 
        distance, 
        techs 
    };

    socket.connect();
}

function disconnect() {
    if (socket.connected)
        socket.disconnect();
}

function subscribeToNewDevs(subscribeCallback: any) {
    socket.on('new-dev', subscribeCallback);
}

export {
    connect,
    disconnect,
    subscribeToNewDevs
}