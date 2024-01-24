import { from } from "rcompat/object";
import { view } from "primate";

export default {
  async get(request) {
    const { env, config } = request;
    const { server } = env.config.location;

    const base = await env.runpath(server, config.root, "examples");

    const examples = from(await Promise.all(["backend", "frontend", "runtime", "i18n"]
      .map(async section =>
       [section, await (base.join(`${section}.md.html`)).text()]
      )));
    const props = { app: request.config, examples };
    const options = { placeholders: request.placeholders };

    return view("Homepage.svelte", props, options);
  },
};
