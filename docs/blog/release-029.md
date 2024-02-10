Today we're announcing the availability of the Primate 0.29 preview release.
This release introduces support for Angular and Marko on the frontend and MySQL
on the backend, as well as two new core handlers for WebSockets and Server-sent
events across all runtimes.

!!!
If you're new to Primate, we recommend reading the [Getting started] page to
get an idea of it.
!!!

## Angular

This release adds Angular to the list of frameworks Primate supports. With
Angular, Primate now supports all major frontend frameworks using a unified
view rendering API on the server. This handler supports SSR and serves Angular
components with the `.component.ts` extension.

### Install

To add support for Angular, install the `@primate/frontend` module and Angular
dependencies.

`npm install @primate/frontend @angular/{compiler,core,platform-browser,platform-server,ssr}@17 esbuild@0.20`

### Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { angular } from "@primate/frontend";

export default {
  modules: [
    angular(),
  ],
};
```

### Use

Create an Angular component in `components`.

```ts caption=components/post-index.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "post-index",
  imports: [ CommonModule ],
  standalone: true,
  template: `
    <h1>All posts</h1>
    <div *ngFor="let post of posts">
      <h2>
        <a href="/post/view/{{post.id}}">
          {{post.title}}
        </a>
      </h2>
    </div>
  `,
})
export default class PostIndex {
  @Input() posts = [];
}
```

Serve it from a route.

```js caption=routes/angular.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.component.ts", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/angular.

## Marko

This release adds Marko to the list of frameworks Primate supports. This 
handler supports SSR and serves Marko components with the `.marko` extension.

### Install

`npm install @primate/frontend @marko/{compiler,translator-default}@5`

### Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { marko } from "@primate/frontend";

export default {
  modules: [
    marko(),
  ],
};
```

### Use

Create a Marko component in `components`.

```html caption=components/post-index.marko
<h1>All posts</h1>
<for|post| of=input.posts>
  <h2>
    <a href="/post/view/${post.id}">
      ${post.title}
    </a>
  </h2>
</for>
```

Serve it from a route.

```js caption=routes/marko.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.marko", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/marko.

## MySQL database support

This release introduces support for MySQL using the `mysql2` driver. The MySQL
driver supports all of Primate's ORM operations as well as transactions and
connection pools. In addition to installing the `mysql2` package, this driver 
requires running a MySQL server either locally or remotely. Visit the MySQL 
website or consult your operating system's manuals on how to install and run a
server.

### Install

`npm install @primate/store mysql2@3`

### Configure

The MySQL driver uses the `host` (default `"localhost"`), `port` (default
`3306`) `database`, `user`, and `password` configuration properties.

```js caption=primate.config.js
import { default as store, mysql } from "@primate/store";

export default {
  modules: [
    store({
      // use the MySQL server at localhost:3306 and the "app" database
      driver: mongodb({
        // if "localhost", can be omitted
        host: "localhost",
        // if 3306, can be omitted
        port: 3306,
        database: "app",
        user: "username",
        // can be omitted
        password: "password",
      }),
    }),
  ],
};
```

Once configured, this will be the default driver for all stores.

## New handlers for WebSockets and Server-sent events

With WebSocket support having moved into [rcompat][rcompat], we deprecated the
`@primate/ws` package in favor of inclusion into core as the `ws` handler. In
addition, we added a new handler for Server-sent events, `sse`.

### WebSocket handler

You can now upgrade any `GET` route to a WebSocket route with the `ws` handler.

```js caption=routes/ws.js
import { ws } from "primate";

export default {
  get(request) {
    const limit = request.query.get("limit") ?? 20;
    let n = 1;
    return ws({
      open(socket) {
        // connection opens
      },
      message(socket, message) {
        if (n > 0 && n < limit) {
          n++;
          socket.send(`You wrote ${payload}`);
        }
      },
      close(socket) {
        // connection closes
      },
    });
  },
};
```

In this example, we have a small chat which reflects back anything to the user
up to a given number of messages, the default being 20.

```html caption=components/chat.html
<script>
  window.addEventListener("load", () => {
    // number of messages to reflect
    const limit = 20;
    const ws = new WebSocket(`ws://localhost:6161/chat?limit=${limit}`);

    ws.addEventListener("open", () => {
      document.querySelector("#chat").addEventListener("keypress", event => {
        if (event.key === "Enter") {
          ws.send(event.target.value);
          event.target.value = "";
        }
      });
    });

    ws.addEventListener("message", message => {
      const div = document.createElement("div");
      div.innerText = message.data;
      document.querySelector("#box").appendChild(div);
    });
  });
</script>
<style>
.chatbox {
  background-color: lightgrey;
  width: 300px;
  height: 300px;
  overflow: auto;
}
</style>
<div class="chatbox" id="box"></div>
<input id="chat" placeholder="Type to chat" />
```

### Server-sent events handler

Similarly to `ws`, you can use the `sse` handler to upgrade a `GET` request to
stream out server-sent events to the client.

```js caption=routes/sse.js
import { sse } from "primate";

const passed = start_time => Math.floor((Date.now() - start_time) / 1000);

export default {
  get() {
    let interval;
    let start_time = Date.now();

    return sse({
      open(source) {
        // connection opens
        interval = globalThis.setInterval(() => {
          source.send("passed", passed(start_time));
        }, 5000);
      },
      close() {
        // connection closes
        globalThis.clearInterval(interval);
      },
    });
  },
};
```

In this example, we send a `passed` event to the client every 5 seconds,
indicating how many seconds have passed since the connection was established.
The client subscribes to this event and prints it to the console.

```html components/sse-client.html
<script>
  new EventSource("/sse").addEventListener("passed", event => {
    console.log(`${JSON.parse(event.data)} seconds since connection opened`);
  });
</script>
```

This client is then served using another route.

```js routes/sse-client.js
import { view } from "primate";

export default {
  get() {
    return view("sse-client.html");
  },
};
```

## Migrating from 0.28

### remove @primate/ws

You no longer need to import and use `@primate/ws` in order to use WebSockets.
Use the built-in `ws` handler instead.

### remove @primate/liveview

You no longer need to import and use `@primate/liveview` for your application
to use SPA browsing. If you wish to deactive SPA browsing, pass `{ spa: false }`
to the frontend handler in your configuration file.

## Other changes

Consult the [full changelog][changelog] for a list of all relevant changes.

## Next on the road

Some of the things we plan to tackle in the upcoming weeks are,

* Add projections and relations to stores
* Multidriver transactions
* Add a `command` hook that would allow modules to register command line
  namespaces, to be able to run `npx primate [namespace] [command] [flags]`
* Use this new hook to create database migrations for SQL-flavored databases
* Add hydration and liveview support for `@primate/vue`
* Flesh out stores with default values, additional predicates and relations
  between tables/collections
* Add more type variants

This list isn't exhaustive or binding. None, some or all of these features may
be included in 0.30, and other features may be prioritized according to
feedback.

## Fin

If you like Primate, consider [joining our channel #primate][irc] on
irc.libera.chat.

Otherwise, have a blast with the new version!

[Getting started]: /guide/getting-started
[irc]: https://web.libera.chat#primate
[changelog]: https://github.com/primatejs/primate/releases/tag/0.29.0
[rcompat]: https://github.com/rcompat/rcompat
