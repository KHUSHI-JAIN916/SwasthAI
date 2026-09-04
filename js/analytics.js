/* =====================================
   ANALYTICS CHARTS & METRICS
   ===================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Mobile sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });
    }

    // Case Trend Chart
    const trendEl = document.getElementById("caseTrendChart");
    if (trendEl && typeof Chart !== "undefined") {
        const caseTrendChart = trendEl.getContext("2d");
        new Chart(caseTrendChart, {
            type: "line",
            data: {
                labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
                datasets: [{
                    label: "Patient Cases",
                    data: [42, 58, 64, 71, 86, 95],
                    borderColor: "#1f7a57",
                    backgroundColor: "rgba(31,122,87,0.12)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Prakriti Distribution
    const prakritiEl = document.getElementById("prakritiChart");
    if (prakritiEl && typeof Chart !== "undefined") {
        const prakritiChart = prakritiEl.getContext("2d");
        new Chart(prakritiChart, {
            type: "doughnut",
            data: {
                labels: ["Vata", "Pitta", "Kapha"],
                datasets: [{
                    data: [42, 33, 25],
                    backgroundColor: ["#1f7a57", "#d4a24c", "#6c8ed9"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });
    }

    // Common Complaints
    const complaintEl = document.getElementById("complaintChart");
    if (complaintEl && typeof Chart !== "undefined") {
        const complaintChart = complaintEl.getContext("2d");
        new Chart(complaintChart, {
            type: "bar",
            data: {
                labels: ["Headache", "Digestive", "Joint Pain", "Fatigue", "Skin Issues"],
                datasets: [{
                    label: "Number of Cases",
                    data: [72, 61, 48, 39, 31],
                    backgroundColor: "#1f7a57",
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});