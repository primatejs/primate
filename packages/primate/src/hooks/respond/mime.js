import {MediaType as MT} from "runtime-compat/http";

const mimes = {
  binary: MT.APPLICATION_OCTET_STREAM,
  css: "text/css",
  html: MT.TEXT_HTML,
  jpg: "image/jpeg",
  js: "text/javascript",
  mjs: "text/javascript",
  json: MT.APPLICATION_JSON,
  png: "image/png",
  svg: "image/svg+xml",
  woff2: "font/woff2",
  webp: "image/webp",
};

const regex = /\.(?<extension>[a-z1-9]*)$/u;
const match = filename => filename.match(regex)?.groups.extension;

export default filename => mimes[match(filename)] ?? mimes.binary;
