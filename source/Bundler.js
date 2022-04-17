import {dirname} from "path";
import {fileURLToPath} from "url";
import File from "./File.js";

const meta_url = fileURLToPath(import.meta.url);
const directory = dirname(meta_url);
const preset = `${directory}/preset`;

export default class Bundler {
  constructor(conf) {
    this.conf = conf;
    this.debug = conf.debug;
    this.index = conf.files.index;
    this.scripts = [];
  }

  async copy_with_preset(subdirectory, to) {
    const {paths} = this.conf;

    // copy files preset files first
    await File.copy(`${preset}/${subdirectory}`, to);

    // copy any user code over it, not recreating the folder
    try {
      await File.copy(paths[subdirectory], to, false);
    } catch(error) {
      // directory doesn't exist
    }
  }

  async bundle() {
    const {paths} = this.conf;

    // copy static files to public
    await this.copy_with_preset("static", paths.public);

    // remove index.html from public (we serve it dynamically)
    await File.remove(`${paths.public}/${this.index}`);
  }
}
