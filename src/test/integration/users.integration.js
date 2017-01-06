/* global describe, before, after, it */

import Promise from "bluebird";
import request from "supertest";
import httpStatus from "http-status";
import chai, {expect} from "chai";
import app from "../../main/index";
import omit from "lodash/omit";
import forEach from "lodash/forEach";

import {
  anAccount,
  setUpAccounts,
  tearDownAccounts
} from "../data/accounts.data";

import {
  aUser,
  setUpUsers,
  tearDownUsers
} from "../data/users.data";

import {getTokenFor} from "../utils/auth.utils";

chai.config.includeStack = true;


describe("Users", () => {

  let token;
  let bride;
  let groom;
  let priest;

  before(() => {

    bride = aUser()
      .withUsername("bride123")
      .withFirstName("brideFristName")
      .withLastName("brideListName")
      .build();

    groom = aUser()
      .withUsername("groom123")
      .withFirstName("groomFristName")
      .withLastName("groomListName")
      .build();

    priest = aUser()
      .withUsername("priest123")
      .withFirstName("priestFristName")
      .withLastName("priestListName")
      .build();

    bride.actors.pushAll([groom, priest]);
    groom.actors.pushAll([bride, priest]);
    priest.actors.pushAll([bride, groom]);

    return Promise.join(
      setUpAccounts(anAccount()
        .withUser(groom).build()),
      setUpUsers(bride, groom, priest),
      (account) => {
        token = getTokenFor(account);
      }
    );

  });

  after(() => Promise.join(
    tearDownAccounts(),
    tearDownUsers()
  ));

  describe("GET /api/users", () => {
    request(app)
      .get("/api/users")
      .set("token", token)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body).to.have.lengthOf(2);
        forEach([
          {

          },
          {

          }
        ], (user) => expect(omit(user, "_id")).to.include(user));
      });
  });

});
