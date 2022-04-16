import zlib from "zlib";
import {Readable} from "stream";
import {createServer} from "https";
import {join} from "path";
import {parse} from "url";
import Session from "./Session.js";
import File from "./File.js";
import {algorithm, hash} from "./crypto.js";
import log from "./log.js";
import codes from "./http-codes.json" assert {"type": "json"};
import mimes from "./mimes.json" assert {"type": "json"};

const regex = /\.([a-z1-9]*)$/u;
const mime = filename => mimes[filename.match(regex)[1]] ?? mimes.binary;

const stream = (from, response) => {
  response.setHeader("Content-Encoding", "br");
  response.writeHead(codes.OK);
  return from.pipe(zlib.createBrotliCompress())
    .pipe(response)
    .on("close", () => response.end());
};

export default class Server {
  constructor(conf) {
    this.conf = conf;
  }

  async run() {
    const {http} = this.conf;
    const {csp, "same-site": same_site = "Strict"} = http;
    this.csp = Object.keys(csp).reduce((policy_string, key) =>
      policy_string + `${key} ${csp[key]};`, "");

    this.server = await createServer(http, async (request, response) => {
      const session = await Session.get(request.headers.cookie);
      if (!session.has_cookie) {
        const {cookie} = session;
        response.setHeader("Set-Cookie", `${cookie}; SameSite=${same_site}`);
      }
      response.session = session;
      const buffers = [];

      for await (const chunk of request) {
        buffers.push(chunk);
      }

      const data = Buffer.concat(buffers).toString();
      const payload = Object.fromEntries(decodeURI(data).replaceAll("+", " ")
        .split("&")
        .map(part => part.split("="))
        .filter(([, value]) => value !== ""));
      this.try(parse(request.url).path, request, response, payload);
    });
  }

  async try(url, request, response, payload) {
    try {
      await this.serve(url, request, response, payload);
    } catch (error) {
      console.log(error);
//      await response.session.log("red", error.message);
      response.writeHead(codes.InternalServerError);
      response.end();
    }
  }

  async serve_file(url, filename, file, response) {
    response.setHeader("Content-Type", mime(filename));
    response.setHeader("Etag", file.modified);
    await response.session.log("green", url);
    return stream(file.read_stream, response);
  }

  async serve(url, request, response, payload) {
    const filename = join(this.conf.serve_from, url);
    const file = await new File(filename);
    return await file.is_file
      ? this.serve_file(url, filename, file, response, payload)
      : this.serve_data(url, request, response, payload);
  }

  async serve_data(pathname, request, response, payload) {
    const {session} = response;
    const request2 = {pathname, "method": request.method.toLowerCase(), payload};
    const res = await this.conf.router.process(request2);
    const {body, code, headers} = res;

    const result = this.conf.index.replace("<body>", () => `<body>${body}`);
    for (const [key, value] of Object.entries(headers)) {
      response.setHeader(key, value);
    }
    response.setHeader("Content-Security-Policy", this.csp);
    response.setHeader("Referrer-Policy", "same-origin");
    response.writeHead(code);
    response.end(result);
  }

  listen(port, host) {
    log.reset("on").yellow(`https://${host}:${port}`).nl();
    this.server.listen(port, host);
  }
}
