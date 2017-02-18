import database from "../../database";
import bcrypt from "bcrypt-nodejs";
import { UserSchema } from "./user.model";
import omit from "lodash/omit";

const SALT_LENGTH = 8;

const AccountSchema = new database.Schema({
  login: {
    type: String,
    index: true
  },
  password: {
    type: String,
    match: [/^.*$/, "The value of path {PATH} ({VALUE}) is not a valid password!"]
  },
  external: {
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String
    }
  },
  user: {
    type: UserSchema,
    required: true
  }
});

AccountSchema.methods.toJSON = function () {
  return omit(this.toObject({
    versionKey: false
  }), "password");
};

AccountSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_LENGTH), null);
};

AccountSchema.methods.isPasswordValid = function (password) {
  return bcrypt.compareSync(password, this.password);
};

export default database.model("Account", AccountSchema);