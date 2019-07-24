const path = require('path');
import { spawn } from 'child_process';
import { checkPid, delay, getPid, parseConf, setPid } from './util';

run();

function run() {
  const conf = parseConf();
  process.env.PORT = process.env.PORT || conf.master.toString();

  if (!process.env.HTTP_ALIVE_LOCK) {
    const arbiter = spawn('node', [path.resolve(__dirname, 'server.js')], {
      detached: true,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: conf.arbiter.toString(),
        MASTER_PORT: conf.master.toString(),
        SLAVE_PORT: conf.slave.toString(),
        HTTP_ALIVE_LOCK: 'true'
      }
    });

    arbiter.stderr.on('data', (data: any) => {
      if (data.toString().includes('EADDRINUSE')) {
        console.log('[arbiter]:previous ok, skip restart');
      } else {
        console.log('[arbiter]:' + data);
      }
    });

    arbiter.stdout.on('data', (data: any) => {
      console.log('[arbiter]:' + data);
    });

    delay(5000, () => {
      // if master ok
      if (checkPid(process.pid)) {
        setPid('master', process.pid);
        const slavePid = getPid('slave'); // if old slave exist
        if (slavePid) {
          try {
            process.kill(slavePid);
            console.log(`kill pid ${slavePid} of slave`);
          } catch (e) {
            console.log(`skip pid ${slavePid} of slave`);
          }
        }

        delay(1000, () => {
          const slave = spawn(
            'node',
            [module.parent!.filename.replace('.ts', '.js')],
            {
              detached: true,
              stdio: 'pipe',
              env: {
                ...process.env,
                PORT: conf.slave.toString(),
                HTTP_ALIVE_LOCK: 'true'
              }
            }
          );

          slave.stderr.on('data', (data: any) => {
            console.error('[slave]:' + data);
          });

          slave.stdout.on('data', (data: any) => {
            console.log('[slave]:' + data);
          });

          delay(3000, () => {
            if (checkPid(slave.pid)) {
              setPid('slave', slave.pid);
            }
          });
        });
      }
    });

    delay(3000, () => {
      if (checkPid(arbiter.pid)) {
        setPid('arbiter', arbiter.pid);
      }

      if (checkPid(process.pid)) {
        setPid('master', process.pid);
      }
    });

    process.env.HTTP_ALIVE_LOCK = 'true';
  }
}
