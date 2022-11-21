const http = require('http');
const url = require('url')
const el = require('./index');

/////////////////////////

const server  = http.createServer((req, res) => {
    console.log(req.url)
    switch(req.url){
        case "/":
        case "/overview":
            res.end("This is overview page")
            break;
        case "/products":
            res.end("This is the product page")
            break;
        default :
        res.writeHead(404, {
            'Content-type' : "text/html",
            'my-own-header' : "hello-world"
        })
            res.end("<h1>Page not found!</h1>")
        }
})

server.listen(8000, '127.0.0.1', () => {
    console.log('listening to request on port 8000');
})


