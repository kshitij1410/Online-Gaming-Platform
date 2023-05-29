import { typesDef } from "./eventTypes.js";
import { v4 as uuidv4 } from "uuid";
import { WebSocket, WebSocketServer } from 'ws';

//declare obj
const clients = {};
const mapping_user_with_game_id = {};
const global_random_gamesIds = {};
const global_tournament_gamesIds = {};


const broadcastMessage = (_type, _event) => {

    // random game
    if (_event === typesDef.RANDOM_GAME_EVENT) {
        for (let gameId in global_random_gamesIds) {
            
            const json = { type: _type, event: _event, data: { ...global_random_gamesIds[gameId], gameId} }
            
            const data = JSON.stringify(json);

            global_random_gamesIds[gameId].users_id.map((id) => {
                const conn = clients[id];
               
                if (conn._readyState === WebSocket.OPEN) {
                    conn.send(data);
                }
            })

        }
    }


    //for tournament games; 
    if (_event === typesDef.TOURNAMENT_GAME_EVENT) {

        for (let gameId in global_tournament_gamesIds) {

            // if(global_tournament_gamesIds[gameId].users_id===2)
            // {
            //     timeout();
            // }

            const json = { type: _type, event: _event, data: { ...global_tournament_gamesIds[gameId], gameId, } }
            const data = JSON.stringify(json);

            global_tournament_gamesIds[gameId].users_id.map((id) => {
                const conn = clients[id];
                if (conn.readyState === WebSocket.OPEN) {
                    conn.send(data);
                }
            })

        }
    }

}

//message :----


export const handleMessage = (message, userId, connection) => {

    clients[userId] = connection;
    // console.log(`${userId} connected.`);

    //userdata
    const dataFromClient = JSON.parse(message);

    //random game event
    if (dataFromClient.type === typesDef.RANDOM_GAME_EVENT) {
        const email = dataFromClient.email;
        const id =dataFromClient.user_id;
        let game_id = null;


        //NO GAME ID EXIST
        if (Object.keys(global_random_gamesIds).length === 0) {
            game_id = uuidv4();

            global_random_gamesIds[game_id] = {
                emails: [],
                users_id: [],
                paddle: [],
                ball: [],
                score: [],
                ids:[]
            }
            console.log("empty obj")
        }
        else {

            //check for any odd user connecting with particular game_id

            for (let gameId in global_random_gamesIds) {

                if (global_random_gamesIds[gameId].users_id.length === 1) {
                    game_id = gameId;
                    console.log("inside for loop")
                    break;
                }
            }

        }
        console.log("game_id", game_id);

        //even number of person connecting to particular game id

        if (game_id === null) {
            game_id = uuidv4();
            global_random_gamesIds[game_id] = {
                emails: [],
                users_id: [],
                paddle: [],
                ball: [],
                score: [],
                ids:[]

            }
        }

        global_random_gamesIds[game_id].users_id.push(userId);
        global_random_gamesIds[game_id].emails.push(email);
        global_random_gamesIds[game_id].ids.push(id);
        mapping_user_with_game_id[userId] = game_id;
        broadcastMessage(dataFromClient.type, dataFromClient.type);
    }
    else if (dataFromClient.type === typesDef.TOURNAMENT_GAME_EVENT) {


        const email = dataFromClient.email;
        let game_id = null;
        const id =dataFromClient.user_id;

        //NO GAME ID EXIST
        if (global_tournament_gamesIds === {}) {
            game_id = uuidv4();

            global_tournament_gamesIds[game_id] = {

                emails: [],
                users_id: [],
                paddle: [],
                ball: [],
                score: [],
                ids:[]
            }
            console.log("empty")
        }
        else {

            //check for any odd user connecting with particular game_id


            for (let gameId in global_tournament_gamesIds) {

                if (global_tournament_gamesIds[gameId].users_id.length === 1) {
                    game_id = gameId;
                    console.log("inside for loop")
                    break;
                }
            }


        }

        //even number of person connecting to particular game id

        if (game_id === null) {
            game_id = uuidv4();
            global_tournament_gamesIds[game_id] = {

                emails: [],
                users_id: [],
                paddle: [],
                ball: [],
                score: [],
                ids:[]
            }
        }



        global_tournament_gamesIds[game_id].users_id.push(userId);
        global_tournament_gamesIds[game_id].emails.push(email);
        global_tournament_gamesIds[game_id].ids.push(id);
        mapping_user_with_game_id[userId] = game_id;
        broadcastMessage(dataFromClient.type, dataFromClient.type);

    }
    else if (dataFromClient.type === typesDef.PADDLE_EVENT) {
        const paddle1 = dataFromClient.paddle1;
        const paddle2 = dataFromClient.paddle2;
        const game_id = dataFromClient.game_id;
        const playerId = dataFromClient.playerId;

        let event = null;
        if (global_random_gamesIds.hasOwnProperty(game_id)) {
            //random games paddle movement
            event = typesDef.RANDOM_GAME_EVENT

            if (global_random_gamesIds[game_id].paddle.length < 2)
                global_random_gamesIds[game_id].paddle.push([paddle1, paddle2]);
            else {
                if (playerId === 1) {
                    global_random_gamesIds[game_id].paddle.shift();
                    global_random_gamesIds[game_id].paddle.unshift([paddle1, paddle2])
                }
                else {
                    global_random_gamesIds[game_id].paddle.pop();
                    global_random_gamesIds[game_id].paddle.push([paddle1, paddle2])
                }
            }

        }
        else if (global_tournament_gamesIds.hasOwnProperty(game_id)) {
            event = typesDef.TOURNAMENT_GAME_EVENT;
            //tournament paddle movement
            if (global_tournament_gamesIds[game_id].paddle.length < 2)
                global_tournament_gamesIds[game_id].paddle.push([paddle1, paddle2]);
            else {
                if (playerId === 1) {
                    global_tournament_gamesIds[game_id].paddle.shift();
                    global_tournament_gamesIds[game_id].paddle.unshift([paddle1, paddle2])
                }
                else {
                    global_tournament_gamesIds[game_id].paddle.pop();
                    global_tournament_gamesIds[game_id].paddle.push([paddle1, paddle2])
                }
            }
        }


        broadcastMessage(dataFromClient.type, event);

    }
    else if (dataFromClient.type === typesDef.BALL_EVENT) {
        const x = dataFromClient.x;
        const y = dataFromClient.y;
        const game_id = dataFromClient.game_id;

        let event = null;
        if (global_random_gamesIds.hasOwnProperty(game_id)) {
            //random games paddle movement
            event = typesDef.RANDOM_GAME_EVENT

            if (global_random_gamesIds[game_id].ball.length === 1) {
                global_random_gamesIds[game_id].ball.pop();
                global_random_gamesIds[game_id].ball.push([x, y]);
            } else {
                global_random_gamesIds[game_id].ball.push([x, y]);
            }

        }
        else if (global_tournament_gamesIds.hasOwnProperty(game_id)) {
            event = typesDef.TOURNAMENT_GAME_EVENT;
            // tournament paddle movement

            if (global_tournament_gamesIds[game_id].ball.length === 1) {
                global_tournament_gamesIds[game_id].ball.pop();
                global_tournament_gamesIds[game_id].ball.push([x, y]);
            } else {
                global_tournament_gamesIds[game_id].ball.push([x, y]);
            }
        }


        broadcastMessage(dataFromClient.type, event);

    }
    else if (dataFromClient.type === typesDef.SCORE_EVENT) {
        const game_id = dataFromClient.game_id;
        const leftScore = dataFromClient.left;
        const rightScore = dataFromClient.right;

        let event = null;
        if (global_random_gamesIds.hasOwnProperty(game_id)) {
            //random games paddle movement
            event = typesDef.RANDOM_GAME_EVENT


            if (global_random_gamesIds[game_id].score.length === 1) {
                global_random_gamesIds[game_id].score.pop();
                global_random_gamesIds[game_id].score.push([leftScore, rightScore]);
            } else {
                global_random_gamesIds[game_id].score.push([leftScore, rightScore]);
            }
        }
        else if (global_tournament_gamesIds.hasOwnProperty(game_id)) {
            event = typesDef.TOURNAMENT_GAME_EVENT;
            //tournament paddle movement


            if (global_tournament_gamesIds[game_id].score.length === 1) {
                global_tournament_gamesIds[game_id].score.pop();
                global_tournament_gamesIds[game_id].score.push([leftScore, rightScore]);
            } else {
                global_tournament_gamesIds[game_id].score.push([leftScore, rightScore]);
            }
        }

        broadcastMessage(dataFromClient.type, event);


    } else if (typesDef.DISCONNECT_EVENT === dataFromClient.type) {
        //diconnecting event
        const game_id = dataFromClient.game_id;
        let event = null;
        const type = typesDef.DISCONNECT_EVENT;

        if (global_random_gamesIds.hasOwnProperty(game_id)) {

            event = typesDef.RANDOM_GAME_EVENT;
            if(global_random_gamesIds[game_id]?.users_id?.length>0)
            global_random_gamesIds[game_id].users_id.map((id)=>{
                handleDisconnect(id);
            })

        } else {
            event = typesDef.TOURNAMENT_GAME_EVENT;
            if(global_tournament_gamesIds[game_id]?.users_id?.length>0)
            global_tournament_gamesIds[game_id].users_id.map((id)=>{
                handleDisconnect(id);
            })
          
        }
        
    }
}



