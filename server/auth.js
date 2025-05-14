import express from "express";
import { ExpressAuth } from "@auth/express";
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

export default authRouter;