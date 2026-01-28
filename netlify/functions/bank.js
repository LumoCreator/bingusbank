export async function handler(event) {
  const body = JSON.parse(event.body || "{}");
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  const path  = "data/users.json";

  const gh = async (url, opt={}) =>
    fetch(url, {
      ...opt,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        ...(opt.headers||{})
      }
    }).then(r=>r.json());

  const file = await gh(`https://api.github.com/repos/${repo}/contents/${path}`);
  let users = JSON.parse(Buffer.from(file.content, "base64").toString());

  if (body.action === "transfer") {
    const from = users.find(u=>u.card===body.from);
    const to   = users.find(u=>u.card===body.to);
    if (!from || !to) return res(400,{error:"card"});
    from.balance -= body.amount;
    to.balance   += body.amount;
    const tx = {
      id: crypto.randomUUID(),
      type: "transfer",
      from: body.from,
      to: body.to,
      amount: body.amount,
      at: Date.now()
    };
    from.tx.unshift(tx);
    to.tx.unshift(tx);
  }

  await gh(`https://api.github.com/repos/${repo}/contents/${path}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      message:"bank update",
      sha: file.sha,
      content: Buffer.from(JSON.stringify(users,null,2)).toString("base64")
    })
  });

  return res(200, users);
}

const res=(s,b)=>({statusCode:s,body:JSON.stringify(b)});
