# http-alive

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

keep your web service always online

## Installation

```bash
npm i http-alive -S
```

## Usage

just one line `import './http-alive';`

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

config file

.httpalive

```json
{ "arbiter": 3000, "master": 3001, "slave": 3002 }
```

## Todo

- [ ] xxxx

## License

MIT

[npm-image]: https://img.shields.io/npm/v/http-alive.svg
[npm-url]: https://www.npmjs.com/package/http-alive
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
