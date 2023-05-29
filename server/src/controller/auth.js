import { db } from "../database/createTable.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { runQuery } from "../utils/runQuer.js";
import { addScoreinGameTable, addScoreofTournament, createUser, getScoreUtil, updateCoinUtil } from "../services/auth/index.js";


export const register = async (req, res) => {

  //CHECK EXISTING USER
  const q = "SELECT * FROM USERS WHERE email = ?";

  try {
    const result = await runQuery(q, [req.body.email]);
    if (result.length) return res.status(409).send("User already exists!")
    createUser(req.body.name, req.body.email, req.body.password);
    return res.status(200).send("User has been created.")
  }
  catch (error) {
    return res.status(409).send(error.message)
  }
};

export const login = async (req, res) => {
  //CHECK USER EXIST
  const q = "SELECT * FROM USERS WHERE email = ?";
  try {
    const result = await runQuery(q, [req.body.email]);
    if (result.length === 0) return res.status(404).send("User not found!");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      result[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).send("Invalid Credentails!");

    const { password, ...rest } = result[0];
    return res.status(200).send(rest);
  }
  catch (err) {
    return res.status(409).send(err.message)
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true
  }).status(200).json("User has been logged out.")
};

export const updateCoin = async (req, res) => {
  // console.log("update coin")
  // console.log(req.body);
  let coin = req.body.coin;
  let flag = false;
  //deduced the coin otherwise add a coins
  if (coin < 0) flag = true;

  const q = "SELECT coin FROM USERS WHERE email = ?";
  try {
    const data = await runQuery(q, [req.body.email]);
    if (data.length === 0) return res.status(404).send("User not found!");

    const coinValue = data[0].coin;

    if (flag === true) {
      coin = -coin;
      if (coinValue < coin) {
        return res.status(400).send("User does not have enough coins");
      }
      coin = -coin;
    }

    updateCoinUtil(coinValue, coin, req.body.email);
    return res.status(200).send("Coins deduced successfully")
  }
  catch (error) {
    return res.status(409).send(error.message)
  }
}

export const getTournamentScore = async (req, res) => {

  const q = `select t1.name , t2.score from USERS as t1 INNER JOIN ((select player_id, temp.score from (SELECT player_id, max(score) as score 
  FROM TOURNAMENT group by player_id) as temp order by temp.score desc limit 3)) as t2 on t1.user_id=t2.player_id`;

  try {
    const data = await runQuery(q, []);
    return res.status(200).send(data);
  }
  catch (error) {
    return res.status(409).send(error.message)
  }
}

export const getCoin = async (req, res) => {

  const q = "SELECT coin from USERS where email=?";
  try {
    const data = await runQuery(q, [req.body.email]);
    return res.status(200).json(data[0].coin);
  }
  catch (error) {
    return res.status(409).send(error.message)
  }
}

export const addScore = async (req, res) => {
  const queries = [
    req.body.game_id,
    req.body.role,
    req.body.player1_score,
    req.body.player2_score,
    req.body.player1_id,
    req.body.player2_id
  ]

  const checkQuery = "select * from GAMES where game_id=?";

  try {
    const data = await runQuery(checkQuery, [req.body.game_id]);
    let times = 0;
    if (times % 2 === 1) {
      return res.status(200);
    }
    times += 1;

    if (data.length === 0) {
      addScoreinGameTable(queries);

      if (req.body.role === 'tournamentGameEvent') {
        addScoreofTournament(req.body.player1_score, req.body.player1_id, req.body.player2_score, req.body.player2_id);
        return res.send("Tournamnet Score is added sucessfully...")
      }
      else
        return res.send('score added!!!')
    }
    else {
      return res.status(200);
    }

  }
  catch (error) {
    return res.status(409).send(error.message)
  }
}

export const getScore = async (req, res) => {

  const q = "select * from GAMES where game_id=?"
  const data = await runQuery(q, [req.body.game_id]);
  if (data.length === 0) return res.status(400).send("game id is not found");
  const player1_score = data[0].player1_score;
  const player2_score = data[0].player2_score;
  const player1_id = data[0].player1_id;
  const player2_id = data[0].player2_id;
  const role = data[0].role;
  const result = await getScoreUtil(data);
  const email = result[0].email;
  return res.status(200).send({ email, player1_score, player1_id, player2_score, player2_id, role });
}

