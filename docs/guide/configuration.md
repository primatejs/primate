# Configuration

Primate is a zero-configuration framework and can be used without creating a
custom configuration. In most cases the defaults can be used without
modification.

## primate.config.js

If Primate doesn't find a `primate.config.js` in your project root directory
(the directory where your `package.json` resides) or this file does not export
a default object, Primate will fall back to its default configuration file.

```js file=primate.config.js (default)
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
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
    static: {
      root: "/",
      pure: false,
    },
  },
  paths: {
    static: "static",
    public: "public",
    routes: "routes",
    components: "components",
  },
  modules: [],
  dist: "app",
};
```

In you want to make adjustments to the defaults, create a `primate.config.js`
file in your project root. Primate will read it and merge any overrides with
the default configuration.

To illustrate this, if you wanted to change the default logging level to
`Info` instead of `Warn` and the HTTP port to 6262 you would create a
`primate.config.js` with the following changes.

```js file=primate.config.js (custom)
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

```js file=primate.config.js (merged)
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
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
    static: {
      root: "/",
      pure: false,
    },
  },
  paths: {
    static: "static",
    public: "public",
    routes: "routes",
    components: "components",
  },
  modules: [],
  dist: "app",
};
```

### base

Default `"/"`

Your app's base path. If your app is running from a domain's root path, leave
the default as is. If your app is running from a subpath, adjust accordingly.

This is used in CSP paths and the HTML `<base>` tag.

### logger.level

Default `Logger.Warn`

The logging level to be used. Primate has three logging levels, `Error`, `Warn`
and `Info`. For what they mean and how they are used, refer to the
[security section][logging].

### logger.trace

Default `false`

Whether Primate should show the original stack trace of errors in addition to
its own errors.

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
/* disallow <object>, <embed> and <applet> elements */
"object-src": "'none'",
/* disallowing embedding */
"frame-ancestors": "'none'",
/* all form submissions must be to own origin */
"form-action": "'self'",
/* allow only own origin in <base> */
"base-uri": "'self'",
}
```

The Content Security Policy (CSP) to be used. Primate's defaults are strictly
secure, you need to opt in for decreased security. For more information,
consult the [security section][csp].

### http.static.root

Default `"/"`

The path to serve static resources (those located in the `static` directory)
from. Static resources take precedence over routes. This option allows you to
have all static resources served from a namespaced path, like `/public`.

### http.static.pure

Default `false`

Whether all files in `static` should be copied to `public`. By default, certain
files (JavaScript, CSS) won't be copied over and instead be loaded into memory
to be served from there. If you're running a pure static server, it might make
sense to set this to `true`.

### http.ssl.{key,cert}

Default: `undefined`

The path to an SSL key and certificate pair. If both these properties are set
and point to a valid key/certificate pair, Primate will switch to https.
If specified as a relative path, will be relative to project root.

!!!
Primate does not load the key or certificate into memory. It only resolves
the paths as necessary and passes them to the [runtime][runtime].
!!!

### paths.static

Default `"static"`

The directory where static assets are copied from. If specified as a relative
path, will be relative to project root.

### paths.public

Default `"public"`

The directory where static assets are copied to and served from. If specified
as a relative path, will be relative to project root.

### paths.routes

Default `"routes"`

The directory where the hierarchy of route files resides. If specified as a
relative path, will be relative to project root.

### paths.components

Default `"components"`

The directory where components are localted. The `view` handler will try to
load any reference component filename from this directory. If specified as a
relative path, will be relative to project root.

### modules

Default `[]`

Instantiated modules. The order of loading modules affects the order in which
their hooks will be evaluated, and modules can depend on each using implicit or
explicit [load hooks][hooks-load].

### dist

Default `"app"`

The name of consolidated JavaScript and CSS files to be generated by bundlers.
This is relevant for modules which might need to know where to call entry
components from.

## static/index.html

If you use the `view` or `html` [handler](/guide/handling-requests#view),
Primate will embed the generated HTML from the handler into this file. If an
`index.html` does exist in the `static` directory, Primate will fall back to
its default index file.

```html file=static/index.html (default)
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

If you create an `index.html` file inside the `static` directory, Primate will
use it instead. When creating your own file, remember to include Primate's
`%head%` and `%body%` placeholders.

## %head%

This placeholder is replaced by the JavaScript and CSS files Primate finds
inside the `static` directory. You don't need to explicitly include any of
those in the `<head>` and doing so might make your index file drift out of sync
with the [http.static.root](#http-static-root) setting.

## %body%

This placeholder is replaced by whatever HTML code the `view` or `html`
handler generates.

[default-config]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/primate.config.js
[logging]: /guide/security#logging
[csp]: /guide/security#csp
[hooks-load]: /guide/hooks#load
[runtime]:
https://github.com/flogjs/std/blob/master/runtime-compat/http/src/serve.js
