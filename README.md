# @hawk.so/nodejs

Node.js errors Catcher module for [Hawk.so](https://hawk.so)

## Usage

1. [Create](https://hawk.so/) an account and get an Integration Token.
2. Add [@hawk.so/nodejs](https://www.npmjs.com/package/@hawk.so/nodejs) package to your project.
3. `Require` and initialize module.

### Install

Use NPM or Yarn to install Catcher

```bash
$ npm install @hawk.so/nodejs --save
```

```bash
$ yarn add @hawk.so/nodejs
```

### Require HawkCatcher module

```js
const HawkCatcher = require('@hawk.so/nodejs').default;
```

### Init HawkCatcher

Initialize HawkCatcher in the entry file of your project by passing a project token.

```js
const HAWK_TOKEN = 'eyJhb...VPsc';

HawkCatcher.init(HAWK_TOKEN);
```

HawkCatcher adds listeners for `uncaughtException` and `unhandledRejection` itself.

Just write your code.

### Catch exceptions manually

After [initializing](init-hawkcatcher) you can catch exceptions manually in try-catch constructions in any project's place.

Just [require HawkCatcher](#require-hawkcatcher-module) and call `.catch()` method.

```js
try {
  throw new Error('My lovely error');
} catch (e) {
  HawkCatcher.catch(e);
}
```
