import FileRef from "@rcompat/fs/FileRef";
import { xml } from "@rcompat/http/mime";
import { view } from "primate";

const description = "Web framework focused on flexibility and developer freedom";

const entries_path = ["blog", "entries.json"];
const entries = new FileRef(import.meta.url).up(2).join(...entries_path);

export default {
  async get() {
    const props = { entries: await entries.json(), description };
    const options = {
      partial: true,
      headers: { "Content-Type": xml },
    };

    return view("blog.rss.hbs", props, options);
  },
};
