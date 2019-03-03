const http = require('http');

function sendDataToNotifier (obj) {
  console.log("notify:", obj);
  const data = JSON.stringify(obj);
  const options = {
    hostname: "localhost",
    port: 8080,
    path: "/notify",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  }

  const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', (d) => {
      process.stdout.write(d)
    });
  });

  req.on('error', (error) => {
    console.error("error sending:", error);
  });

  req.write(data);
  req.end();
}

module.exports = sendDataToNotifier;
