fetch("http://localhost:4444/api/cron", {
  method: "POST",
  headers: { "x-cron-secret": "grannysfridge-cron-secret-2024" }
}).then(async res => console.log(res.status, await res.text())).catch(console.error);
