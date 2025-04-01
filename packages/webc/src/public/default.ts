import build from "#build";
import default_extension from "#extension";
import pkgname from "#pkgname";
import serve from "#serve";
import type { Module } from "@primate/core/hook";

export default ({ extension = default_extension } = {}): Module => ({
  name: pkgname,
  build: build(extension),
  serve: serve(extension),
});
