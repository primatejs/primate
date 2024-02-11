import pkgname from "#pkgname";

export default () => ({
  name: pkgname,
  serve(app, next) {
    const live = {
      subscribers: {},
      subscribe({ ids, socket }) {
        ids.forEach(id => {
          const current = this.subscribers[id];
          this.subscribers[id] = current ? [...current, socket] : [socket];
        });
      },
      send(id, val) {
        const sockets = this.subscribers[id];
        sockets?.forEach(socket => {
          socket.send(JSON.stringify([{ id, val }]));
        });
      },
    };
    return next({ ...app, live });
  },
  async handle(request, next) {
    if (new URL(request.original.url).pathname === "/$live") {
      return app => {
        app.server.upgrade(request.original, {
           message(socket, data) {
             const { name, ...event_data } = JSON.parse(data);

             if (name === "subscribe") {
               app.live.subscribe({ ...event_data, socket });
             }
           },
         });

        return null;
      };
    }

    return next(request);
  },
});
