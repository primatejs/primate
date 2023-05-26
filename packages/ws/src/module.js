import {WebSocketServer} from "ws";
import {URL, Request} from "runtime-compat/http";
import errors from "./errors.js";

export default () => {
  return {
    name: "@primate/ws",
    serve: (app, next) => {
      const wss = new WebSocketServer({noServer: true});
      const up = response => socket => wss.emit("connection", socket, response);

      wss.on("connection", async (socket, response) => {
        const {connection, message} = response;
        const greeting = await connection?.();
        greeting !== undefined && socket.send(greeting);
        socket.on("message", async data => {
          const reply = await message(data.toString("utf8"));
          reply !== undefined && socket.send(reply);
        });
      });

      app.server.addListener("upgrade", async (req, socket, head) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const request = new Request(`${url}`, {
          headers: req.headers,
          method: "ws",
          body: req,
        });
        try {
          const response = await app.route(await app.parse(request));
          response?.message ?? errors.InvalidHandler.throw(
            "ws", "message", "{message(payload) { return payload; }}");
          wss.handleUpgrade(req, socket, head, up(response));
        } catch (error) {
          socket.destroy();
          if (error.level !== undefined) {
            app.log.auto(error);
          }
        }
      });
      return next(app);
    },
  };
};
