import { ethers } from "ethers";
import { SiweMessage } from "siwe";

const backendIp = process.env.BACKEND_IP || "localhost";
const BACKEND_ADDR = `http://${backendIp}:3000`;

const domain = window.location.host;
const origin = window.location.origin;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const xinFinCfg = {
  chainId: "0x32",
  chainName: "XinFin",
  nativeCurrency: {
    name: "XDC",
    symbol: "XDC",
    decimals: 18,
  },
  rpcUrls: ["https://erpc.xinfin.network/"],
  blockExplorerUrls: ["https://explorer.xinfin.network/"],
};

async function createSiweMsg(address, statement) {
  const res = await fetch(`${BACKEND_ADDR}/nonce`, {
    credentials: "include",
  });

  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: "50", // chain id of XinFin blockchain
    nonce: await res.text(),
  });

  return message.prepareMessage();
}

async function connectWallet() {
  let chainId;
  let message;

  try {
    chainId = await provider.send("eth_chainId");
  } catch (err) {
    const msg = `Fail to get current chain id: ${err.message}`;
    console.log(msg);
    alert(msg);
    return;
  }

  if (chainId !== xinFinCfg.chainId) {
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: xinFinCfg.chainId },
      ]);
    } catch (err) {
      if (err.code === 4902) {
        try {
          await provider.send("wallet_addEthereumChain", [xinFinCfg]);
        } catch (err2) {
          const msg = `Fail to add XinFin blockchain: ${err2.message}`;
          console.log(msg);
          alert(msg);
          return;
        }
      } else {
        const msg = `Fail to switch to XinFin blockchain: ${err.message}`;
        console.log(msg);
        alert(msg);
        return;
      }
    }
  }

  try {
    await provider.send("eth_requestAccounts", []);
    message = `Connect XDCPay OK`;
  } catch (err) {
    message = `Fail to request account: ${err.message}`;
  }

  console.log(message);
  alert(message);
}

async function signIn() {
  const message = await createSiweMsg(
    await signer.getAddress(),
    "Sign in dapp with XDCPay 2.0"
  );
  console.log(`The message is:\n${message}`);

  let signature;
  try {
    signature = await signer.signMessage(message);
    console.log(`The signature is:\n${signature}`);
  } catch (err) {
    console.log(err.message);
    alert(err.message);
    return;
  }

  const res = await fetch(`${BACKEND_ADDR}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, signature }),
    credentials: "include",
  });

  const response = await res.text();
  console.log(`The response is:\n${response}`);
  alert(response);
}

async function getInfo() {
  const res = await fetch(`${BACKEND_ADDR}/info`, {
    credentials: "include",
  });
  const info = await res.text();
  console.log(`The info is:\n${info}`);
  alert(info);
}

const connectWalletBtn = document.getElementById("connectWalletBtn");
const signInBtn = document.getElementById("signInBtn");
const infoBtn = document.getElementById("infoBtn");
connectWalletBtn.onclick = connectWallet;
signInBtn.onclick = signIn;
infoBtn.onclick = getInfo;
