#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const cmd = process.argv[2];

if (cmd !== 'clean') {
  console.log('please use `httpalive clean` instead');
  process.exit(1);
}

const pidFile = path.resolve(process.cwd(), '.httpalive.pid');

const exist = fs.existsSync(pidFile);

if (!exist) {
  console.log(
    'please make sure `.httpalive.pid` exists in your process.cwd() directory'
  );
  process.exit(1);
}

const data = fs.readFileSync(pidFile, 'utf-8');
const j = JSON.parse(data);
Object.keys(j).map(k => {
  try {
    process.kill(j[k] as number);
    console.log(`kill pid ${j[k]} of ${k}`);
  } catch (e) {
    if (e.code === 'ESRCH') {
      console.log(`skip pid ${j[k]} of ${k}`);
    } else {
      console.error(e);
    }
  }
});
