import transform from "@rcompat/build/transform";
import options from "./options.js";

export default async text => (await transform(text, options)).code;
