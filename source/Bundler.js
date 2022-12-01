import {Path, File} from "runtime-compat/filesystem";
import {hash, SHA256} from "runtime-compat/crypto";
import {EagerEither} from "polyad";

const {directory} = new Path(import.meta.url);
const preset = directory.join("preset");

const make_attributes = script =>
  Object.entries(script).map(([key, value]) => `${key}="${value}"`).join(" ");

export default class Bundler {
  constructor(conf) {
    this.conf = conf;
    this.debug = conf.debug;
    this.scripts = [];
    this.hashes = new Set();
  }

  async bundle() {
    const {paths, files} = this.conf;

    // remove public directory in case exists
    await File.remove(paths.public, {force: true});
    // create public directory
    await File.create(paths.public);

    // copy static files to public
    await File.copy(paths.static, paths.public);

    const client = paths.public.join("client");
    await File.create(client);

    const framework = directory.join("client");
    const client_primate = await File.create(client.join("primate"));

    const filter = file => file.endsWith(".js");

    await File.copy(framework, client_primate);
    await File.copy(paths.components, client, filter);

    const components = await File.list(client, filter);
    const import_file = components.reduce((source, path) =>
      `${source}\nimport ${path.base} from "./${path.directory.base}";`, "");
    await File.write(client.join("index.js"), import_file);

    const f_components = (await File.list(client_primate, f => f.endsWith(".js")));
    await Promise.all(f_components.concat(components).map(async path =>
      this.register(path.name, await path.file.read())));

    this.register("client/index.js", import_file);
    console.log(this.scripts);

    // read index.html from public, then remove it (we serve it dynamically)
    await File.remove(paths.public.join(files.index));

    return this;
  }

  register(src, source) {
    const algorithm = SHA256;
    const integrity = `${algorithm}-${hash(source, {algorithm})}`;
    const type = "module";
    this.scripts.push({src: `${this.conf.base}${src}`, integrity, type});
    this.hashes.add(integrity);
  }

  async index() {
    const {conf: {paths, files: {index}}} = this;
    const subdirectory = "static";

    /*const file = await File.read(paths[subdirectory].join(index))
      .match({error: () => File.read(`${preset}/${subdirectory}/${index}`)})
      .expect("Unable to load index.html");*/
    const file = await EagerEither
      .try(() => File.read(paths[subdirectory].join(index)))
      .match({left: () => File.read(`${preset}/${subdirectory}/${index}`)})
      .get();
    const head = this.scripts.reduce((scripts, script) =>
      `${scripts}\n<script ${make_attributes(script)}></script>`, "");
    return file.replace("</head>", `${head}</head>`);
  }
}
