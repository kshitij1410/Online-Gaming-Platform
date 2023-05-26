import mysql from "mysql";

export const db = mysql.createConnection({
  host: "game-mysqldb-1",
  user: "root",
  password: "19Eskcs121@",
  database: "games",
  port:"3306"
});


// db.connect((err) => {
//     if (err) {
//         console.warn(err)
//     } else {
//         console.warn("connected!!!")
//     }
// })