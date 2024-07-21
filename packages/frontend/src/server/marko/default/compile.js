import * as compiler from "@marko/compiler";

export const server = async text => (await compiler.compile(text, "")).code;

