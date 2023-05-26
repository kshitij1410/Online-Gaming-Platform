import mysql from "mysql";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "19Eskcs121@",
  database: "games"
});


// db.connect((err) => {
//     if (err) {
//         console.warn(err)
//     } else {
//         console.warn("connected!!!")
//     }
// })