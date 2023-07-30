#!/usr/bin/env node
import run from "./run.js";
import {Bailout} from "./prompts.js";
import createConfig from "./create-config.js";
import {intro, outro} from "@clack/prompts";
import {blue} from "runtime-compat/colors";

intro("Creating a Primate app");

try {
  await createConfig(await run());
  outro(blue("done, run `npm i && npx primate` to start"));
} catch (error) {
  if (error instanceof Bailout) {
    outro("bye");
  } else {
    throw error;
  }
}
