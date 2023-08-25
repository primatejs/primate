import {createSSRApp} from "vue";
import {renderToString} from "vue/server-renderer";
import {parse, compileTemplate} from "vue/compiler-sfc";

export const compile = {
  server(text) {
    return compileTemplate({
      source: parse(text).descriptor.template.content,
      id: "1",
    }).code;
  },
};

export {createSSRApp, renderToString as render};
