function makeQR(){
  new QRCode(qr,{text:JSON.stringify({to:localStorage.card,amount:+amount.value})});
}
new Html5Qrcode("scan").start({facingMode:"environment"},{fps:10,qrbox:250},t=>{
  const d=JSON.parse(t); localStorage.to=d.to; localStorage.amount=d.amount; location='send.html';
});
