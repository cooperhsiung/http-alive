# http-alive

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

keep your web service always online

it makes your service self-balanced, previously we restart our app by **kill process -> start app** or **pm2 restart**, but some requests may be handling/blocked when restarting, if we stop our app, those requests will be interrupted. `http-alive` helps to fork two process, one of arbiter, one of slave, when you stop the master, the arbiter will thansfer those blocked requests to the slave, in this way, your web service is always ready

## Installation

```bash
npm i http-alive -S
```

## Usage

### before

your original web service

```typescript
import * as http from 'http';

http
  .createServer((req, res) => {
    res.end(`${process.pid}-${process.env.PORT}`);
  })
  .listen(3000);
```

### after

add one line `import 'http-alive'`, use **process.env.PORT** to define the service's port

```typescript
import * as http from 'http';

import 'http-alive';

const port = process.env.PORT;

http
  .createServer((req, res) => {
    res.end(`${process.pid}-${process.env.PORT}`);
  })
  .listen(port);
```

add a config file `.httpalive` in your project directory

```json
{ "arbiter": 3000, "master": 3001, "slave": 3002 }
```

please pay attention to the ports, the arbiter's port equals to your original port

then start your service like usual

## Others

### clean process

to completely remove process forked by http-alive, `npm i httpalive -g`, then run command `httpalive clean`

or

add `"clean": "node ./node_modules/http-alive/bin/httpalive.js clean"` to package.json's scripts, then `npm run clean`

## Todo

- [ ] xxxx

## License

MIT

[npm-image]: https://img.shields.io/npm/v/http-alive.svg
[npm-url]: https://www.npmjs.com/package/http-alive
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
