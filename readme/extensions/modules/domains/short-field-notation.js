import {Domain} from "@primate/domains";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name is a string
    name: String,
    // a user's age is a number
    age: Number,
    // a user's house has the foreign id of a house record
    house_id: House,
  };
}
