export default (payload = {}) => Object.keys(payload)
  .map(key => ({key, "value": payload[key].toString().trim()}))
  .map(datum => {
    datum.value = datum.value === "" ? undefined : datum.value;
    return datum;
  })
  .reduce((data, {key, value}) => {
    data[key] = value;
    return data;
  }, {});
