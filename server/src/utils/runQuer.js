import { db } from '../database/createTable.js';
import { QUERIES } from "../database/initial-queries.js";
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

export function runDbQueries(){
    QUERIES.forEach((item) => {
        db.query(item.QUERY, [], (err, _) => {
            if (err) {
                console.log(err);
                return;
            }
        })
    })
    
}