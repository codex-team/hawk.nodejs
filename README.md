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
| `beforeSend` | function(event) => event \| false \| void | optional | Filter data before sending. Return modified event, `false` to drop the event. |
| `breadcrumbs` | `false` or object | optional | Pass `false` to disable. Pass options object to configure (see [Breadcrumbs](#breadcrumbs)). Default: enabled. |


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

#### For CommonJS projects

```js
const HawkCatcher = require('@hawk.so/nodejs').default;
```

#### For ESM projects

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

### Breadcrumbs

Breadcrumbs track events leading up to an error, providing context for debugging. Same API as [@hawk.so/javascript](https://www.npmjs.com/package/@hawk.so/javascript) (add, get, clear); in Node there is no automatic tracking of fetch/navigation/clicks, only manual breadcrumbs.

#### Default configuration

By default, breadcrumbs are enabled (custom breadcrumbs only):

```js
HawkCatcher.init({
  token: 'INTEGRATION_TOKEN'
  // breadcrumbs enabled by default
});
```

#### Disabling breadcrumbs

To disable breadcrumbs entirely:

```js
HawkCatcher.init({
  token: 'INTEGRATION_TOKEN',
  breadcrumbs: false
});
```

#### Custom configuration

Configure breadcrumbs (same options as JS where applicable):

```js
HawkCatcher.init({
  token: 'INTEGRATION_TOKEN',
  breadcrumbs: {
    maxBreadcrumbs: 20,
    beforeBreadcrumb: (breadcrumb, hint) => {
      if (breadcrumb.category === 'auth' && breadcrumb.data?.userId) {
        return false; // Discard
      }
      return breadcrumb;
    }
  }
});
```

#### Breadcrumbs options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxBreadcrumbs` | `number` | `15` | Maximum number of breadcrumbs to store. When the limit is reached, oldest breadcrumbs are removed (FIFO). |
| `beforeBreadcrumb` | `function` | `undefined` | Hook called before each breadcrumb is stored. Receives `(breadcrumb, hint)`. Return modified breadcrumb to keep it, `false` to discard. |

#### Manual breadcrumbs

Add custom breadcrumbs manually. Breadcrumbs accumulate in a buffer and are attached to every event until explicitly cleared via `HawkCatcher.breadcrumbs.clear()`:

```js
HawkCatcher.breadcrumbs.add({
  type: 'logic',
  category: 'auth',
  message: 'User logged in',
  level: 'info',
  data: { userId: '123' }
});
```

#### Breadcrumb methods

Same as in JS catcher:

```js
// Add a breadcrumb
HawkCatcher.breadcrumbs.add(breadcrumb, hint);

// Get current breadcrumbs
const breadcrumbs = HawkCatcher.breadcrumbs.get();

// Clear all breadcrumbs
HawkCatcher.breadcrumbs.clear();
```

### Sensitive data filtering

Use the `beforeSend()` hook to filter data before sending to Hawk.

- **Return modified event** — the modified event will be sent
- **Return `false`** — the event will be dropped entirely
- **Return nothing (`void` / `undefined` / `null`)** — the original event will be sent as-is
- If `beforeSend` returns an invalid payload, a warning is logged and the original event is sent

```js
HawkCatcher.init({
  token: 'INTEGRATION TOKEN',
  beforeSend(event) {
    // Strip sensitive user data
    if (event.user && event.user.name) {
      delete event.user.name;
    }

    return event;
  }
});
```

Drop an event entirely:

```js
HawkCatcher.init({
  token: 'INTEGRATION TOKEN',
  beforeSend(event) {
    if (event.title.includes('ignore-me')) {
      return false;
    }

    return event;
  }
});
```

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
See the [LICENSE](./LICENSE) file for the full text.
