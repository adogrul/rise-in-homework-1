
const fs = require('fs');
const { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

//cüzdan Oluşturma Sınıfı
const createWallet = async () => {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const walletInfo = {privateKey: keypair.secretKey.toString(), publicKey, balance: 0,};
  fs.writeFileSync('wallet.json', JSON.stringify(walletInfo));
  console.log('Cüzdan başarıyla oluşturuldu ve wallet.json dosyasına kaydedildi.');
};



const { PublicKey } = require('@solana/web3.js');

//airdrop fonksiyonu
const airdrop = async (amount = 1) => {
  const walletInfo = JSON.parse(fs.readFileSync('wallet.json', 'utf-8'));
  const publicKey = walletInfo.publicKey;

  const airdropSignature = await connection.requestAirdrop(new PublicKey(publicKey), amount * 10 ** 9);

  await connection.confirmTransaction(airdropSignature);

  console.log(`${amount} SOL airdrop başarıyla yapıldı.`);
};

//bakiye sorgulama fonksiyonu
const checkBalance = async () => {
  const walletInfo = JSON.parse(fs.readFileSync('wallet.json', 'utf-8'));
  const publicKey = walletInfo.publicKey;

  const balance = await connection.getBalance(publicKey);
  console.log(`Cüzdan bakiyesi: ${balance / 10 ** 9} SOL`);
};

//transfer fonksiyonu
const transfer = async (otherPublicKey, amount) => {
  const walletInfo = JSON.parse(fs.readFileSync('wallet.json', 'utf-8'));
  const privateKey = Uint8Array.from(JSON.parse(walletInfo.privateKey));
  const fromKeyPair = Keypair.fromSecretKey(privateKey);
  const fromPublicKey = fromKeyPair.publicKey;
  const toPublicKey = new PublicKey(otherPublicKey);
  const lamports = amount * 10 ** 9;

  const transaction = new Transaction().add(
    SystemProgram.transfer({fromPubkey: fromPublicKey, toPubkey: toPublicKey, lamports,})
  );
  await sendAndConfirmTransaction(connection, transaction, [fromKeyPair]);
  console.log(`${amount} SOL transfer başarıyla yapıldı.`);
};

//cmd de anahtar kelimeye göre fonksiyon çağırma
const command = process.argv[2];
switch (command) {
  case 'new':
    createWallet();
    break;
  case 'airdrop':
    const amount = process.argv[3] || 1;
    airdrop(amount);
    break;
  case 'balance':
    checkBalance();
    break;
  case 'transfer':
    const otherPublicKey = process.argv[3];
    const transferAmount = parseFloat(process.argv[4]);
    transfer(otherPublicKey, transferAmount);
    break;
  default:
    console.log('Geçersiz komut.');
}
