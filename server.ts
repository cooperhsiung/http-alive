import * as http from 'http';
import { createProxyServer } from 'http-proxy-lite';
import { sample } from './util';

const port = process.env.PORT;
const proxy = createProxyServer();

type Endpoint = { url: string; healthy: boolean; fall: number };

const endpoints: Endpoint[] = [
  { url: `http://localhost:${process.env.MASTER_PORT}`, healthy: true, fall: 0 }, // prettier-ignore
  { url: `http://localhost:${process.env.SLAVE_PORT}`, healthy: true, fall: 0 }
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
      .on('error', e => {
        console.error(e);
        ep1.healthy = false;
        ep1.fall++;
        setTimeout(() => {
          ep1.healthy = true;
        }, 10 * 1000 * ep1.fall);

        const ep2 = endpoints.find(e => e.url !== ep1.url) as Endpoint;
        proxy
          .web(req, res, { target: ep2.url })
          .on('error', e => {
            console.error(e);
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

console.log(`Listening on http://localhost:${port} ..`);

process.on('uncaughtException', err => {
  console.error('uncaughtException:', err);
});
