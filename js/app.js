// ==========================
// 1️⃣ Навигация
// ==========================
function go(url) {
  window.location.href = url;
}

// ==========================
// 2️⃣ API Fetch
// ==========================
const API = "/.netlify/functions/bank";

async function fetchUsers() {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({})
  })
    .then(r => r.json())
    .catch(err => { console.error(err); return []; });
}

// ==========================
// 3️⃣ Dashboard
// ==========================
async function renderDashboard() {
  const card = localStorage.getItem("card");
  if (!card) return;

  const users = await fetchUsers();
  const me = users.find(u => u.card === card);
  if (!me) return;

  const cardEl = document.getElementById("card");
  const balanceEl = document.getElementById("balance");

  if (cardEl) cardEl.innerText = me.card.replace(/(\d{4})/g, "$1 ");
  if (balanceEl) balanceEl.innerText = me.balance + " ₽";
}

// ==========================
// 4️⃣ Отправка денег
// ==========================
async function sendMoney() {
  const from = localStorage.getItem("card");
  const toEl = document.getElementById("to");
  const amountEl = document.getElementById("amount");

  if (!toEl || !amountEl) return;

  const to = toEl.value;
  const amount = Number(amountEl.value);
  if (!from || !to || !amount) return alert("Заполните все поля!");

  // loader
  document.body.innerHTML = '<div class="page"><div class="loader"></div></div>';

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "transfer",
      from,
      to,
      amount
    })
  });

  go("success.html");
}

// ==========================
// 5️⃣ История транзакций
// ==========================
async function renderHistory() {
  const card = localStorage.getItem("card");
  if (!card) return;

  const users = await fetchUsers();
  const me = users.find(u => u.card === card);
  if (!me) return;

  const list = document.getElementById("list");
  if (!list) return;

  list.innerHTML = "";

  if (me.tx.length === 0) {
    list.innerHTML = "<p>История пуста</p>";
    return;
  }

  me.tx.forEach(t => {
    const div = document.createElement("div");
    div.style.padding = "12px";
    div.style.borderBottom = "1px solid rgba(255,255,255,.1)";
    div.innerHTML = `
      <b>${t.amount} ₽</b> ${t.type}<br>
      ${new Date(t.at).toLocaleString()}
    `;
    list.appendChild(div);
  });
}

// ==========================
// 6️⃣ QR / СБП
// ==========================
function makeQR() {
  const amountEl = document.getElementById("amount");
  if (!amountEl) return;
  const qrEl = document.getElementById("qr");
  if (!qrEl) return;

  const data = {
    to: localStorage.getItem("card"),
    amount: Number(amountEl.value)
  };

  qrEl.innerHTML = "";
  new QRCode(qrEl, { text: JSON.stringify(data), width: 200, height: 200 });
}

function startQRScanner() {
  const scanEl = document.getElementById("scan");
  if (!scanEl) return;

  new Html5Qrcode("scan").start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    decoded => {
      const d = JSON.parse(decoded);
      localStorage.to = d.to;
      localStorage.amount = d.amount;
      go("send.html");
    }
  );
}

// ==========================
// 7️⃣ FaceID / Smile mock
// ==========================
function startFaceID() {
  setTimeout(() => go("dashboard.html"), 2500);
}

// ==========================
// 8️⃣ Realtime polling
// ==========================
setInterval(() => renderDashboard(), 2000);

// ==========================
// 9️⃣ Автоинициализация для страниц
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("list")) renderHistory();
  renderDashboard();
});
