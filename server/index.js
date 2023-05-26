import express from 'express';
import { db } from './DB/createTable.js';
const app = express();
import authRoutes from './routes/auth.js';
import { QUERIES } from './DB/initial-queries.js';
import cors from "cors";
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http'; 
import { handleDisconnect, handleMessage} from './websocket/websocket.js';
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
import { v4 as uuidv4 } from "uuid";
import { runDbQueries } from './utils/runQuer.js';


//middleware
app.use(express.json());
app.use(cors());


//user route
app.use("/api", authRoutes);


// migration -->single query,mut.. ,reexecution--> 

// queries to create tables 


runDbQueries();

//server port 
app.listen(8800, async () => {
    console.log("listen to server");
})



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

// module.exports = app;
export default app;