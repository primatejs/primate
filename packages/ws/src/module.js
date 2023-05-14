import {WebSocketServer} from "ws";
import {URL} from "runtime-compat/http";
import errors from "./errors.js";

export default () => {
  return {
    name: "@primate/ws",
    serve: (app, next) => {
      const wss = new WebSocketServer({noServer: true});
      const up = response => socket => wss.emit("connection", socket, response);

      wss.on("connection", async (socket, response) => {
        const {connection, message} = response;
        const greeting = await connection();
        greeting !== undefined && socket.send(greeting);
        socket.on("message", async data => {
          const reply = await message(data.toString("utf8"));
          reply !== undefined && socket.send(reply);
        });
      });
      app.server.addListener("upgrade", async (request, socket, head) => {
        const url = new URL(request.url, "https://p.com");
        try {
          const response = await app.route({original: {method: "ws"}, url});
          response?.connection ?? errors.InvalidHandler.throw();
          wss.handleUpgrade(request, socket, head, up(response));
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
