# Session

This module adds cookie-based sessions to your application.

## Install

`npm i @primate/session`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import session from "@primate/session";

export default {
  modules: [session()],
};
```

## Use

This module creates and sends a session cookie with the response using the
`Set-Cookie` header. If the client issues a request with a cookie that
identifies an existing session id, no new cookie is created or sent.

The session's data (which consists only of `id` unless you change the
default manager) is made available to the route function as `request.session`.

```js caption=routes/index.js
export default {
  get(request) {
    // send a 200 OK, plain text with the cookie's id as body
    return request.session.id;
  },
};
```

By that example, a client requesting `GET /` will see its own session id.

## Configuration options

### name

Default `"sessionId"`

The session cookie's name.

### sameSite

Default `"Strict"`

The cookie's `SameSite` attribute.

### path

Default `"/"`

The cookie's `Path` attribute.

### manager

Default [in-memory session manager][inMemorySessionManager]

The session manager. This is a function that is given an id identifying a
session and returns a session object to be set on `request`. The return
object must contain a `id` property. If the given id and the returned
`session.id` differ, a `Set-Cookie` header is added to the response.

Unless set, a default in-memory manager will be used, such that sessions do not
survive an app restart.

## Security

**Protocol downgrade attacks** cookies are sent with the `Secure` attribute if
Primate [is running on https](/guide/configuration#http-ssl-key-cert)

**Cross-site scripting attacks** cookies are always sent with the `HttpOnly`
attribute

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/session
[inMemorySessionManager]: https://github.com/primatejs/primate/blob/master/packages/session/src/module.js#L7-L19
