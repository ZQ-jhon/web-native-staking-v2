# web-native-staking-v2

[![CircleCI](https://circleci.com/gh/iotexproject/web-native-staking-v2/tree/master.svg?style=svg)](https://circleci.com/gh/iotexproject/web-native-staking-v2/tree/master)

- [Documentation](https://onefx.js.org/doc.html?utm_source=web-native-staking-v2)
- [Contributing](https://onefx.js.org/contributing.html?utm_source=github-iotex-explorer)

## Getting Started

OneFx is a full-stack framework for building web apps. Here are the features you'll find in Onefx.js:

- server side rendering and universal rendering with react and redux
- ES2017, JSX, TypeScript support out of the box
- server-side development via Koa.js

### Create a project

```bash
git clone git@github.com:puncsky/web-native-staking-v2.git my-awesome-project
```

### Run your project

This is intended for \*nix users. If you use Windows, go to [Run on Windows](#run-on-windows). Let's first prepare the environment.

```bash
cd web-native-staking-v2

nvm use 10.15.0
npm install

# prepare environment variable
cp ./.env.tmpl ./.env
```

#### Development mode

To run your project in development mode, run:

```bash
npm run watch
```

The development site will be available at [http://localhost:5004](http://localhost:5004).

#### Production Mode

It's sometimes useful to run a project in production mode, for example, to check bundle size or to debug a production-only issue. To run your project in production mode locally, run:

```bash
npm run build-production
NODE_ENV=production npm run start
```

#### NPM scripts

- `npm run test`: **test the whole project and generate a test coverage**
- `npm run ava ./path/to/test-file.js`: run a specific test file
- `npm run build`: build source code from `src` to `dist`
- `npm run lint`: run the linter
- `npm run kill`: kill the node server occupying the port 5004.
