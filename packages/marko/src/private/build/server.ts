import * as compiler from "@marko/compiler";

export default async (text: string) => (await compiler.compile(text, "")).code;
