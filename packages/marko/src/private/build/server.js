import * as compiler from "@marko/compiler";

export default async text => (await compiler.compile(text, "")).code;
