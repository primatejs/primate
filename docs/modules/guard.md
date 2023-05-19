# Route guards

This module adds route guards to your application.

## Install

`npm i @primate/guard`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import guard from "@primate/guard";

export default {
  modules: [guard()],
};
```

## Use

Create the guards in the `guards` directory. Guard files must be lowercase-first
and export a default function. A guard function is signed in the same way as
every route function, receiving a `request` object. The indicate the request is
allowed, return `true`. Anything else is interpreted as a failure and will be
used for handling the request.

```js caption=guards/loggedIn.js | ensuring a user is logged in
import {redirect} from "primate";

export default request => {
  if (request.session.get().loggedIn) {
    return true;
  }

  return redirect(`/login?next=${request.url.pathname}`);
};
```

This example assumes the [Session module](/modules/session) has been used to
persist user sessions, and that for logged in users, the session contains a
`loggedIn` property set to `true`. In that case, the guard allows the request
to pass through. In other cases, the guard returns a redirect to a login page.

To use this guard, call it in any route of your choice.

```js caption=routes/guarded-route | using guards in route functions
export default {
  get({guard}) {
    guard.loggedIn();

    return "protected";
  },
};
```

## Configuration options

### directory

Default `"guards"`

Directory where the guards reside.

## Resources

* [Repository][repo]
* [Error list](/reference/errors/primate/guard)

[repo]: https://github.com/primatejs/primate/tree/master/packages/guard
