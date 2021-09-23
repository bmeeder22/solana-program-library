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
  let feePayerAccountPriv = '159,109,253,114,179,192,89,62,230,87,56,209,53,249,203,1,129,82,44,101,9,222,237,242,146,185,24,33,139,97,203,33,180,178,57,132,212,157,88,173,124,79,236,208,231,231,237,208,97,155,19,111,166,149,87,60,196,240,164,172,113,216,86,243';
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
    new PublicKey('4t4G7iAjNqV7sNGf6V9Hha4MQrrT6FtvfodsaaqRS6sT'),
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
