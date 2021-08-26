# @hawk.so/nodejs

Node.js errors Catcher module for [Hawk.so](https://hawk.so)

## Initial params

Initialization params:

| name | type | required | description |
| -- | -- | -- | -- |
| `token` | string | **required** | Your project's Integration Token |
| `release` | string | optional | Unique identifier of the release. |
| `context` | object | optional | Any data you want to pass with every message. |
| `disableGlobalErrorsHandling` | boolean | optional | Do not initialize global errors handling |
| `beforeSend` | function(event) => event | optional | This Method allows you to filter any data you don't want sending to Hawk |


## Usage

1. [Create](https://hawk.so/) an account and get an Integration Token.
2. Add [@hawk.so/nodejs](https://www.npmjs.com/package/@hawk.so/nodejs) package to your project.
3. `Require` and initialize module.

### Install

Use NPM or Yarn to install Catcher `@hawk.so/nodejs`.

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
const HAWK_TOKEN = 'eyJhb...VPsc=';

HawkCatcher.init(HAWK_TOKEN);
```

HawkCatcher adds listeners for `uncaughtException` and `unhandledRejection` itself.

#### Disable global errors handling

If you don't want to initialize handlers for global exceptions then use `disableGlobalErrorsHandling` param.

```js
HawkCatcher.init({
  token: HAWK_TOKEN,
  disableGlobalErrorsHandling: true,
});
```

Then you can catch events manually.

### Global context

You can define global context for all event to be caught.

```js
HawkCatcher.init({
  token: HAWK_TOKEN,
  context: {
    myOwnDebugInfo: '1234'
  }
});
```

### Releases

To mark events to specific release pass the `release` identifier string to intial config.

```js
HawkCatcher.init({
  token: 'INTEGRATION TOKEN',
  release: process.env.releaseId
})
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

#### User

You can send user data as a third param.

Available fields:
| Param | Type | Is required | Description |
| --- | --- | --- | --- |
| id | `string\|number` | required | User's identifier |
| name | `string` | - | User's name |
| url | `string` | - | User's profile url |
| image | `string` | - | User's profile pic url |

 ```js
 try {
   throw new Error('Cannot create a new post');
 } catch (e) {
   HawkCatcher.send(e, {}, {
     id: 1234,
     name: 'Taly'
});
 }
 ```

### Sensitive data filtering

You can filter any data that you don't want to send to Hawk. Use the `beforeSend()` hook for that reason.

```js
HawkCatcher.init({
  token: 'INTEGRATION TOKEN',
  beforeSend(event){
    if (event.user && event.user.name){
      delete event.user.name;
    }

    return event;
  }
})
```
