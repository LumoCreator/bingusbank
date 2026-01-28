const API = "/.netlify/functions/bank";

async function loadBalance() {
  const card = localStorage.getItem("card");

  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ action: "noop" })
  });

  const users = await res.json();
  const me = users.find(u => u.card === card);

  if (me && document.getElementById("balance")) {
    balance.innerText = "Баланс: " + me.balance + " ₽";
  }
}

async function send() {
  const from = localStorage.getItem("card");
  const to = document.getElementById("to").value;
  const amount = Number(document.getElementById("amount").value);

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "transfer",
      from,
      to,
      amount
    })
  });

  location.href = "dashboard.html";
}

loadBalance();
