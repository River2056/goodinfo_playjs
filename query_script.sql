SELECT
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
JOIN DAILY_PRICE DP ON A.ID = DP.ID;