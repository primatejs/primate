import { from } from "rcompat/object";
import { view } from "primate";

const example_names = ["backend", "frontend", "runtime", "i18n"];

export default {
  get(request) {
    return async (app, ...args) => {
      const server = app.get("location.server");
      const base = await app.runpath(server, request.config.root, "examples");
      const examples = from(await Promise.all(example_names.map(async section =>
        [section, await base.join(`${section}.md.html`).text()],
      )));
      const props = { app: request.config, examples };
      const options = { placeholders: request.placeholders };

      return view("Homepage.svelte", props, options)(app, ...args);
    };
  },
};
