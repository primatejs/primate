import conf from "../conf.js";
import File from "../File.js";
import Domain from "./Domain.js";

const domains = {};
const base = conf().paths.domains;

for (const domain of await new File(base).list(".js")) {
  const name = domain.slice(0, -3);
  import(`${base}/${domain}`).then(module => {
    domains[name] = module.default;
  });
}

export const actuals = {};
for (const domain in domains) {
  if (domains[domain].prototype instanceof Domain) {
    const fields = {};
    for (const field in domains[domain]._fields) {
      const {Type} = domains[domain]._fields[field];
      if (Type.prototype instanceof Domain) {
        fields[field.slice(0, -3)] = Type.name;
      }
    }
    actuals[domain] = fields;
  }
}

export default domains;
