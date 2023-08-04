# primate/ws

List of errors in the [WebSocket module](/modules/websocket).

## Invalid Handler

Level [`Error`][error]

WebSocket routes must return a valid handler, such as,

```js caption=routes/websocket-route.js | valid handler
export default {
  ws() {
    return {
      message(payload) {
        return `You sent ${JSON.stringify(payload)}!`;
      },
    };
  },
};
```

**As a handler, return an object that handles at least the `message` event.**

[error]: /guide/logging#error
