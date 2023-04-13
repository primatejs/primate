# Primate sessions module

## Install

`npm i @primate/sessions`

## Configure

Add to `primate.config.js`

```js
import react from "@primate/sessions";

export default {
  modules: [sessions()],
};
```

## Use

This module automatically creates and sends a session cookie with every
request. The session's data (which consists of `id` unless you change the
default manager) is made available to the request as `request.session`.

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
