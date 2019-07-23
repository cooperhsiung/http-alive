# http-alive

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

keep your web service always online

it makes your service self-balanced, previously we restart our app by **kill process -> restart app** or **pm2 restart**, but some requests may be handling and blocked when we restart, if we stop our app, those requests will be interrupted. `http-alive` helps to fork two process, one of arbiter, one of slave, when you stop the master, the arbiter will thansfer those blocked requests to the slave, in this way, it keep your web service always online

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

add one line `import './http-alive';`

```typescript
import * as http from 'http';

import './http-alive';

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

pay attention to the ports, the arbiter's port equals to your original port

then start your service

## Others

to completely remove process forked by `http-alive`, run command `httpalive clean`

## Todo

- [ ] xxxx

## License

MIT

[npm-image]: https://img.shields.io/npm/v/http-alive.svg
[npm-url]: https://www.npmjs.com/package/http-alive
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
