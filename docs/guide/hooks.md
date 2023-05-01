# Hooks

Hooks are executed throughout various stages in the lifecycle of a Primate app.
Some will execute only once on startup, others on given events. Hook
subscribers accept different types of parameters, depending on the hook.

## Lifecycle

```sh file=lifecycle of a Primate app
├─ # read configuration and merge with defaults
│
├─ `load`
│   └─ # modules initialize / load other modules
|
├─ # BEGIN start-up phase, all hooks in this phase are called once
|
├─ `register`
│   └─ # modules register component file extensions for the `view` handler
|
├─ `compile`
│   └─ # modules compile server-side files into JavaScript
|
├─ `publish`
│   └─ # modules publish client-side code and entry points to memory
|
├─ # evalute entry points, load JavaScript/CSS files in `static` to memory
|
├─ # create `public` and copy files from `static` to `public`
|
├─ `bundle` # if `npx primate serve` is run, otherwise skipped
│   └─ # modules transform in-memory client-side code
|
├─ # END start-up phase
|
├─ # BEGIN on client request, all hooks in this phase are called per request
|
├─ `handle` # on client request
│   └─ # modules handle client request themselves or yield to `next`
├─ # if yielded through, match request against static resources in `public`
|
├─ # if unmatched, match request against in-memory resources
|
├─ `route` # if previously unmatched
│   └─ # modules handle routing request themselves or yield to `next`
|
| # if yielded through, match a route and execute it
|
| # if unmatched, show a 404 error
|
├─ # END on client request
```

## load

**Executed** once

**Precondition** configuration has been read and merged with defaults

The first hook to be called, directly after app start-up and reading in the
configuration file. This hook is for modules to initialize state or load other
modules.

```js file=primate.config.js
export default {
  modules: [{
    name: "load-hook-example-module",
    /* receives the app object, augmented with a `load` function */
    load(app) {
      app.load({
        name: "dependent-module"  
      }),
    },
  }],
};
```

!!!
Dependent modules loaded using `app.load` **are not** currently triggered
by `load` hook. Also, unlike all other hooks, the `load` hook does not accept a
final `next` parameter.
!!!

## register

**Executed** once

**Precondition** none

This hooks allows modules to register a component file extension to be handled
by `view`.

```js file=primate.config.js
/**
/* @param {string} name the component name, for example `clock.mustache` 
/* @param {object} props any props passed to the component
/* @param {options} options any additional options passed to the component
 */
const mustacheHandler = (name, props, options) => {
  /* load the component file and render it into HTML using props */
};

export default {
  modules: [{
    name: "register-hook-example-module",
    /* receives the app object, augmented with a `register` function */
    register(app, next) {
      app.register("mustache", mustacheHandler);
      return next(app);
    },
  }],
};
```

Using this definition, any `.mustache` file in `components` will be handled by
the specified `mustacheHandler` function.

```js file=routes/clock.js
import {view} from "primate";

export default {
  get(request) {
    const {time} = request.query;
    return view("clock.mustache", {time});
  },
};
```

Assuming a clock component which takes a time value and shows a clock has been
defined in `components/clock.mustache`, a client requesting
`GET /clock?time=11:45am` will have the `view` handler show a mustache
component rendered into HTML.

## compile

***Executed** once

**Precondition** none

This hook allows modules to compile server-side files into JavaScript. Is it
particularly useful for [frontend frameworks][frontend-frameworks] which use
their own domain-specific languages (React's `.jsx`, Vue's `.vue` (SFC),
Svelte's `.svelte` etc.), to be served through server-side rendering.

This hook receives the app object as its first and the next subscriber as its
second parameter.

## publish

***Executed** once

**Precondition** none

This hook allows modules to publish client-side code and entry points to
memory. Primate loads and serves JavaScript/CSS files in the `static`
directory directly from memory, and this hook is particularly useful for
[frontend frameworks][frontend-frameworks], which might need to register their
own core scripts.

Publishing entry points allow bundler modules to effectivly consolidate code
during the `bundle` hook.

This hook receives the app object as its first and the next subscriber as its
second parameter.

## bundle

!!!
This hook only executes if Primate has been explicitly run with
`npx primate serve`. Running `npx primate` skips this hook. This allows you to
turn bundling on and off as necessary.
!!!

**Executed** once

**Precondition** all entry points have been evaluated, JavaScript/CSS files in
`static` have been loaded to memory, and the `public` directory has been
created with non Javascript/CSS files copied into it from `static`

This hook allows modules to transform client-side code and entry points which
have been loaded into memory previously, either during the `publish` hook or by
Primate loading them from the `static` directory, into consolidated code. It is
particularly useful for bundler modules such as [esbuild](/modules/esbuild).

This hook receives the app object as its first and the next subscriber as its
second parameter.

## handle

**Executed** for every request

**Precondition** all start-up hooks have been executed, and Primate is serving
content

This hook allows modules to handle requests themselves, before Primate will
try to handle them on its own. It has the highest priority: it is resolved
before any static or in-memory resources are served and before route functions
are matched.

It is particularly useful for modules which modify the request object in a way
that exposes further functionality for all subsequent handlers, such as the
[session module](/modules/session).

```js file=primate.config.js
const augment = request => {
  /* augment request with additional properties such client ip, by reading them
     from the original request at `request.original` */
  return request;
};

export default {
  modules: [{
    name: "handle-hook-example-module",
    /* receives the request object without the `path` property */
    handle(request, next) {
      return next(augment(request));
    },
  }],
};
```

## route

**Executed** for every request

**Precondition** the request hasn't been completely handled by any `handle`,
and no static or in-memory resource has been matched by the request

This hook allows modules to handle the routing of requests, after they have
been handled by everything else aside from the route function, but before a
route function has been matched. It is particularly useful if you want to treat
certain routes in a special way, but otherwise let Primate do the routing for
you.

```js file=primate.config.js
const delegate = request => {
  /* pass the request to admin app */
};

export default {
  modules: [{
    name: "route-hook-example-module",
    /* receives the request object without the `path` property */
    route(request, next) {
      if (request.url.pathname.startsWith("/admin")) {
        // delegate request to admin app
        return delegate(request);
      }
      // otherwise let Primate handle the request
      return next(request);
    },
  }],
};
```

## When should I call \`next\`?

Calling `next` in a hook means calling the next module in line which has
subscribed to the hook, and in the case of the `handle` and `route` hooks,
eventually passing over control back to Primate. Most of the time, it makes
sense to call `next` because you want other modules to do their job. However,
especially in the case of `handle` and `route`, you sometimes deliberately
don't want to call `next` because you're handling or routing the request
completely on your own. In some circumstances, a hybrid solution makes the most
sense: some requests you're handling on your own, and for some you want the
normal Primate logic to run its due course.



[frontend-frameworks]: /modules/frameworks
