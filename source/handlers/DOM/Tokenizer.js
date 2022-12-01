// https://html.spec.whatwg.org/multipage/parsing.html

export const EOF = -1;
export const START_TAG = 0;
export const END_TAG = 1;
export const CHARACTER = 2;

const STATE = {
  TAG_OPEN: "tagOpen",
  END_TAG_OPEN: "endTagOpen",
  TAG_NAME: "tagName",
  SELF_CLOSING_START_TAG: "selfClosingStartTag",
  DATA: "data",
  BEFORE_ATTRIBUTE_NAME: "beforeAttributeName",
  AFTER_ATTRIBUTE_NAME: "afterAttributeName",
  BEFORE_ATTRIBUTE_VALUE: "beforeAttributeValue",
};

const CHARACTER_TABULATION = "\u0009";
const LINE_FEED = "\u000a";
const FORM_FEED = "\u000c";
const SPACE = "\u0020";
const SOLIDUS = "\u002f";
const LESS_THAN = "\u003c" ;
const EQUALS = "\u003d";
const GREATER_THAN = "\u003e";
const A_Z = "a-zA-Z";

const re = (...symbols) => new RegExp(`[${symbols.join()}]`, "u");

const matches = {
  SOLIDUS: re(SOLIDUS),
  LESS_THAN: re(LESS_THAN),
  EQUALS: re(EQUALS),
  GREATER_THAN: re(GREATER_THAN),
  ASCII_ALPHA: re(A_Z),
  WHITESPACE: re(CHARACTER_TABULATION, LINE_FEED, FORM_FEED, SPACE),
  END: re(SOLIDUS, GREATER_THAN),
  EOF: re(EOF),
};

const IGNORE = () => undefined;
const NEW_ATTRIBUTE = {name: "", value: ""};

export default class Tokenizer {
  #input;
  #state = STATE.DATA;
  #index = 0;
  #tokens = [];
  #token = {};

  constructor(input) {
    this.#input = input;
  }

  get current() {
    return this.#input.at(this.#index) ?? EOF;
  }

  get lowerCurrent() {
    return this.current.toLowerCase();
  }

  forward() {
    this.#index++;
    return this;
  }

  back() {
    this.#index--;
    return this;
  }

  match() {
    const candidates = this[`state${this.#state}`]();
    console.log("candidates", candidates);
    Object.entries(candidates).some(([key, value]) => {
      if (matches[key].test(this.current)) {
        value();
        return true;
      }
      return false;
    });
    return this;
  }

  run() {
    while (this.current !== EOF) {
      this.match().forward();
    }

    return this.#tokens;
  }

  emit(token) {
    this.#tokens.push(token);
  }

  flush() {
    this.emit(this.#token);
    this.#token = {};
  }

  chars(...characters) {
    characters.forEach(value => this.emit({type: CHARACTER, value}));
    return this;
  }

  eof() {
    return this.emit({type: EOF});
  }

  // consume the next character in the given state
  next(state) {
    this.#state = state;
    return this;
  }

  // reconsume the next character in the given state
  renext(state) {
    return this.back().next(state);
  }

  set(...args) {
    this.#token = {...this.#token, ...args};
    return this;
  }

  tag(type) {
    return this.set({type, tagName: ""});
  }

  [`state${STATE.DATA}`]() {
    return {
      LESS_THAN: () => this.next(STATE.TAG_OPEN),
      EOF: () => this.eof(),
      Z: () => this.chars(this.current),
    };
  }

  [`state${STATE.TAG_OPEN}`]() {
    return {
      SOLIDUS: () => this.next(STATE.END_TAG_OPEN),
      ASCII_ALPHA: () => this.tag(START_TAG).renext(STATE.TAG_NAME),
      EOF: () => this.chars(LESS_THAN),
    };
  }

  [`state${STATE.END_TAG_OPEN}`]() {
    return {
      ASCII_ALPHA: () => this.tag(END_TAG).renext(STATE.TAG_NAME),
      GREATER_THAN: () => this.next(STATE.DATA),
      EOF: () => this.chars(LESS_THAN, SOLIDUS).eof(),
    };
  }

  [`state${STATE.TAG_NAME}`]() {
    return {
      WHITESPACE: () => this.next(STATE.BEFORE_ATTRIBUTE_NAME),
      SOLIDUS: () => this.next(STATE.SELF_CLOSING_START_TAG),
      GREATER_THAN: () => this.next(STATE.DATA).flush(),
      EOF: () => this.eof(),
      Z: () => this.set({tagName: this.#token.tagName + this.lowerCurrent}),
    };
  }

  [`state${STATE.SELF_CLOSING_START_TAG}`]() {
    return {
      GREATER_THAN: () => this.set({selfClosing: true}).next(STATE.DATA).flush(),
    };
  }

  [`state${STATE.BEFORE_ATTRIBUTE_NAME}`]() {
    return {
      WHITESPACE: IGNORE,
      END: () => this.renext(STATE.AFTER_ATTRIBUTE_NAME),
      Z: () => this.set({attribute: {...NEW_ATTRIBUTE}}).renext(STATE.ATTRIBUTE_NAME),
    };
  }

  [`state${STATE.AFTER_ATTRIBUTE_NAME}`]() {
    return {
      WHITESPACE: IGNORE,
      SOLIDUS: () => this.next(STATE.SELF_CLOSING_START_TAG),
      EQUALS: () => this.next(STATE.BEFORE_ATTRIBUTE_VALUE),
    };
  }
}
