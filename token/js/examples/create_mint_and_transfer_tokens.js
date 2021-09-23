const web3 = require('@solana/web3.js');
const splToken = require('../lib/index.cjs.js');
const {PublicKey, Keypair, Signer} = require('@solana/web3.js');
const {Buffer} = require('buffer');

/*
TO USE:

1. Change feePayerAccountPriv to the private key of the VANITY token
2. Change fromTokenAccount to the public key of the wallet that you want ALL 250,000,000 tokens sent to
 */
function getMintAccount() {
  let feePayerAccountPriv = '166,104,100,190,110,68,5,37,250,29,118,79,195,142,84,138,116,55,255,19,137,53,189,71,182,25,147,80,35,199,25,239,7,5,232,213,32,115,218,49,83,119,26,12,150,182,101,102,13,254,209,64,98,112,43,174,146,32,91,36,142,115,17,3';
  const testFeePayerAccountPrivateKeyDecoded = feePayerAccountPriv
    .split(',')
    .map((s) => parseInt(s));

  return Keypair.fromSecretKey(
    Buffer.from(testFeePayerAccountPrivateKeyDecoded)
  );
}

(async () => {
  const mintAccount = getMintAccount();

  let feePayerAccountPriv = "144,171,0,170,252,74,122,143,100,214,232,12,170,158,141,193,214,91,216,11,176,231,48,8,175,235,152,90,194,145,199,161,222,57,166,165,201,118,248,45,79,66,215,235,64,225,203,116,13,136,98,17,165,154,59,203,8,205,184,182,170,103,191,43";
  const testFeePayerAccountPrivateKeyDecoded = feePayerAccountPriv
    .split(",")
    .map((s) => parseInt(s));

  const payerWallet = Keypair.fromSecretKey(
    Buffer.from(testFeePayerAccountPrivateKeyDecoded)
  );

  console.log('mint new token');
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl('mainnet-beta'), 'finalized'
  );
  // Create new token mint
  const mint = await splToken.Token.createMint(
    connection,
    payerWallet,
    payerWallet.publicKey,
    null,
    6,
    splToken.TOKEN_PROGRAM_ID,
    mintAccount
  );
  console.log('finished minting new token');

  console.log('creating associated token accounts');
  // Get the token account of the payerWallet Solana address, if it does not exist, create it
  const walletToMintNewTokensTo = await mint.getOrCreateAssociatedAccountInfo(
    payerWallet.publicKey,
  );
  console.log('finished creating associated token accounts');

  console.log('running mintto');
  const amount = 250000000 * 1000000;
  // Minting amount of new token to the "walletToMintNewTokensTo" account we just returned/created
  await mint.mintTo(
    walletToMintNewTokensTo.address,
    payerWallet.publicKey,
    [],
    amount,
  );
  console.log('done running mintto');

  console.log('setting authority to null');
  await mint.setAuthority(
    mintAccount.publicKey,
    null,
    'MintTokens',
    payerWallet.publicKey,
    [payerWallet],
  );
  console.log('authority set to null');

})();
