# WebSocket

The WebSocket module adds support for WebSocket comminucation to your
application.

## Install

`npm i @primate/ws`

## Load

Import and initialize the module in your configuration.

```js caption=primate.config.js
import ws from "@primate/ws";

export default {
  modules: [ws()],
};
```

## Use

This module adds a new verb that you can use in your routes, `ws`. Although
web sockets are a `GET` upgrade, this route is distinct from a `get` route,
which you could use to send the JavaScript client used to connect. Like all
other routes, you can have multiply WebSocket routes each with their different
logic.

```js caption=routes/chat.js | GET+WS /chat 
import {view} from "primate";

export default {
  get() {
    return view("chat.html");
  },
  ws(request) {
    const {limit} = Number(request.query);
    return {
      connection() {
        return "hi";
      },
      message(payload) {
        let n = 1;
        if (n > 0 && n < limit) {
          n++;
          return `You wrote ${payload}`;
        }
      },
    };
  },
};
```

```html caption=components/chat.html | chat client
<script>
  const ws = new WebSocket("ws://localhost:6161/chat?limit=100");
  ws.addEventListener("message", message => {
    ws.send(`you sent ${message}`);
  })
</script>
```

By that example, a client requesting a `GET` WebSocket upgrade at
`/chat?limit=100` will be able to start communication bidirectionally with the
server using web sockets.

## Resources

* [Repository](https://github.com/primatejs/primate/tree/master/packages/ws)
* [Error list](/reference/errors/primate/ws)
