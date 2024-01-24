import { from } from "rcompat/object";
import { view } from "primate";

const example_files = ["backend", "frontend", "runtime", "i18n"];

export default {
  async get(request) {
    const { env, config } = request;
    const { server } = env.config.location;

    const base = await env.runpath(server, config.root, "examples");

    const props = { 
      app: request.config, 
      examples: from((await Promise.all(example_files)).map(async section =>
       [section, await (base.join(`${section}.md.html`)).text()]
      )),
    };
    const options = { placeholders: request.placeholders };

    return view("Homepage.svelte", props, options);
  },
};
