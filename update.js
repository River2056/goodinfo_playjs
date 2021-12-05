const axios = require('axios');
const cheerio = require('cheerio');
const { connectToDb, closeDb } = require('./database/getConnection');
const stockData = require('./stocks.json');

const date = new Date();
const baseUrl = 'https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=';
const sleep = async (millis) => {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const fetchStockInfo = async (stockId) => {
    let res = await axios({
        method: 'GET',
        url: `${baseUrl}${stockId}`,
        headers: {
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        }
    });
    return res;
}

const parseHtmlData = res => {
    const $ = cheerio.load(res);
    return $;
}

const getPriceInfo = jq => {
    const price = jq('body > table:nth-child(8) > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)').html();
    return price;
}

const getPercentage = jq => {
    const percentage = jq('body > table:nth-child(8) > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(4)').html();
    return percentage;
}

const updateCurrentPrice = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, err => {
            if(err) {
                console.log('error while updating price to db');
                console.log(err);
                reject(err);
            } else {
                resolve({ msg: 'one row affected', db });
            }
        });
    });
}

const formatDateIntoString = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

// https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=0050
stockData.forEach(async (stock) => {
    const res = await fetchStockInfo(stock);
    const data = parseHtmlData(res.data);
    const price = getPriceInfo(data);
    const percentage = getPercentage(data);
    console.log(`stockId: ${stock}, price: ${price}, percentage: ${percentage}`);

    // update database
    connectToDb('./stocks.db')
    .then(db => {
        return updateCurrentPrice(
            db,
            `UPDATE DAILY_PRICE SET CURRENT_PRICE = ? , MODIFY_DATE = ? WHERE STOCK_ID = ?`,
            [price, formatDateIntoString(date), stock]
        )
    })
    .then(obj => {
        return updateCurrentPrice(
            obj.db,
            `UPDATE DAILY_PRICE SET PERCENTAGE = ?, MODIFY_DATE = ? WHERE STOCK_ID = ?`,
            [percentage, formatDateIntoString(date), stock]
        )
    })
    .then(obj2 => {
        return closeDb(obj2.db);
    })
    .then(db => {
        db.close();
        console.log('successfully closed db');
    })
    await sleep(2000);
});