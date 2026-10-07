async function analyzeStock() {

    const input = document.getElementById("tickerInput");
    const ticker = input.value.trim().toUpperCase();

    if (!ticker) {
        showError("Please enter a ticker symbol.");
        return;
    }

    showLoading(true);
    hideError();

    try {

        const response = await fetch(`/api/stock/${ticker}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to get stock data.");
        }

        displayStock(data);

    } catch (error) {

        showError(error.message);

    } finally {

        showLoading(false);
    }
}


function displayStock(data) {

    const company = data.company;
    const price = data.price;
    const market = data.market;
    const valuation = data.valuation;
    const week52 = data.week52;
    const financials = data.financials;
    const analysts = data.analysts;

    document.getElementById("companyName").textContent =
        `${company.name || "Unknown Company"} (${company.ticker || ""})`;

    document.getElementById("companyDetails").textContent =
        `${company.sector || "N/A"} • ${company.industry || "N/A"} • ${company.country || "N/A"}`;

    document.getElementById("currentPrice").textContent =
        money(price.current);

    document.getElementById("marketCap").textContent =
        compactNumber(market.marketCap);

    document.getElementById("pe").textContent =
        number(valuation.pe);

    document.getElementById("beta").textContent =
        number(market.beta);

    document.getElementById("open").textContent =
        money(price.open);

    document.getElementById("previousClose").textContent =
        money(price.previousClose);

    document.getElementById("dayHigh").textContent =
        money(price.high);

    document.getElementById("dayLow").textContent =
        money(price.low);

    document.getElementById("weekHigh").textContent =
        money(week52.high);

    document.getElementById("weekLow").textContent =
        money(week52.low);

    document.getElementById("valuationPE").textContent =
        number(valuation.pe);

    document.getElementById("forwardPE").textContent =
        number(valuation.forwardPE);

    document.getElementById("priceBook").textContent =
        number(valuation.priceToBook);

    document.getElementById("peg").textContent =
        number(valuation.peg);

    document.getElementById("revenue").textContent =
        compactNumber(financials.revenue);

    document.getElementById("grossProfit").textContent =
        compactNumber(financials.grossProfit);

    document.getElementById("netIncome").textContent =
        compactNumber(financials.netIncome);

    document.getElementById("profitMargin").textContent =
        percent(financials.profitMargin);

    document.getElementById("targetHigh").textContent =
        money(analysts.targetHigh);

    document.getElementById("targetLow").textContent =
        money(analysts.targetLow);

    document.getElementById("targetMean").textContent =
        money(analysts.targetMean);

    document.getElementById("recommendation").textContent =
        analysts.recommendation || "N/A";

    document
        .getElementById("dashboard")
        .classList.remove("hidden");
}


function money(value) {

    if (value === null || value === undefined) {
        return "N/A";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(value);
}


function number(value) {

    if (value === null || value === undefined) {
        return "N/A";
    }

    return Number(value).toFixed(2);
}


function percent(value) {

    if (value === null || value === undefined) {
        return "N/A";
    }

    return `${(value * 100).toFixed(2)}%`;
}


function compactNumber(value) {

    if (value === null || value === undefined) {
        return "N/A";
    }

    const abs = Math.abs(value);

    if (abs >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
    }

    if (abs >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    }

    if (abs >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }

    if (abs >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    }

    return `$${value.toFixed(2)}`;
}


function showLoading(show) {

    document
        .getElementById("loading")
        .classList.toggle("hidden", !show);
}


function showError(message) {

    const error = document.getElementById("error");

    error.textContent = message;
    error.classList.remove("hidden");
}


function hideError() {

    document
        .getElementById("error")
        .classList.add("hidden");
}


// Press Enter to search
document
    .getElementById("tickerInput")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            analyzeStock();
        }

    });


// Load AAPL when page opens
analyzeStock();

