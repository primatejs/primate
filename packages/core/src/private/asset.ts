import type Dictionary from "@rcompat/record/Dictionary";

export default interface Asset {
  src?: string,
  inline: boolean,
  integrity: string,
  code: string | { imports: Dictionary },
  type: string,
}

export interface Style {
  code: string,
  inline: boolean,
  href?: string,
}

export interface Script {
  src?: string,
  integrity: string,
  type: string,
  code: string,
  inline: boolean,
}

export interface Font {
  crossorigin: string,
  type: string,
  as: string,
  rel: "preload",
  href: string,
}
