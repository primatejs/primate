# Configuration

Primate is a zero-configuration framework and can be used without creating a
custom configuration. In most cases the defaults can be used as is.

## primate.config.js

If Primate doesn't find a `primate.config.js` in your project root directory
(the directory where your `package.json` resides) or this file does not export
a default object, Primate will fall back to its default configuration file.

```js caption=primate.config.js | default configuration
import {Logger} from "primate";

export default {
  base: "/",
  logger: {
    level: Logger.Warn,
  },
  http: {
    host: "localhost",
    port: 6161,
    csp: {
      "default-src": "'self'",
      "style-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
    static: {
      root: "/",
    },
  },
  index: "app.html",
  paths: {
    build: "build",
    components: "components",
    pages: "pages",
    routes: "routes",
    static: "static",
    types: "types",
  },
  build: {
    includes: [],
    static: "static",
    app: "app",
    modules: "modules",
    index: "index.js",
  },
  modules: [],
  types: {
    explicit: false,
  },
};
```

In case you want to make adjustments to the defaults, create a
`primate.config.js` file in your project root. Primate will read it and merge
any overrides with the default configuration.

To illustrate this, if you wanted to change the default logging level to
`Info` instead of `Warn` and the HTTP port to `6262` you would create a
`primate.config.js` with the following changes.

```js caption=primate.config.js | custom configuration
import {Logger} from "primate";

export default {
  logger: {
    level: Logger.Info,
  },
  http: {
    port: 6262,
  },
};
```

Primate will merge your custom configuration with its default, resulting in
effectively the following configuration.

```js caption=primate.config.js | merged configuration
import {Logger} from "primate";

export default {
  base: "/",
  logger: {
    level: Logger.Info,
  },
  http: {
    host: "localhost",
    port: 6262,
    csp: {
      "default-src": "'self'",
      "style-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
    static: {
      root: "/",
    },
  },
  index: "app.html",
  paths: {
    build: "build",
    components: "components",
    pages: "pages",
    routes: "routes",
    static: "static",
    types: "types",
  },
  build: {
    includes: [],
    static: "static",
    app: "app",
    modules: "modules",
    index: "index.js",
  },
  modules: [],
  types: {
    explicit: false,
  },
};
```

### base

Default `"/"`

Your app's base path. If your app is running from a domain's root path, leave
the default as is. If your app is running from a subpath, adjust accordingly.

This is used in CSP paths.

### logger

Configuring [Logging in Primate](/guide/logging).

### logger.level

Default `Logger.Warn`

The logging level to be used. Primate has three logging levels, `Error`, `Warn`
and `Info`. For what they mean and how they are used, refer to the
[security section][security-logging].

### logger.trace

Default `false`

Whether Primate should show the original stack trace of errors in addition to
its own errors.

### http

Configuring the underlying HTTP server.

### http.host

Default `"localhost"`

The HTTP host to be used. This value is directly passed to the runtime.

### http.port

Default `6161`

The HTTP port to be used. This value is directly passed to the runtime.

### http.csp

Default

```js
{
/* all content must come from own origin, excluding subdomains */
"default-src": "'self'",
/* styles must come from own origin, excluding subdomains */
"style-src": "'self'",
/* disallow <object>, <embed> and <applet> elements */
"object-src": "'none'",
/* disallow embedding */
"frame-ancestors": "'none'",
/* all form submissions must be to own origin */
"form-action": "'self'",
/* allow only own origin in <base> */
"base-uri": "'self'",
}
```

The Content Security Policy (CSP) to be used. Primate's defaults are strictly
secure, you would need to change them for decreased security. For more
information, consult the [security section][security-csp].

### http.static.root

Default `"/"`

The path from which to serve static assets (those located in the `static`
directory and copied during runtome to the `build/client/static` directory).
Static assets take precedence over routes. This option allows you to have all
static assets served from a subpath, like `/public`.

### http.ssl.{key,cert}

Default: `undefined`

The path to an SSL key and certificate pair. If both these properties are set
and point to a valid key/certificate pair, Primate will switch to https.
If specified as a relative path, will be relative to project root.

!!!
Primate does not load the key or certificate into memory. It only resolves
the paths as necessary and passes them to the [runtime][runtime].
!!!

### index

Default: `app.html`

Name of the default HTML page located in `paths.pages`. If `paths.pages` does
not exist or contain this file, Primate will use its
[default app.html](default-app-html).

### paths

Locations of standard directories for different aspects of Primate. If any of
these paths are relative, they will be relative to project root.

### paths.build

Default `"build"`

The directory where your app's server and client files are created and served
from.

### paths.components

Default `"components"`

The directory where components are located. [Components](/guide/components) are
used as HTML files or by frontend frameworks. The `view` handler will try to
load any referenced component file from this directory.

### paths.pages

Default `"pages"`

The directory where pages are loaded from. If this directory doesn't exist and
you use the `view` or `html` handler, Primate will use its default `app.html`
as the default page.

### paths.routes

Default `"routes"`

The directory where the hierarchy of route files resides.

### paths.static

Default `"static"`

The directory where static assets are copied from to the client part of the 
build directory, located in `{paths.build}/client/{build.static}`, where
`paths.build` and `build.static` are configuration options.

### paths.types

Default `"types"`

The directory where types are located. [Types](/guide/types) can be
used to limit the range of possible values that a variable can hold.

### build

Build options.

### build.includes

A list of directories to be included in the server and client build. May not
include `routes`, `components`, `build`, or any of the configuration options
`build.static`, `build.app`, `build.modules`.

### build.static

The subdirectory target of files copied from `paths.static` into the
`client` directory in `paths.build`. If `paths.build` is set to `build` and
`build.static` to `static`, will be copied to `build/client/static`.

### build.app

The subdirectory target of files copied from `paths.components` into the
`server` and `client` directories in `paths.build`. If `paths.build` is set to
`build` and `build.app` to `app`, will be copied to `build/server/app` and
`build/client/app`.

### build.modules

The subdirectory target of module imports copied into the `server` and `client` 
directories in `paths.build`. If `paths.build` is set to `build` and
`build.modules` to `modules`, will be copied to `build/server/modules` and
`build/client/modules`.

### build.index

Filename of the index JavaScript used to export all components.

### modules

Default `[]`

Instantiated modules. The order of loading modules affects the order in which
their hooks will be evaluated, and modules can depend on each using implicit or
explicit [load hooks][hooks-load].

## pages/app.html

If you use the `view` or `html` [handler](/guide/requests#view), Primate will
embed the generated HTML from the handler into this file. If an `app.html`
doesn't exist in the `pages` directory, Primate will fall back to its default
index file.

```html caption=pages/app.html
<!doctype html>
<html>
  <head>
    <title>Primate app</title>
    <meta charset="utf-8" />
    %head%
  </head>
  <body>%body%</body>
</html>
```

If you create an `app.html` file inside the `pages` directory, Primate will
use it instead. When creating your own file, remember to include the `%head%`
and `%body%` placeholders.

## %head%

This placeholder is replaced by the JavaScript and CSS files Primate finds
inside the `static` directory. You don't need to explicitly include any of
those in the `<head>` and doing so might make your index file drift out of sync
with the [http.static.root](#http-static-root) setting.

## %body%

This placeholder is replaced by whatever HTML code the `view` or `html`
handler generates.

[security-logging]: /guide/security#logging
[security-csp]: /guide/security#csp
[hooks-load]: /guide/hooks#load
[default-app-html]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/app-html
[default-config]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/primate.config.js
[runtime]:
https://github.com/flogjs/std/blob/master/runtime-compat/http/src/serve.js
