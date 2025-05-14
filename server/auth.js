import express from "express";
import { ExpressAuth } from "@auth/express";
import { getSession } from "@auth/express"
import Google from "@auth/express/providers/google";
import dotenv from 'dotenv';

dotenv.config();

const authRouter = express();

// If your app is served through a proxy, trust the proxy to allow us  to read the `X-Forwarded-*` headers. This came from Authjs.dev
authRouter.set("trust proxy", true);
//This is where the pre-made auth routes come in. Again, from authjs.dev
authRouter.use("/auth/*", ExpressAuth({ 
    providers: [Google],
}));



/**
 * Middleware that grabs the user's session info and injects it into the res object for later use
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Function to pass everything to the next middleware
 */
async function authSession(err, req, res, next) {
  res.locals.session = await getSession(req);
  next();
}

export {
    authRouter,
    authSession
}