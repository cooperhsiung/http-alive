import * as http from 'http';
import { createProxyServer } from 'http-proxy-lite';

const port = process.env.PORT;
const proxy = createProxyServer();

type Endpoint = { url: string; healthy: boolean; fall: number };

let endpoints: Endpoint[] = [
  {
    url: 'http://localhost:' + process.env.MASTER_PORT,
    healthy: true,
    fall: 0
  },
  { url: 'http://localhost:' + process.env.SLAVE_PORT, healthy: true, fall: 0 }
];

http
  .createServer((req, res) => {
    const ep1 = sample(endpoints.filter(e => e.healthy));
    if (!ep1) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    proxy
      .web(req, res, { target: ep1.url })
      .on('error', () => {
        ep1.healthy = false;
        ep1.fall++;
        setTimeout(() => {
          ep1.healthy = true;
        }, 10 * 1000 * ep1.fall);

        const ep2 = endpoints.find(e => e.url !== ep1.url) as Endpoint;
        proxy
          .web(req, res, { target: ep2.url })
          .on('error', error => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          })
          .on('end', () => {
            ep2.fall = 0;
          });
      })
      .on('end', () => {
        ep1.fall = 0;
      });
  })
  .listen(port);

const sample = (arr: any[]) => {
  if (arr.length === 1) {
    return arr[0];
  }
  if (Math.random() > 0.5) {
    return arr[1];
  } else {
    return arr[0];
  }
};

process.on('uncaughtException', err => {
  console.error('uncaughtException:', err);
});
