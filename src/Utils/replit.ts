import http from 'http';

http.createServer((req, res) => res.end("Alive")).listen(8080);