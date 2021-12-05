const { connectToDb, closeDb } = require('./database/getConnection');

const queryAssets = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if(err) {
                console.log(`error while retriving data`);
                console.log(err);
                reject(err);
            } else {
                resolve({rows, db});
            }
        });
    });
}

connectToDb('./stocks.db')
.then(db => {
    return queryAssets(
        db, 
        `SELECT
            A.ID,
            A.STOCK_ID,
            A.STOCK_NAME,
            A.STOCK_HOLDINGS,
            A.AVERAGE_PRICE,
            A.COST_OF_INVESTMENT,
            DP.CURRENT_PRICE,
            DP.CURRENT_PRICE * A.STOCK_HOLDINGS AS BOOK_VALUE,
            (A.STOCK_HOLDINGS * DP.CURRENT_PRICE) - A.COST_OF_INVESTMENT AS PROFIT_AND_LOSS,
            (((A.STOCK_HOLDINGS * DP.CURRENT_PRICE) - A.COST_OF_INVESTMENT) / A.COST_OF_INVESTMENT) * 100 AS PROFIT_AND_LOSS_PERCENTAGE
        FROM ASSETS A
        JOIN DAILY_PRICE DP ON A.ID = DP.ID;`)
})
.then((obj) => {
    console.log(obj.rows);
    return closeDb(obj.db);
})
.then((db) => {
    db.close();
    console.log('successfully closed db');
})
.catch(err => {
    console.log(err);
});