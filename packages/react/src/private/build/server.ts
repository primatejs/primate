import transform from "@rcompat/build/transform";
import options from "./options.js";

export default async (text: string) => (await transform(text, options)).code;
