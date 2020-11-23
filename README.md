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

Or

```js
import HawkCatcher from '@hawk.so/nodejs';
```

### Init HawkCatcher

Initialize HawkCatcher in the entry file of your project by passing a project token.

```js
const HAWK_TOKEN = 'eyJhb...VPsc';

HawkCatcher.init(HAWK_TOKEN);
```

HawkCatcher adds listeners for `uncaughtException` and `unhandledRejection` itself.

Just write your code.

#### Global event content

You can define global context for all event to be caught.

```js
HawkCatcher.init({
  token: HAWK_TOKEN,
  context: {
    myOwnDebugInfo: '1234'
  }
});
```

### Catch exceptions manually

After [initializing](init-hawkcatcher) you can catch exceptions manually in try-catch constructions in any project's place.

Just [require HawkCatcher](#require-hawkcatcher-module) and call `.send()` method.

```js
try {
  throw new Error('My lovely error');
} catch (e) {
  HawkCatcher.send(e);
}
```

If HawkCatcher was not initialized then `.send()` method will do nothing.

#### Event context

You can pass any information as context param for a single event.

 ```js
 try {
   throw new Error('User not found');
 } catch (e) {
   HawkCatcher.send(e, {
     myOwnDebugInfo: '1234'
   });
 }
 ```

This context object will be merged with global context if it exists.
