import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import Account from "../../models/account.model";
import { SERVER_URI } from "../../server";

// https://console.developers.google.com/apis/credentials?project=justwedding-76fa3
passport.use(new GoogleStrategy({
  clientID: "646826684984-prh2of3329duldfi9mrkbrluubobnl90.apps.googleusercontent.com",
  clientSecret: "K6hMRrdjx_pzxXWYjVhOPZWS",
  callbackURL: `${SERVER_URI}/api/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => { // eslint-disable-line
  Account.findOne({"external.google.id": profile.id}, (err, account) => {
    if (err) {
      return done(err);
    } else if (account) {
      return done(null, account);
    } else {
      account = new Account();
      account.external.google.id = profile.id;
      account.external.google.token = accessToken;
      account.external.google.name = profile.displayName;
      account.external.google.email = profile.emails[0].value;

      return account.save((errSaving) => {
        if (errSaving) {throw errSaving;} else {return done(null, account);}
      });
    }
  });
}
));

exports.issueGoogleAuthenticationRequest = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
  display: "popup"
});

exports.recoverGoogleAuthenticationResponse = passport.authenticate("google", {
  failureRedirect: "/api/error",
  session: false
});
