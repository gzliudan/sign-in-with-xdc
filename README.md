# Sign in with XinFin blockchain and MetaMask

This article introduces how to authenticate user by [siwe](https://github.com/spruceid/siwe) and [XinFin blockchain](https://www.xinfin.org/) account.

## 1. About ERC-4361

[Sign in with Ethereum](https://eips.ethereum.org/EIPS/eip-4361) is a new form of authentication that enables users to control their digital identity with their Ethereum account and ENS profile instead of relying on a traditional intermediary.

Today’s login experiences rely on accounts controlled by centralized identity providers, for-profit behemoths like Google, Facebook, and Apple. Identity providers often have sole discretion over the existence and use of users’ digital identities across the web, fundamentally at odds with the best interest of users.

The Ethereum Foundation and Ethereum Name Service (ENS) put forward a Request for Proposal for Sign-in with Ethereum in 2021, which would enable users to use their Ethereum accounts to access web services instead of accounts owned by large corporations.

Sign-In with Ethereum describes how Ethereum accounts authenticate with off-chain services by signing a standard message format parameterized by scope, session details, and security mechanisms (e.g., a nonce).

Already, many services support workflows to authenticate Ethereum accounts using message signing, such as establishing a cookie-based web session which can manage privileged metadata about the authenticating address.

For **Web2**, this is an opportunity to give users control over their identifiers and slowly introduce their dedicated user bases to Web3. By providing a strict specification that can be followed along with any necessary tooling to ease any integration concerns, Sign-In with Ethereum has a chance at truly transforming the way in which individuals interact with apps and services.

For **Web3**, this is an opportunity to standardize the sign-in workflow and improve interoperability across existing services, while also providing wallet vendors a reliable method to identify signing requests as Sign-In with Ethereum requests for improved UX.

## 2. Run the demo

### 2.1 Download source code

Execute the following commands:

```bash
cd ${HOME}
git clone https://github.com/gzliudan/sign-in-with-xdcpay.git
git checkout metamask
```

### 2.2 Start the backend

Execute the following commands, remember to change `<BACKEND_IP>` to your real IP address:

```bash
# set BACKEND_IP according to your environment
export BACKEND_IP=<BACKEND_IP>

cd ${HOME}/sign-in-with-xdcpay/backend
npm install
npm start
```

eg:

![Image description](https://www.xdc.dev/uploads/articles/ktaojgqnxxjbeqmjhkik.png)

### 2.3 Start the frontend

Open a new terminal window, execute the following commands, remember to change `<BACKEND_IP>` to your real IP address:

```bash
# set BACKEND_IP according to your environment
export BACKEND_IP=<BACKEND_IP>

cd ${HOME}/sign-in-with-xdcpay/frontend
npm install
npm run dev
```

eg:

![Image description](https://www.xdc.dev/uploads/articles/6px3z3m1i2v9wexxkam8.png)

## 3. Test the demo

### 3.1 Open web page

Open the url which is after `On Your Network (IPv4):` in the above screenshoot, such as `http://10.146.1.124:8080/`.

![Image description](https://www.xdc.dev/uploads/articles/hs6r6lsss5doa5b3cgvy.png)

### 3.2 Connect the wallet

Click `Connect wallet` button:

#### 3.2.1 Add the XinFin network

If the XinFin network is not exist in your MetaMask, the web page will request to add it automatically:

![Image description](https://www.xdc.dev/uploads/articles/g7sc4qakdmsds7b37j0x.png)

Click `Approve` button on the MetaMask's popup window.

#### 3.2.2 Switch the network

If your MetaMask's current network is not XinFin network, the web page will request to swith to XinFin network:

![Image description](https://www.xdc.dev/uploads/articles/4vfxavrk1qrt21zs9mr6.png)

Click `Swith network` button on the MetaMask's popup window.

#### 3.2.3 Connect MetaMask account

If there is no account connected to the MetaMask, the web page will request `Connect with MetaMask`:

#### 3.2.3.1 Choose an account

Select the account(s) if your MetaMask contains multiple accounts.

![Image description](https://www.xdc.dev/uploads/articles/tkalu7176gvf1ubmxb02.png)

##### 3.2.3.2 Connect to account

Then click `Next` button:

![Image description](https://www.xdc.dev/uploads/articles/xsbd4iwtbroxfttslm42.png)

At last click `Connect` button on the MetaMask's second popup window.

#### 3.2.4 Show connect status

If it's connected, the web page will popup a window:

![Image description](https://www.xdc.dev/uploads/articles/0vj8xzhidj4mo8w61ken.png)

It shows `Connect XinFin blockchain OK`, click `OK` button to close it.

### 3.3 Get information before sign in

Click `Get session info` button, the web page will popup a window:

![Image description](https://www.xdc.dev/uploads/articles/i6zg2yfmupvt80g1rf4n.png)

It shows `You are not sign in`, click `OK` button to close it.

### 3.4 Sign in with XinFin blockchain account

Click `Sign in with XinFin` button, the MetMask will prompt you to sign the below message:

![Image description](https://www.xdc.dev/uploads/articles/ct7f19lcnjnl5s79hw3c.png)

Then click `Sign-In` button on the MetaMask's popup window. At last the web page will popup a window:

![Image description](https://www.xdc.dev/uploads/articles/mu3ziyf02g84xs5kymav.png)

It shows `Sign in OK with XinFin blockchain account: 0xD4CE02705041F04135f1949Bc835c1Fe0885513c`, click `OK` button to close it.

### 3.5 Get information after sign in

Click `Get session info` button, the web page will popup a window:

![Image description](https://www.xdc.dev/uploads/articles/2zrfwuk0uvh0boo2ykkd.png)

It shows `You are authenticated with XinFin blockchain account: 0xD4CE02705041F04135f1949Bc835c1Fe0885513c`, click `OK` button to close it.

## 4. Some source codes

### 4.1 The backend

The backend server handle the user's submission using `Express.js`, it

- gives the frontend a nonce to include in the SIWE message
- verifies the submission
- returns the authenticating state

As such, this basic example only provides three endpoints:

- `/nonce`: generate the nonce for the interaction via GET request
- `/verify`: verify the submitted SIWE message and signature via POST request
- `/info`: retrieve the information from the session in place via GET request

#### 4.1.1 endpoint nonce

This endpoint returns a different nonce for each request.

```js
app.get("/nonce", async function (req, res) {
  req.session.nonce = generateNonce();
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(req.session.nonce);
});
```

Open a new terminal window, run below command to test:

```bash
curl 'http://localhost:3000/nonce' && echo
```

#### 4.1.2 endpoint verify

##### 4.1.2.1 validate SiweMessage object

```js
const message = new SiweMessage(req.body.message);
```

We validate the received SIWE message by parsing it back into a SiweMessage object (the constructor handles this), assigning the received signature to it and calling the validate method:

```js
const fields = await message.validate(req.body.signature);
```

`message.validate(req.body.signature)` in the above snippet makes sure that the given signature is correct for the message, ensuring that the XinFin blockchain address within the message produced the matching signature. In other applications, you may wish to do further validation on other fields in the
message, for example asserting that the authority matches the expected domain, or checking that the named address has the authority to access the named URI.

##### 4.1.2.2 req.session

```js
req.session.siwe = fields;
req.session.cookie.expires = new Date(fields.expirationTime);
```

The session (req.session) stores the nonce for the initial validation of the message, and once that's done, more can be added. For example here we store the message's fields, so we can always reference the address of the user.

#### 4.1.3 endpoint info

This endpoint is used to retrieve the information from the session in place, without having to send the message and signature every time.

```js
app.get("/info", function (req, res) {
  if (!req.session.siwe) {
    res.status(401).send("You are not sign in");
    return;
  }
  res.setHeader("Content-Type", "text/plain");
  res.send(
    `You are authenticated with XinFin blockchain account: ${req.session.siwe.address}`
  );
});
```

### 4.2 The frontend

#### 4.2.1 ethers.js

[ethers.js](https://docs.ethers.org/v5/) is a library that provides functionality for interacting with the Ethereum blockchain. We use it here for connecting the webpage to extension wallets.

#### 4.2.2 Metamask

```js
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
```

The Metamask extension injects the `window.ethereum` object into every web page, and the ethers library provides a convenient provider class to wrap it. We then use this provider to connect to the wallet, and access signing capabilities.

#### 4.2.3 eth_requestAccounts

```js
try {
  await provider.send("eth_requestAccounts", []);
  message = `Connect XinFin blockchain OK`;
} catch (err) {
  message = `Fail to request account: ${err.message}`;
}
```

The `eth_requestAccounts` function will send a request to the MetaMask extension to ask permission to view information about the XinFin accounts that it controls. MetaMask will then show a window to the user asking them to authorize our application to do so. If they authorize the request then we've connected their account.

#### 4.2.4 signMessage

```js
await signer.signMessage(message);
```

Sign message with the above code.

#### 4.2.5 SiweMessage

Creating SIWE messages in JavaScript is straightforward when using the siwe library:

```js
const message = new SiweMessage({
  domain,
  address,
  statement,
  uri: origin,
  version: "1",
  chainId: "50", // chain id of XinFin blockchain
  nonce: await res.text(),
});
```

The SiweMessage's fields we are most interested in are `address` and `statement`. The `address` is the XinFin blockchain address which the user is signing in with, and the `statement` as this will describe to the user what action we wish to perform on their behalf.
