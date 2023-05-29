import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { runQuery } from "../../utils/runQuer.js";


export const createUser = async (name, email, password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = uuidv4();
    const q1 = "INSERT INTO USERS(user_id,name,email,password,coin) VALUES (?,?,?,?,?)";
    const coin = 500;
    const values = [id, name, email, hash, coin];
    await runQuery(q1, values);
}

export const updateCoinUtil = async (coinValue, coin, email) => {
    const q1 = "UPDATE USERS set coin=? where email =?"
    await runQuery(q1, [coinValue + coin, email]);
}
export const addScoreinGameTable = async (queries) => {
    const q = "INSERT INTO GAMES(game_id,role,player1_score,player2_score,player1_id,player2_id) values (?,?,?,?,?,?)";
    await runQuery(q, queries);
}

export const addScoreofTournament = async (player1_score, player1_id, player2_score, player2_id) => {
    let id = uuidv4();
    const q1 = `INSERT INTO TOURNAMENT(score,player_id,tournament_id) values (?,?,?), (?,?,?);`
    await runQuery(q1, [player1_score, player1_id, id, player2_score, player2_id, id]);
}

export const getScoreUtil = async (data) => {
    
    const query = "select email from USERS where user_id=?";
    let queries = [];
    if (data[0].player1_score > data[0].player2_score) {
        queries.push(data[0].player1_id)
    } else if (data[0].player1_score <= data[0].player2_score) {
        queries.push(data[0].player2_id);
    }

    const result = await runQuery(query, queries);
    return result;
}