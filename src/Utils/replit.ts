import http from 'http';

http.createServer((req, res) => {
    res.write("true");
    res.end();
}).listen(8080);