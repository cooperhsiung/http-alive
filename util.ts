const fs = require('fs');

const CONF_FILE = '.httpalive';
const DEFAULT_CONF = { arbiter: 3000, master: 3001, slave: 3002 };
export type Conf = typeof DEFAULT_CONF;

const PID_FILE = '.httpalive.pid';
const DEFAULT_PID = { arbiter: null, master: null, slave: null };

export const checkPid = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
};

export const parseConf = (): Conf => {
  let exist = fs.existsSync(CONF_FILE);
  if (exist) {
    let data = fs.readFileSync(CONF_FILE, 'utf-8');
    return JSON.parse(data);
  } else {
    console.log('please edit your config file `.httpalive`');
    fs.writeFileSync(CONF_FILE, JSON.stringify(DEFAULT_CONF));
    process.exit(0);
  }
  return DEFAULT_CONF;
};

export const delay = (wait: number, fn: () => void) => setTimeout(fn, wait);

export const setPid = (type: string, pid: number): any => {
  let exist = fs.existsSync(PID_FILE);
  if (exist) {
    let data = fs.readFileSync(PID_FILE, 'utf-8');
    let j = JSON.parse(data);
    j[type] = pid;
    fs.writeFileSync(PID_FILE, JSON.stringify(j));
  } else {
    fs.writeFileSync(PID_FILE, JSON.stringify(DEFAULT_PID));
    return setPid(type, pid);
  }
};

export const getPid = (type: string): number | null => {
  let exist = fs.existsSync(PID_FILE);
  if (exist) {
    let data = fs.readFileSync(PID_FILE, 'utf-8');
    let j = JSON.parse(data);
    return j[type];
  } else {
    return null;
  }
};

export const sample = <T>(arr: T[]): T => {
  if (arr.length === 1) {
    return arr[0];
  }
  if (Math.random() > 0.5) {
    return arr[1];
  } else {
    return arr[0];
  }
};
