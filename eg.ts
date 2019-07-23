import * as http from 'http';

import './http-alive';

const port = process.env.PORT;

http
  .createServer((req, res) => {
    res.end(`${process.pid}-${process.env.PORT}`);
  })
  .listen(port);
