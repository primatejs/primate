import { marked } from "./imports.js";

const identity_heading = (text, level) => `<h${level}>${text}</h${level}>`;
const heading = options => options?.renderer?.heading ?? identity_heading;

export default async (input, options) => {
  const toc = [];
  const renderer = {
    ...options?.renderer ?? {},
    heading(text, level) {
      toc.push({ text, level,
        name: text.toLowerCase()
          .replaceAll(/[?{}%]/gu, "")
          .replace(/[^\w]+/gu, "-"),
      });
      return heading(options)(text, level);
    },
  };
  marked.use({ ...options, renderer });

  const content = await marked.parse(input);

  return { content, toc };
};
