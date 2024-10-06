import Solflare from '@solflare-wallet/sdk';
import { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

export default function EscrowDApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const solflare = new Solflare();

    // Wallet event listeners
    solflare.on('connect', () => {
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    });

    solflare.on('disconnect', () => {
      setIsConnected(false);
      setAccount('');
    });

    // If the wallet is already connected, set the account
    if (solflare.publicKey) {
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    }

    // Establish connection to the Solana devnet
    const connection = new Connection('https://api.devnet.solana.com');
    setConnection(connection);
  }, []);

  const connectWallet = async () => {
    const solflare = new Solflare();
    try {
      await solflare.connect();
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to create an escrow transaction
  const createEscrow = async () => {
    if (!connection || !account) return;

    const solflare = new Solflare();
    const payerPublicKey = new PublicKey(account);
    const beneficiaryPublicKey = new PublicKey('5Gw3s7q4QLkSWwknsiA3bu1WxyGi44g2GGe9p2DaMgmWcTVA'); // Replace with real address
    const arbiterPublicKey = new PublicKey('0xbDA5747bFD65F08deb54cb465eB87D40e51B197E'); // Replace with real address
    const lamports = 1 * 1e9; // 1 SOL in lamports

    // Create the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        toPubkey: beneficiaryPublicKey,
        lamports,
      })
    );

    // Set the transaction fee payer
    transaction.feePayer = payerPublicKey;

    // Get the latest blockhash
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;

    try {
      // Sign and send the transaction
      const signedTransaction = await solflare.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Confirm the transaction
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed with signature:', signature);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  // Function to approve escrow (using arbiter)
  const approveEscrow = async () => {
    // Similar logic to createEscrow but with approval-specific logic
    // Approve escrow interaction logic with Solana smart contract
    console.log("Approve escrow logic here");
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Solana Escrow DApp</h1>
        {isConnected ? (
          <p className="text-sm">Connected: {account}</p>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>

      {isConnected && (
        <div>
          <h2>Escrow Actions</h2>
          <button onClick={createEscrow}>Create Escrow</button>
          <button onClick={approveEscrow}>Approve Escrow</button>
        </div>
      )}
    </div>
  );
}
