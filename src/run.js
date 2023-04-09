import config from "./config.js";

export default async command => {
  // env should initialised before any commands run
  await command(await config());
};
