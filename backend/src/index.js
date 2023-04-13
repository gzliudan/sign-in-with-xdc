import cors from "cors";
import express from "express";
import Session from "express-session";
import { generateNonce, SiweMessage } from "siwe";

const port = 3000;
const backendIp = process.env.BACKEND_IP || "localhost";
const corsOrigin = `http://${backendIp}:8080`;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(
  Session({
    name: "sign-in-with-xinfin",
    secret: "xinfin-blockchain",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
  })
);

app.get("/nonce", async function (req, res) {
  req.session.nonce = generateNonce();
  console.log(`\nnonce = ${req.session.nonce}`);
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(req.session.nonce);
});

app.post("/verify", async function (req, res) {
  try {
    if (!req.body.message) {
      res
        .status(422)
        .json({ message: "Expected prepareMessage object as body." });
      return;
    }

    const message = new SiweMessage(req.body.message);
    console.log(`\nThe message is:\n${message.prepareMessage()}`);

    const fields = await message.validate(req.body.signature);
    if (fields.nonce !== req.session.nonce) {
      console.log(req.session);
      res.status(422).json({
        address: message.address,
        message: `Invalid nonce.`,
      });
      return;
    }

    req.session.siwe = fields;
    req.session.cookie.expires = new Date(fields.expirationTime);
    const msg = `Sign in OK with XinFin blockchain account: ${message.address}`;
    req.session.save(() => res.status(200).send(msg));
    console.log(`\n${msg} !`);
  } catch (err) {
    req.session.siwe = null;
    req.session.nonce = null;
    console.error(err);
    switch (err) {
      case ErrorTypes.EXPIRED_MESSAGE: {
        req.session.save(() =>
          res
            .status(440)
            .json({ address: message.address, message: err.message })
        );
        break;
      }
      case ErrorTypes.INVALID_SIGNATURE: {
        req.session.save(() =>
          res
            .status(422)
            .json({ address: message.address, message: err.message })
        );
        break;
      }
      default: {
        req.session.save(() =>
          res
            .status(500)
            .json({ address: message.address, message: err.message })
        );
        break;
      }
    }
  }
});

app.get("/info", function (req, res) {
  if (!req.session.siwe) {
    res.status(401).send("You are not sign in");
    return;
  }
  res.setHeader("Content-Type", "text/plain");
  const msg = `You are authenticated with XinFin blockchain account: ${req.session.siwe.address}`;
  res.send(msg);
  console.log(`\n${msg} !`);
});

app.listen(port, () => {
  console.log(`CORS origin = ${corsOrigin}`);
  console.log(`App is listening on port ${port}`);
});
