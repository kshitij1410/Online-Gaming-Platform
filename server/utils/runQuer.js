import { db } from "../DB/createTable.js";

export function runQuery(sql, params) {
   
    return new Promise((resolve, reject) => {
       
        db.query(sql, params, (err, results, fields) => {
            if (err) {
                
                return reject(err);
            }
            else {
                
                return resolve(results);
            }
        });
    });

};

