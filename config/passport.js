const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const crypto = require("crypto");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente por email o socialId
        let user = await User.findOne({
          $or: [
            { email: profile.emails[0].value },
            { socialId: profile.id, socialProvider: "google" },
          ],
        });

        if (!user) {
          // Crear nuevo usuario si no existe
          user = await User.create({
            name: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            socialId: profile.id,
            socialProvider: "google",
            password: crypto.randomBytes(20).toString("hex"),
            user_type: "client",
            isVerified: true,
          });
        } else if (!user.socialId) {
          // Si el usuario existe pero no tiene socialId, actualizarlo
          user.socialId = profile.id;
          user.socialProvider = "google";
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, false);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente por email o socialId
        let user = await User.findOne({
          $or: [
            { email: profile.emails[0].value },
            { socialId: profile.id, socialProvider: "facebook" },
          ],
        });

        if (!user) {
          // Crear nuevo usuario si no existe
          user = await User.create({
            email: profile.emails[0].value,
            name: profile.name.givenName,
            lastname: profile.name.familyName,
            password: crypto.randomBytes(20).toString("hex"),
            user_type: "client",
            isVerified: true,
            socialId: profile.id,
            socialProvider: "facebook",
          });
        } else if (!user.socialId) {
          // Si el usuario existe pero no tiene socialId, actualizarlo
          user.socialId = profile.id;
          user.socialProvider = "facebook";
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Facebook Strategy:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
