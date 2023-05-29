
import app from './app.js';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http'; 
import { handleDisconnect, handleMessage} from './websocket/websocket.js';
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
import { v4 as uuidv4 } from "uuid";
import { runDbQueries } from './utils/runQuer.js';

//server port 
app.listen(8800, async () => {
    console.log("listen to server");
})

// migration -->single query,mut.. ,reexecution--> 

// queries to create tables 
runDbQueries();

//websocket 

const port = 8000;
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});


wsServer.on('connection', function (connection) {
    const userId = uuidv4();
    connection.on('open', () => console.log("connetion opened"));
    connection.on('message', (message) => handleMessage(message,userId,connection));
    connection.on('close', () => handleDisconnect(userId));
});
