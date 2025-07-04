
const DEST_WALLET = "8W2ogqdvFSvDfQitX2JyyiCX6hqehZWvrpWTkkYCHGPm";
const USDT_MINT = "Es9vMFrzaCERCFGK2F4zn6Lz3bZQkQqUGe9nU2hteY4";
let provider = null;

function getProvider() {
  if (window.solana && window.solana.isPhantom) return window.solana;
  if (window.solflare) return window.solflare;
  alert("Instala Phantom o Solflare Wallet.");
  return null;
}

async function connectWallet() {
  provider = getProvider();
  if (!provider) return;
  try {
    await provider.connect();
    document.getElementById("status").innerText = "Wallet conectada: " + provider.publicKey.toString();
  } catch (e) {
    alert("No se pudo conectar la billetera.");
  }
}

document.getElementById("usdtAmount").addEventListener("input", function () {
  const usdt = parseFloat(this.value);
  const obracol = isNaN(usdt) ? 0 : usdt * 1000;
  document.getElementById("obracolAmount").textContent = obracol;
});

async function buyTokens() {
  provider = getProvider();
  if (!provider) return;
  const conn = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
  const payer = provider.publicKey;
  const usdtAmount = parseFloat(document.getElementById("usdtAmount").value);
  if (isNaN(usdtAmount) || usdtAmount <= 0) {
    alert("Ingresa una cantidad válida de USDT.");
    return;
  }
  const amount = Math.floor(usdtAmount * 1e6);

  try {
    const tx = new solanaWeb3.Transaction();
    const fromATA = await solanaWeb3.Token.getAssociatedTokenAddress(
      solanaWeb3.ASSOCIATED_TOKEN_PROGRAM_ID,
      solanaWeb3.TOKEN_PROGRAM_ID,
      new solanaWeb3.PublicKey(USDT_MINT),
      payer
    );
    const toATA = await solanaWeb3.Token.getAssociatedTokenAddress(
      solanaWeb3.ASSOCIATED_TOKEN_PROGRAM_ID,
      solanaWeb3.TOKEN_PROGRAM_ID,
      new solanaWeb3.PublicKey(USDT_MINT),
      new solanaWeb3.PublicKey(DEST_WALLET)
    );
    tx.add(solanaWeb3.Token.createTransferInstruction(
      solanaWeb3.TOKEN_PROGRAM_ID,
      fromATA,
      toATA,
      payer,
      [],
      amount
    ));
    tx.feePayer = payer;
    let { blockhash } = await conn.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    const signed = await provider.signTransaction(tx);
    const txid = await conn.sendRawTransaction(signed.serialize());
    document.getElementById("status").innerText = `Pago enviado. TxID: ${txid}`;
  } catch (e) {
    alert("Error al enviar USDT: " + e.message);
  }
}

document.getElementById("connectWallet").onclick = connectWallet;
document.getElementById("buyToken").onclick = buyTokens;

function startCountdown() {
  const endDate = new Date("2025-08-28T00:00:00Z").getTime();
  const interval = setInterval(function () {
    const now = Date.now();
    const diff = endDate - now;
    if (diff <= 0) {
      clearInterval(interval);
      document.getElementById("countdown").textContent = "Preventa finalizada";
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      document.getElementById("countdown").textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }, 1000);
}
startCountdown();
