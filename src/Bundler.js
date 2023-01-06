import {Path, File} from "runtime-compat/filesystem";

const meta_url = new Path(import.meta.url).path;
const directory = Path.directory(meta_url);
const preset = `${directory}/preset`;

export default class Bundler {
  constructor(conf) {
    this.conf = conf;
    this.debug = conf.debug;
    this.index = conf.files.index;
    this.scripts = [];
  }

  async bundle() {
    const {paths} = this.conf;

    // remove public directory in case exists
    await File.remove(paths.public);
    // create public directory
    await File.create(paths.public);

    // copy static files to public
    await File.copy(paths.static, paths.public);

    // read index.html from public, then remove it (we serve it dynamically)
    await File.remove(`${paths.public}/${this.index}`);
  }
}

export const index = async conf => {
  let file;
  const subdirectory = "static";
  try {
    file = await File.read(`${conf.paths[subdirectory]}/${conf.files.index}`);
  } catch (error) {
    file = await File.read(`${preset}/${subdirectory}/${conf.files.index}`);
  }
  return file;
};
