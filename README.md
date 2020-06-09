# @hawk.so/nodejs

Node.js errors Catcher module for [Hawk.so](https://hawk.so)

## Usage

[Create](https://hawk.so/) an account and get an Integration Token.

### Install

Use NPM or Yarn to install Catcher

```bash
$ npm install @hawk.so/nodejs --save

$ yarn add @hawk.so/nodejs
```

### Require HawkCatcher module

```nodejs
const HawkCatcher = require('@hawk.so/nodejs').default;
```

### Init HawkCatcher

Create an instance with token to the entry point of your project.

```nodejs
const hawk = new HawkCatcher({
  token: 'eyJhb...VPsc',
});
```

### Usage

HawkCatcher adds listeners for `uncaughtException` and `unhandledRejection` itself.

Just write your code.

### Catch exceptions manually

You can catch exceptions by yourself without enabling handlers.

```nodejs
try {
  throw new Error('My lovely error');
} catch (e) {
  hawk.catch(e);
}
```
