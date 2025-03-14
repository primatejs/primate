import build from "#hook/build";
import handle from "#hook/handle";
import route from "#hook/route";
import serve from "#hook/serve";
import Manager from "#Manager";
import name from "#name";

export default ({
  // default locale
  locale = "en",
} = {}) => {
  const manager = new Manager(locale);

  return {
    name,
    build: build(manager),
    route: route(manager),
    handle: handle(manager),
    serve: serve(manager),
  };
};

