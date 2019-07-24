const fs = require('fs');
const path = require('path');
import { spawn } from 'child_process';

const file = '.httpalive';
const defaultConf = {
  arbiter: 3000,
  master: 3001,
  slave: 3002
};

launch();

function parseConf() {
  let exist = fs.existsSync(file);
  if (exist) {
    let data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } else {
    console.log('please edit your config file `.httpalive`');
    fs.writeFileSync(file, JSON.stringify(defaultConf));
    process.exit(0);
  }
  return {};
}

function launch() {
  let conf = parseConf();
  process.env.PORT = process.env.PORT || conf.master;

  if (!process.env.HTTP_ALIVE_LOCK) {
    let arbiterProcess = spawn('node', [path.resolve(__dirname, 'server.js')], {
      detached: true,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: conf.arbiter,
        HTTP_ALIVE_LOCK: 'true',
        MASTER_PORT: conf.master,
        SLAVE_PORT: conf.slave
      }
    });

    arbiterProcess.stderr.on('data', function(data: any) {
      if (!data.toString().includes('EADDRINUSE')) {
        console.error('arbiter stdout: ' + data);
      }
    });

    arbiterProcess.stdout.on('data', function(data: any) {
      console.log('arbiter stdout: ' + data);
    });

    // 每次重启 master，10s 后重启 slave
    // console.log('===== module', module.parent!.filename);
    let slaveProcess = spawn(
      'node',
      [module.parent!.filename.replace('.ts', '.js')],
      {
        detached: true,
        stdio: 'pipe',
        env: { ...process.env, PORT: conf.slave, HTTP_ALIVE_LOCK: 'true' }
      }
    );

    setTimeout(() => {
      if (checkPid(slaveProcess.pid)) {
        updatePid('slave', slaveProcess.pid);
      }
    }, 3000);

    setTimeout(() => {
      if (checkPid(arbiterProcess.pid)) {
        updatePid('arbiter', arbiterProcess.pid);
      }
    }, 3000);

    setTimeout(() => {
      if (checkPid(process.pid)) {
        updatePid('master', process.pid);
      }
    }, 3000);

    slaveProcess.stderr.on('data', function(data: any) {
      if (!data.toString().includes('EADDRINUSE')) {
        console.error('slave stdout: ' + data);
      }
    });

    slaveProcess.stdout.on('data', function(data: any) {
      console.log('slave stdout: ' + data);
    });

    process.env.HTTP_ALIVE_LOCK = 'true';
  }
}

function checkPid(pid: number) {
  try {
    return process.kill(pid, 0);
  } catch (e) {
    return e.code === 'EPERM';
  }
}

let pidfile = '.httpalive.pid';

const defaultPidConf = {
  arbiter: null,
  master: null,
  slave: null
};

function updatePid(type: string, pid: number): any {
  let exist = fs.existsSync(pidfile);
  if (exist) {
    let data = fs.readFileSync(pidfile, 'utf-8');
    let j = JSON.parse(data);
    j[type] = pid;
    fs.writeFileSync(pidfile, JSON.stringify(j));
  } else {
    fs.writeFileSync(pidfile, JSON.stringify(defaultPidConf));
    return updatePid(type, pid);
  }
}
