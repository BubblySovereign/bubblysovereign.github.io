from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
import yfinance as yf
import math

app = FastAPI(title="Stock Analyzer")


def clean_value(value):
    """Make Yahoo Finance data safe to send as JSON."""

    if value is None:
        return None

    if isinstance(value, float) and math.isnan(value):
        return None

    return value


@app.get("/api/stock/{ticker}")
def get_stock(ticker: str):
    ticker = ticker.upper().strip()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required"
        )

    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for {ticker}"
            )

        return {
            "company": {
                "name": clean_value(info.get("longName")),
                "ticker": clean_value(info.get("symbol")),
                "sector": clean_value(info.get("sector")),
                "industry": clean_value(info.get("industry")),
                "country": clean_value(info.get("country")),
                "website": clean_value(info.get("website")),
            },

            "price": {
                "current": clean_value(info.get("currentPrice")),
                "previousClose": clean_value(info.get("previousClose")),
                "open": clean_value(info.get("open")),
                "high": clean_value(info.get("dayHigh")),
                "low": clean_value(info.get("dayLow")),
            },

            "week52": {
                "high": clean_value(info.get("fiftyTwoWeekHigh")),
                "low": clean_value(info.get("fiftyTwoWeekLow")),
            },

            "market": {
                "marketCap": clean_value(info.get("marketCap")),
                "enterpriseValue": clean_value(info.get("enterpriseValue")),
                "sharesOutstanding": clean_value(
                    info.get("sharesOutstanding")
                ),
                "beta": clean_value(info.get("beta")),
            },

            "valuation": {
                "pe": clean_value(info.get("trailingPE")),
                "forwardPE": clean_value(info.get("forwardPE")),
                "priceToBook": clean_value(info.get("priceToBook")),
                "peg": clean_value(info.get("pegRatio")),
            },

            "dividends": {
                "rate": clean_value(info.get("dividendRate")),
                "yield": clean_value(info.get("dividendYield")),
            },

            "financials": {
                "revenue": clean_value(info.get("totalRevenue")),
                "grossProfit": clean_value(info.get("grossProfits")),
                "netIncome": clean_value(
                    info.get("netIncomeToCommon")
                ),
                "profitMargin": clean_value(
                    info.get("profitMargins")
                ),
            },

            "analysts": {
                "targetHigh": clean_value(
                    info.get("targetHighPrice")
                ),
                "targetLow": clean_value(
                    info.get("targetLowPrice")
                ),
                "targetMean": clean_value(
                    info.get("targetMeanPrice")
                ),
                "recommendation": clean_value(
                    info.get("recommendationKey")
                ),
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve stock data: {str(e)}"
        )


@app.get("/api/history/{ticker}")
def get_history(ticker: str):
    ticker = ticker.upper().strip()

    try:
        stock = yf.Ticker(ticker)

        history = stock.history(period="1y")

        if history.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No historical data found for {ticker}"
            )

        data = []

        for date, row in history.iterrows():
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": clean_value(row["Open"]),
                "high": clean_value(row["High"]),
                "low": clean_value(row["Low"]),
                "close": clean_value(row["Close"]),
                "volume": clean_value(row["Volume"]),
            })

        return data

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# Serve the frontend
app.mount(
    "/",
    StaticFiles(directory="static", html=True),
    name="static"
)

