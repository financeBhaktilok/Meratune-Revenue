let allData = [];
let chart;

async function loadData() {

    const response = await fetch("customers.csv");
    const text = await response.text();

    const rows = text.trim().split("\n");

    const headers = rows[0].split(",");

    allData = rows.slice(1).map(row => {

        const values = row.split(",");

        return {
            mobile_number: values[0].trim(),
            amount: Number(values[1].trim()),
            date: values[2].trim()
        };

    });

    displayData(allData);
}

function displayData(data) {

    const totalAmount =
        data.reduce((sum, row) => sum + row.amount, 0);

    const customers =
        new Set(data.map(row => row.mobile_number)).size;

    document.getElementById("totalAmount").innerText =
        "₹" + totalAmount.toLocaleString("en-IN");

    document.getElementById("totalCustomers").innerText =
        customers.toLocaleString("en-IN");

    document.getElementById("totalTransactions").innerText =
        data.length.toLocaleString("en-IN");

    const table =
        document.getElementById("dataTable");

    table.innerHTML = "";

    data.forEach(row => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.mobile_number}</td>
            <td>₹${row.amount.toLocaleString("en-IN")}</td>
            <td>${row.date}</td>
        `;

        table.appendChild(tr);
    });

    createChart(data);
}

function createChart(data) {

    const daily = {};

    data.forEach(row => {

        if (!daily[row.date]) {
            daily[row.date] = 0;
        }

        daily[row.date] += row.amount;
    });

    const dates = Object.keys(daily).sort();

    const amounts = dates.map(date => daily[date]);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(
        document.getElementById("paymentChart"),
        {
            type: "line",

            data: {
                labels: dates,

                datasets: [{
                    label: "Daily Amount",
                    data: amounts,
                    tension: 0.3
                }]
            },

            options: {
                responsive: true,

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}

function applyFilters() {

    const from =
        document.getElementById("fromDate").value;

    const to =
        document.getElementById("toDate").value;

    const mobile =
        document.getElementById("mobileSearch")
        .value.trim();

    let filtered = allData.filter(row => {

        let valid = true;

        if (from && row.date < from) {
            valid = false;
        }

        if (to && row.date > to) {
            valid = false;
        }

        if (
            mobile &&
            !row.mobile_number.includes(mobile)
        ) {
            valid = false;
        }

        return valid;
    });

    displayData(filtered);
}

function resetFilters() {

    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    document.getElementById("mobileSearch").value = "";

    displayData(allData);
}

loadData();
