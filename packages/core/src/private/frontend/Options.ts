import type Dictionary from "@rcompat/record/Dictionary";

export default interface Options extends ResponseInit {
  head?: string,
  partial?: boolean,
  placeholders?: Omit<Dictionary, "body" | "head">,
  page?: string,
  csp?: {
    style_src?: string[],
    script_src?: string[],
  }
};
