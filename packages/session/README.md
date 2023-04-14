# Primate session module

## Install

`npm i @primate/session`

## Load

Add to `primate.config.js`

```js
import session from "@primate/session";

export default {
  modules: [session()],
};
```

## Use

This module automatically creates and sends a session cookie with every
request. If the client sends a cookie that identifies an existing session id,
no new cookie is created.

The session's data (which consists only of `id` unless you change the
default manager) is made available to the route as `request.session`.

To illustrate this, assume you have a route in `routes/index.js` (which handles
`/`) with a GET method.

```js
export default {
  get(request) {
    // send a 200 OK, plain text with the cookie's id as body
    return request.session.id;
  },
};
```

## Configure

This module accepts a configuration object consisting of the following
properties.

### name: string

The session cookie's name, defaults to `"sessionId"`.

### sameSite: string

The cookie's `SameSite` attribute, defaults to `"Strict"`.

### path: string

The cookie's `Path` attribute, defaults to `"/"`.

### manager: (id: string) : {id: string}

The session manager. This is a function that is passed an id identifying a
session and returns the session object to be set on `request`.  The return
object must contain a `id` property. If the given id and the returned
`session.id` are different, a `Set-Cookie` header is added to the response.

Unless set, a default in-memory manager will be used, such that sessions do not
survive an app restart.
