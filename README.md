# Primate, A JavaScript Framework

A full-stack Javascript framework, Primate relieves you of dealing with
repetitive, error-prone tasks and lets you concentrate on writing effective,
expressive code.

## Installing

```
$ npm install primate
```

## Quick start

Lay out your app

```
$ mkdir -p primate-app/{routes,components,ssl} && cd primate-app
```

Create a route for `/`

```
// routes/site.js

import {router, html} from "primate";

router.get("/", () => html`<site-index date=${new Date()} />`);
```

Create component for your route

```
// components/site-index.html

Today's date is <span data-value="date"></span>.
```

Generate SSL key/certificate

```
openssl req -x509 -out ssl/default.crt -keyout ssl/default.key -newkey rsa:2048 -nodes -sha256 -batch
```

Add an entry file

```
// app.js

import {app} from "primate";
app.run();
```

Create and start script and enable ES modules

```
// package.json

{
  "scripts": {
    "start": "node --experimental-json-modules app.js"
  },
  "type": "module"
}
```

Install Primate

```
$ npm install primate
```

Run app

```
$ npm start
```

Visit `https://localhost:9999`

## Highlights

* Flexible HTTP routing, returning HTML, JSON or a custom handler
* Secure by default with HTTPS, hash-verified scripts and a strong CSP
* Built-in support for sessions with secure cookies
* Input verification using data domains
* Many different data store modules: In-Memory (built-in),
[File][primate-file-store], [JSON][primate-json-store],
[MongoDB][primate-mongodb-store]
* Easy modelling of`1:1`, `1:n` and `n:m` relationships
* Minimally opinionated with sane, overrideable defaults
* No dependencies

## Resources

* [Getting started guide]

## License

BSD-3-Clause

[getting-started]: https://primatejs.com/getting-started
[source-code]: https://github.com/primatejs/primate
[issues]: https://github.com/primatejs/primate/issues
[primate-file-store]: https://npmjs.com/primate-file-store
[primate-json-store]: https://npmjs.com/primate-json-store
[primate-mongodb-store]: https://npmjs.com/primate-mongodb-store
