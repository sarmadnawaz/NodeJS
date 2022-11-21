const fs = require("fs");
const http = require("http");
const url = require("url");
const el = require("./index");

/////////////////////////

const apiResponseDate = fs.readFileSync(
  `${__dirname}/assests/data.json`,
  "utf-8"
);

/////////////////////////

const server = http.createServer((req, res) => {
  const pathName = req.url;
  if (pathName === "/") res.end("This is main page");
  else if (pathName === "/api") {
    // fs.readFile(`${__dirname}/assests/data.json`, "utf-8", (err, data) => {
    //   res.writeHead(200, {
    //     "Content-type": "application/json",
    //   });
    //   res.end(data);
    // });
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(apiResponseDate);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening to request on port 8000");
});
