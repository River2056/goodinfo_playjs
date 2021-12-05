const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const connectToDb = (dbPath) => {
    // const dbPath = path.join(__dirname, 'stocks.db');
    // console.log(dbPath);
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if(err) {
                console.log('error while connecting to db');
                reject(err);
            } else {
                console.log('successfully connected to db');
                resolve(db);
            }
        });
    });
}

const closeDb = (db) => {
    return Promise.resolve(db);
}

module.exports = {
    connectToDb,
    closeDb
};