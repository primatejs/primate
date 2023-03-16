import {Domain} from "@primate/domains";

// A basic domain with two properies
export default class User extends Domain {
  static fields = {
    // a user's name is a string
    name: String,
    // a user's age is a number
    age: Number,
  };
}
