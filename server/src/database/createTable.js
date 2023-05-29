import mysql from "mysql";

// export const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port:process.env.DB_PORT
// });


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