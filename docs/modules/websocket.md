# WebSocket

This module adds WebSocket support in routes to your application.

## Install

`npm i @primate/ws`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import ws from "@primate/ws";

export default {
  modules: [
    ws(),
  ],
};
```

## Use

This module adds a new verb that you can use in your routes, `ws`. Although
web sockets are a `GET` upgrade, this route is distinct from a `get` route,
which you could use to send the JavaScript client used to connect. Like all
other routes, you can have multiple WebSocket routes each with their different
logic.

```js caption=routes/chat.js
import {view} from "primate";

export default {
  get() {
    return view("chat.html");
  },
  ws(request) {
    const limit = Number(request.query.get("limit"));
    let n = 1;
    return {
      message(payload) {
        if (n > 0 && n < limit) {
          n++;
          return `You wrote ${payload}`;
        }
      },
    };
  },
};
```

```html caption=components/chat.html
<script>
  window.addEventListener("load", () => {
    const ws = new WebSocket("ws://localhost:6161/chat?limit=20");
    ws.addEventListener("open", () => {
      document.querySelector("#chat").addEventListener("keypress", event => {
        if (event.key === "Enter") {
          ws.send(event.target.value);
          event.target.value = "";
        }
      })
    });
    ws.addEventListener("message", message => {
      const chatbox = document.querySelector("#box");
      const div = document.createElement("div");
      div.innerText = message.data
      chatbox.appendChild(div);
    })
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
<div class="chatbox" id="box">

</div>
<input id="chat" placeholder="Type to chat" />
```

By that example, a client requesting a `GET` WebSocket upgrade at
`/chat?limit=20` will be able to start chat communication with the server using
web sockets, with a limit of 20 messages.

## Resources
* [Repository][repo]
* [Error list](/reference/errors/primate/ws)

[repo]: https://github.com/primatejs/primate/tree/master/packages/ws
