import { Path } from "rcompat/fs";
import { MediaType } from "rcompat/http";
import { view } from "primate";

const entries_path = ["blog", "entries.json"];
const entries = new Path(import.meta.url).up(2).join(...entries_path);

export default {
  async get() {
    const props = { entries: await entries.json() };
    const options = {
      partial: true,
      headers: { "Content-Type": MediaType.APPLICATION_XML },
    };

    return view("blog.rss.hbs", props, options);
  },
};