export const getSummary = async (req, res) => {
  let roles = req.body.role;
  if (roles === 'random') roles = 'randomGameEvent';
  else if (roles === 'tournament') roles = 'tournamentGameEvent';

  const state = req.body.state;
  let q = null;

  if (state === 'win') {
    if (roles === 'all') {
      q =
        `select temp.name ,temp.email ,temp1.score from USERS as temp INNER JOIN
        (select
        case
        when player1_score>player2_score then player1_score
        when player2_score>player1_score then player2_score
        else player1_score
        end as score,
        case
        when player1_score>player2_score then player1_id
        when player2_score>player1_score then player2_id
        else player1_id
        end as player_id
        from GAMES order by _id desc limit 5) as temp1
        where temp.user_id=temp1.player_id;`;

    }
    else if (roles === 'randomGameEvent') {
      q =
        `select temp.name ,temp.email ,temp1.score from USERS as temp INNER JOIN
      (select
      case
      when player1_score>player2_score then player1_score
      when player2_score>player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score>player2_score then player1_id
      when player2_score>player1_score then player2_id
      else player1_id
      end as player_id
      from GAMES where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    } else {
      q =
        `select temp.name ,temp.email ,temp1.score from USERS as temp INNER JOIN
      (select
      case
      when player1_score>player2_score then player1_score
      when player2_score>player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score>player2_score then player1_id
      when player2_score>player1_score then player2_id
      else player1_id
      end as player_id
      from GAMES where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    }
  }
  else {

    //lossing
    if (roles === 'all') {
      q =
        `select temp.name ,temp.email ,temp1.score from USERS as temp INNER JOIN
        (select
        case
        when player1_score<player2_score then player1_score
        when player2_score<player1_score then player2_score
        else player1_score
        end as score,
        case
        when player1_score<player2_score then player1_id
        when player2_score<player1_score then player2_id
        else player1_id
        end as player_id
        from GAMES order by _id desc limit 5) as temp1
        where temp.user_id=temp1.player_id;`;

    }
    else if (roles === 'randomGameEvent') {
      q =
        `select temp.name ,temp.email ,temp1.score from USERS as temp INNER JOIN
      (select
      case
      when player1_score<player2_score then player1_score
      when player2_score<player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score<player2_score then player1_id
      when player2_score<player1_score then player2_id
      else player1_id
      end as player_id
      from GAMES where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    } else {
      q =
        `select temp.name ,temp.email ,temp1.score from USERS as temp INNER JOIN
      (select
      case
      when player1_score<player2_score then player1_score
      when player2_score<player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score<player2_score then player1_id
      when player2_score<player1_score then player2_id
      else player1_id
      end as player_id
      from GAMES where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    }
  }

  try {
    const data = await runQuery(q, [roles]);
    return res.status(200).send(data);

  }
  catch (error) {
    console.log(' error', error);
    return res.status(409).send(error.message)
  }

}








// //wins

// select t1.player_id ,t1.score from
// (select * from tournament order by id desc limit 10 ) as t1 ,
// (select * from tournament order by id desc limit 10 ) as t2
// where t1.tournament_id =t2.tournament_id and t1.player_id <>t2.player_id and t1.score>t2.score;


// PLAYER1_ID , PLAYER2_ID , SCORE1 , SCORE2, GAME_ID ,ROLE


//issue ->game score tie

// select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
// (select
// case
// when player1_score>player2_score then player1_score
// when player2_score>player1_score then player2_score
// else player1_score
// end as score,
// case
// when player1_score>player2_score then player1_id
// when player2_score>player1_score then player2_id
// else player1_id
// end as player_id
// from games where role='randomEvent' order by _id desc limit 5) as temp1
// where temp.user_id=temp1.player_id;


// q =
//       ` select temp.name ,temp1.score from users as temp INNER JOIN
//         ((select t1.player1_score as score,t1.player1_id as player_id from
//         (select * from games order by _id desc limit 5) as t1,
//         (select * from games order by _id desc limit 5) as t2
//         where t1.game_id = t2.game_id and t1.player1_score >=t2.player2_score)

//         union all

//         (select t4.player2_score as score,t4.player2_id as player_id from
//         (select * from games order by _id desc limit 5) as t3,
//         (select * from games order by _id desc limit 5) as t4
//         where t3.game_id = t4.game_id and t3.player1_score <=t4.player2_score))
//         as temp1 on temp.user_id=temp1.player_id `;


// export const register = (req, res) => {
//   //CHECK EXISTING USER
//   const q = "SELECT * FROM users WHERE email = ?";

//   db.query(q, [req.body.email], (err, data) => {

//     if (err) res.status(500).json(err);

//     if (data.length) res.status(409).json("User already exists!");

//     //Hash the password and create a user

//     const salt = bcrypt.genSaltSync(10);
//     console.log("salt ", salt);
//     const hash = bcrypt.hashSync(req.body.password, salt);
//     console.log("hash", hash);
//     const id = uuidv4();

//     const q = "INSERT INTO users(user_id,name,email,password,coin) VALUES (?)";
//     const coin = 500;

//     const values = [id, req.body.name, req.body.email, hash, coin];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("User has been created.");
//     });
//   });
// };


/*

export const login = async (req, res) => {

  //CHECK USER EXIST

  const q = "SELECT * FROM users WHERE email = ?";
  try {
    const result = await runQuery(q, [req.body.email]);
    if (result.length === 0) return res.status(404).send("User not found!");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      result[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).send("Invalid Credentails!");

    const { password, ...rest } = result[0];

    return res.status(200).send(rest);

  }
  catch (err) {
    console.log(' error', error);
    res.status(409).send(error.message)
  }

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");


    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Invalid Credentails!");

    const token = jwt.sign({ id: data[0].user_id, email: data[0].email }, "KSHITIJ_KHANDELWAL_14_2000");
    const { password, ...rest } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(rest);
  });
};
*/


/*
export const updateCoin = (req, res) => {

  console.log("update coin")
  console.log(req.body);
  let coin = req.body.coin;
  let flag = false;
  //deduced the coin otherwise add a coins
  if (coin < 0) flag = true;

  const q = "SELECT coin FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const coinValue = data[0].coin;

    if (flag === true) {
      coin = -coin;
      if (coinValue < coin) {
        return res.status(400).json("User does not have enough coins");
      }
      coin = -coin;
    }


    const q = "UPDATE users set coin=? where email =?"
    db.query(q, [coinValue + coin, req.body.email], (err, data) => {
      if (err) return res.status(500).json(err);
      res.status(200).json("Coins deduced successfully")

    })

  })

}
*/


/*

export const getTournamentScore = (req, res) => {
  console.log("getTournamnent");

  const q = `select t1.name , t2.score from users as t1 INNER JOIN ((select player_id, temp.score from (SELECT player_id, max(score) as score 
  FROM TOURNAMENT group by player_id) as temp order by temp.score desc limit 3)) as t2 on t1.user_id=t2.player_id`;

  db.query(q, [], (err, data) => {
    if (err) return res.status(500).json(err);

    res.status(200).json(data);
  })
}

*/


/*

export const getCoin = (req, res) => {

  const q = "SELECT coin from users where email=?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);

    res.status(200).json(data[0].coin);
  })
}

*/

/*

export const addScore = (req, res) => {

  console.log(req.body);
  const queries = [
    req.body.game_id,
    req.body.role,
    req.body.player1_score,
    req.body.player2_score,
    req.body.player1_id,
    req.body.player2_id
  ]

  const checkQuery = "select * from games where game_id=?";
  db.query(checkQuery, [req.body.game_id], (err, data) => {
    if (err) return res.json(err);

    if (data.length === 0) {
      const q = "INSERT INTO GAMES(game_id,role,player1_score,player2_score,player1_id,player2_id) values (?,?,?,?,?,?)"

      db.query(q, queries, (err, _) => {

        if (err) return res.status(400).json(err);

        if (req.body.role === 'tournamentGameEvent') {
          let id = uuidv4();
          const q1 = `INSERT INTO TOURNAMENT(score,player_id,tournament_id) values (?,?,?), (?,?,?);`
          db.query(q1, [req.body.player1_score, req.body.player1_id, id, req.body.player2_score, req.body.player2_id, id], (err, _) => {

            if (err) return res.json(err);

            return res.json("Tournamnet Score is added sucessfully...")

          })
        } else
          return res.json('score added!!!')

      })
    }

  })




}

*/


/*

export const getScore = (req, res) => {

  const q = "select * from games where game_id=?"
  db.query(q, [req.body.game_id], (err, data) => {
    if (err) res.json(err);

    if (data.length === 0) return res.status(400).json("game id is not found");

    const player1_score = data[0].player1_score;
    const player2_score = data[0].player2_score;
    const player1_id = data[0].player1_id;
    const player2_id = data[0].player2_id;
    const role = data[0].role;
    const query = "select email from users where user_id=?";
    let queries = [];
    if (player1_score > player2_score) {
      queries.push(player1_id)
    } else if (player1_score <= player2_score) {
      queries.push(player2_id);
    }

    db.query(query, queries, (err, result) => {
      if (err) return res.json(err);
      const email = result[0].email;

      return res.status(200).json({ email, player1_score, player1_id, player2_score, player2_id, role });
    })

  })
}
*/

/*

export const getSummary = (req, res) => {
  let roles = req.body.role;
  if (roles === 'random') roles = 'randomGameEvent';
  else if (roles === 'tournament') roles = 'tournamentGameEvent';

  const state = req.body.state;
  let q = null;

  if (state === 'win') {
    if (roles === 'all') {
      q =
        `select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
        (select
        case
        when player1_score>player2_score then player1_score
        when player2_score>player1_score then player2_score
        else player1_score
        end as score,
        case
        when player1_score>player2_score then player1_id
        when player2_score>player1_score then player2_id
        else player1_id
        end as player_id
        from games order by _id desc limit 5) as temp1
        where temp.user_id=temp1.player_id;`;

    }
    else if (roles === 'randomGameEvent') {
      q =
        `select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
      (select
      case
      when player1_score>player2_score then player1_score
      when player2_score>player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score>player2_score then player1_id
      when player2_score>player1_score then player2_id
      else player1_id
      end as player_id
      from games where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    } else {
      q =
        `select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
      (select
      case
      when player1_score>player2_score then player1_score
      when player2_score>player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score>player2_score then player1_id
      when player2_score>player1_score then player2_id
      else player1_id
      end as player_id
      from games where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    }
  }
  else {

    //lossing
    if (roles === 'all') {
      q =
        `select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
        (select
        case
        when player1_score<player2_score then player1_score
        when player2_score<player1_score then player2_score
        else player1_score
        end as score,
        case
        when player1_score<player2_score then player1_id
        when player2_score<player1_score then player2_id
        else player1_id
        end as player_id
        from games order by _id desc limit 5) as temp1
        where temp.user_id=temp1.player_id;`;

    }
    else if (roles === 'randomGameEvent') {
      q =
        `select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
      (select
      case
      when player1_score<player2_score then player1_score
      when player2_score<player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score<player2_score then player1_id
      when player2_score<player1_score then player2_id
      else player1_id
      end as player_id
      from games where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    } else {
      q =
        `select temp.name ,temp.email ,temp1.score from users as temp INNER JOIN
      (select
      case
      when player1_score<player2_score then player1_score
      when player2_score<player1_score then player2_score
      else player1_score
      end as score,
      case
      when player1_score<player2_score then player1_id
      when player2_score<player1_score then player2_id
      else player1_id
      end as player_id
      from games where role=? order by _id desc limit 5) as temp1
      where temp.user_id=temp1.player_id;`;


    }
  }
  db.query(q, [roles], (err, data) => {
    if (err) return res.json(err);

    return res.status(200).json(data);

  })

}




*/