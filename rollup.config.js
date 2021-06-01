import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import fs from 'fs';
import dotenv from 'dotenv';
import replace from '@rollup/plugin-replace';

dotenv.config();

const production = !process.env.ROLLUP_WATCH;

// TLS certificates
const tlsCert = process.env['TLS_CERT'] ? process.env.TLS_CERT : '';
const tlsKey = process.env['TLS_KEY'] ? process.env.TLS_KEY : '';

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    replace({
      ENV_IS_LIVE: JSON.stringify(process.env.ENV_IS_LIVE),
      GOOGLE_DRIVE_API_KEY: JSON.stringify(process.env.GOOGLE_DRIVE_API_KEY),
      GOOGLE_DRIVE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_DRIVE_CLIENT_ID)
    }),
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production &&
      livereload({
        watch: 'public',
        port: 35728,
        https:
          tlsCert && tlsKey
            ? {
                key: fs.readFileSync(tlsKey),
                cert: fs.readFileSync(tlsCert)
              }
            : null
      }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
