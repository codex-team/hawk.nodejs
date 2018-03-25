# hawk.nodejs

Node.js errors Catcher module for [Hawk.so](https://hawk.so)

## Usage

[Register](https://hawk.so/join) an account and get a project token.

### Install module

Use [npm](https://www.npmjs.com) to install Catcher

```bash
$ npm install @codexteam/hawk.nodejs
```

#### Download and require node.js file

You can download this repository and require `Hawk.nodejs` file in your project.

```nodejs
require './hawk.nodejs/src/hawk';
```

### Init HawkCatcher

Create an instance with token to the entry point of your project.

```nodejs
var hawkCatcher = require('@codexteam/hawk.nodejs')({
  accessToken: "69d86244-f792-47ad-8e9a-23fee358e062"
});
```

#### Custom Hawk server

If you want to use custom Hawk server then pass a url to this catcher.

```nodejs
var hawkCatcher = require('@codexteam/hawk.nodejs')({
  accessToken: "69d86244-f792-47ad-8e9a-23fee358e062",
  url: "https://myownhawk.com/catcher/nodejs"
});
```

### Catch exception

You can catch exceptions by yourself without enabling handlers.

```nodejs
try {
  throw new Exception("");
} catch (e) {
  hawkCatcher.catchException(e, {comment: "Exception in general module"});
}
```

## Links

Repository: https://github.com/codex-team/hawk.nodejs

Report a bug: https://github.com/codex-team/hawk.nodejs/issues

CodeX Team: https://ifmo.su