//disconnect :---

export const handleDisconnect = (userId) => {
    if (mapping_user_with_game_id.hasOwnProperty(userId) === false) return;

    console.log(`${userId} disconnected.`);
    const game_id = mapping_user_with_game_id[userId];
    let event = null;
    const type = typesDef.DISCONNECT_EVENT;


    if (global_random_gamesIds.hasOwnProperty(game_id)) {

        event = typesDef.RANDOM_GAME_EVENT;
        let index = global_random_gamesIds[game_id].users_id.findIndex((_id) => _id === userId);
        
        global_random_gamesIds[game_id].paddle = [];
        global_random_gamesIds[game_id].emails = global_random_gamesIds[game_id].emails.filter((_, id) => id !== index);
        global_random_gamesIds[game_id].ball =[];
        broadcastMessage(type, event);

        global_random_gamesIds[game_id].users_id = global_random_gamesIds[game_id].users_id.filter((_, id) => id !== index);
        if (global_random_gamesIds[game_id].users_id.length === 0) delete global_random_gamesIds[game_id];



    } else {
        event = typesDef.TOURNAMENT_GAME_EVENT;
        let index = global_tournament_gamesIds[game_id].users_id.findIndex((_id) => _id === userId);
        
        global_tournament_gamesIds[game_id].paddle = [];
        global_tournament_gamesIds[game_id].emails = global_tournament_gamesIds[game_id].emails.filter((_, id) => id !== index);
        global_tournament_gamesIds[game_id].ball =[];
        broadcastMessage(type, event);

        global_tournament_gamesIds[game_id].users_id = global_tournament_gamesIds[game_id].users_id.filter((_, id) => id !== index);
        if (global_tournament_gamesIds[game_id].users_id.length === 0) delete global_tournament_gamesIds[game_id];
    }

    delete mapping_user_with_game_id[userId];
    delete clients[userId];
}