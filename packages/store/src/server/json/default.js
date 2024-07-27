import serve from "@primate/store/json/hooks/serve";

export default ({ database }) => ({ serve: serve({ database }) });
