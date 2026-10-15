const periods = {
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    revenue: [38, 54, 46, 76, 59, 88, 74],
    orders: [25, 39, 32, 55, 43, 63, 52],
    metrics: ["₹58,400", "348", "112", "3.18%"]
  },
  month: {
    labels: ["01 Oct", "05 Oct", "09 Oct", "13 Oct", "17 Oct", "21 Oct", "25 Oct", "31 Oct"],
    revenue: [35, 52, 44, 72, 58, 84, 68, 95],
    orders: [24, 40, 33, 53, 42, 62, 49, 72],
    metrics: ["₹2,46,800", "1,482", "486", "3.24%"]
  },
  year: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    revenue: [40, 47, 56, 51, 64, 59, 73, 68, 79, 84, 76, 96],
    orders: [27, 34, 43, 38, 49, 45, 55, 50, 60, 64, 57, 73],
    metrics: ["₹24,68,000", "14,628", "4,862", "3.42%"]
  }
};

const metricNames = ["revenue", "orders", "customers", "conversion"];
const chart = document.getElementById("salesChart");
const context = chart.getContext("2d");
const periodSelect = document.getElementById("periodSelect");
const searchInput = document.getElementById("searchInput");
const orderRows = [...document.querySelectorAll("#orderRows tr")];

function drawChart(period) {
  const data = periods[period];
  const bounds = chart.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const ratio = window.devicePixelRatio || 1;
  chart.width = Math.round(bounds.width * ratio);
  chart.height = Math.round(bounds.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = bounds.width;
  const height = bounds.height;
  const padding = { top: 12, right: 12, bottom: 24, left: 35 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const count = data.labels.length;
  const pointX = index => padding.left + index / (count - 1) * plotWidth;
  const pointY = value => padding.top + plotHeight - value / 100 * plotHeight;

  context.clearRect(0, 0, width, height);
  context.font = '9px "DM Sans", sans-serif';
  context.textBaseline = "middle";
  [0, 25, 50, 75, 100].forEach((value, index) => {
    const y = padding.top + index / 4 * plotHeight;
    context.beginPath();
    context.strokeStyle = "#f0f0f4";
    context.lineWidth = 1;
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillStyle = "#a1a2ad";
    context.textAlign = "right";
    context.fillText(value === 0 ? "₹0" : `₹${value}k`, padding.left - 8, y);
  });

  const drawSeries = (values, color, fill) => {
    context.beginPath();
    values.forEach((value, index) => index === 0
      ? context.moveTo(pointX(index), pointY(value))
      : context.lineTo(pointX(index), pointY(value)));
    context.lineTo(pointX(values.length - 1), padding.top + plotHeight);
    context.lineTo(pointX(0), padding.top + plotHeight);
    context.closePath();
    context.fillStyle = fill;
    context.fill();

    context.beginPath();
    values.forEach((value, index) => index === 0
      ? context.moveTo(pointX(index), pointY(value))
      : context.lineTo(pointX(index), pointY(value)));
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
    values.forEach((value, index) => {
      context.beginPath();
      context.arc(pointX(index), pointY(value), 2.5, 0, Math.PI * 2);
      context.fillStyle = "#fff";
      context.fill();
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.stroke();
    });
  };

  drawSeries(data.orders, "#96d8c3", "rgba(150, 216, 195, .07)");
  drawSeries(data.revenue, "#7765f5", "rgba(119, 101, 245, .08)");
  context.fillStyle = "#a1a2ad";
  context.textAlign = "center";
  data.labels.forEach((label, index) => {
    if (count > 8 && index % 2 !== 0 && index !== count - 1) return;
    context.fillText(label, pointX(index), height - 9);
  });
}

function updatePeriod() {
  const selectedPeriod = periods[periodSelect.value] ? periodSelect.value : "month";
  periods[selectedPeriod].metrics.forEach((value, index) => {
    document.querySelector(`[data-metric="${metricNames[index]}"]`).textContent = value;
  });
  drawChart(selectedPeriod);
}

periodSelect.addEventListener("change", updatePeriod);
window.addEventListener("resize", updatePeriod);
if ("ResizeObserver" in window) new ResizeObserver(updatePeriod).observe(chart.parentElement);

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  let matches = 0;
  orderRows.forEach(row => {
    const visible = row.dataset.search.includes(query);
    row.hidden = !visible;
    if (visible) matches += 1;
  });
  document.getElementById("emptyState").hidden = matches !== 0;
});

document.getElementById("downloadButton").addEventListener("click", () => {
  const rows = [
    ["Customer", "Order ID", "Date", "Amount", "Status"],
    ...orderRows.map(row => [...row.querySelectorAll("td")].map(cell => cell.innerText.replace(/\s+/g, " ").trim()))
  ];
  const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
  const fileUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = "rayyan-dashboard-orders.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(fileUrl);
});

const notificationButton = document.getElementById("notificationButton");
const notificationPopover = document.getElementById("notificationPopover");
notificationButton.addEventListener("click", () => {
  const opening = notificationPopover.hidden;
  notificationPopover.hidden = !opening;
  notificationButton.setAttribute("aria-expanded", String(opening));
});

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const backdrop = document.getElementById("backdrop");
function setMenuOpen(open) {
  sidebar.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-visible", open);
  menuButton.setAttribute("aria-expanded", String(open));
}
menuButton.addEventListener("click", () => setMenuOpen(!sidebar.classList.contains("is-open")));
backdrop.addEventListener("click", () => setMenuOpen(false));
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    setMenuOpen(false);
  });
});

document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
}).format(new Date());
document.getElementById("currentYear").textContent = new Date().getFullYear();
updatePeriod();
