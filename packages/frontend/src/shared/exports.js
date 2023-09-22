let React, Solid;

try { React = await import("../components/react/head.js"); } catch {}
try { Solid = await import("../components/solid/head.js"); } catch {}

const ReactHead = React?.Head;
const ReactHeadContext = React?.HeadContext;
const SolidHead = Solid?.Head;
const SolidHeadContext = Solid?.HeadContext;

export {ReactHead, ReactHeadContext, SolidHead, SolidHeadContext};

const is_client = globalThis.document?.createElement !== undefined;
const is = {
  client: is_client,
  server: !is_client,
};

export {is};
