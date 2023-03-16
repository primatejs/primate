import {Domain} from "@primate/domains";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name is a string unique across the user collection
    name: [String, "unique"],
    // a user's age is a positive integer
    age: [Number, "integer", "positive"],
    // a user's house has the foreign id of a house record and no two
    // users may have the same house
    house_id: [House, "unique"],
  };
}
