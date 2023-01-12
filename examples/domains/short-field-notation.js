import {Domain} from "primate";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name must be a string
    name: String,
    // a user's age must be a number
    age: Number,
    // a user's house must have the foreign id of a house record
    house_id: House,
  };
}
