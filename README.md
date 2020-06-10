# @hawk.so/nodejs

Node.js errors Catcher module for [Hawk.so](https://hawk.so)

## Usage

1. [Create](https://hawk.so/) an account and get an Integration Token.
2. Add [@hawk.so/nodejs](https://www.npmjs.com/package/@hawk.so/nodejs) package to your project.
3. `Require` and initialize module.

HawkCatcher adds listeners for `uncaughtException` and `unhandledRejection` itself. Just write your code.

If it is necessary you can `catch()` errors in try-catch blocks manually.

> ☝️ **Pro tip**
>
> HawkCatcher supports [singleton instance getting]().

### Install

Use NPM or Yarn to install Catcher

```bash
$ npm install @hawk.so/nodejs --save
```

```bash
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

Just write your code next.

### Catch exceptions manually

You can catch exceptions by yourself without enabling handlers.

```nodejs
try {
  throw new Error('My lovely error');
} catch (e) {
  hawk.catch(e);
}
```

### HawkCatcher instance getting

Use singleton `getInstance([settings])` wrapper function to get `HawkCatcher`
class without creating a new instance manually.
It will help you do not use global variable for `HawkCatcher`.

#### Entry module:

You need to set up HawkCatcherInstance for a first require.

```js
const HawkCatcherInstance = require('@hawk.so/nodejs').default.getInstance({
  token: 'eyJh...Psc',
});
```

#### Required module:

Then you can get the instance without any settings.

```js
const HawkCatcherInstance = require('@hawk.so/nodejs').default.getInstance();

try {
  undefindedFunction();
} catch (e) {
  HawkCatcherInstance.catch(e);
}
```
