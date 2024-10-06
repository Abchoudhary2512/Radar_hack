import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'; // Polkadot.js API
import { Button } from "@/components/ui/button";
import Solflare from '@solflare-wallet/sdk';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Replace this with your actual Ink! contract ABI and address
const CONTRACT_ABI = [ /* Your contract ABI */ ];
const CONTRACT_ADDRESS = '5Fb...YourContractAddress'; // Substrate contract address

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [api, setApi] = useState(null); // Polkadot.js API instance
  const [escrows, setEscrows] = useState([]);

  // Solflare wallet setup
  useEffect(() => {
    const solflare = new Solflare();
    
    solflare.on('connect', () => {
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    });

    solflare.on('disconnect', () => {
      setIsConnected(false);
      setAccount('');
    });

    // Initialize Polkadot.js API when component mounts
    const initApi = async () => {
      try {
        const provider = new WsProvider('wss://rpc.polkadot.io'); // Replace with your Substrate-based chain's endpoint
        const apiInstance = await ApiPromise.create({ provider });
        setApi(apiInstance);
      } catch (error) {
        console.error("Failed to initialize Polkadot.js API:", error);
      }
    };

    initApi();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    const solflare = new Solflare();
    try {
      await solflare.connect();
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Function to create a new escrow (this can be extended later)
  const createEscrow = async (event) => {
    event.preventDefault();
    console.log("Creating new escrow...");

    // Create new escrow logic here using Polkadot.js API
    try {
      // Your logic to create a new escrow contract on-chain
    } catch (error) {
      console.error("Error creating escrow:", error);
    }
  };

  // Function to deposit funds to an escrow
  const depositFunds = async (escrowId) => {
    console.log(`Depositing funds for escrow ${escrowId}...`);

    try {
      const solflare = new Solflare();
      const keyring = new Keyring({ type: 'sr25519' });
      const depositor = keyring.addFromAddress(account);

      const depositTx = api.tx.contracts.call(
        CONTRACT_ADDRESS,      // Smart contract address
        1000000000000n,        // Amount of tokens (adjust for decimals)
        5000000n,              // Gas limit
        api.tx.escrow.deposit().toHex() // Assuming deposit is a function in Ink! contract
      );

      // Sign transaction using Solflare
      const txHash = await solflare.signTransaction(depositTx, depositor);
      console.log(`Transaction successful with hash: ${txHash}`);
    } catch (error) {
      console.error("Error depositing funds:", error);
    }
  };

  // Function to approve an escrow
  const approveEscrow = async (escrowId) => {
    console.log(`Approving escrow ${escrowId}...`);

    try {
      const solflare = new Solflare();
      const keyring = new Keyring({ type: 'sr25519' });
      const arbiter = keyring.addFromAddress(account);

      const approveTx = api.tx.contracts.call(
        CONTRACT_ADDRESS,      // Smart contract address
        0n,                    // No tokens sent
        5000000n,              // Gas limit
        api.tx.escrow.approve().toHex() // Approve function call
      );

      // Sign the transaction using Solflare
      const txHash = await solflare.signTransaction(approveTx, arbiter);
      console.log(`Escrow approved with hash: ${txHash}`);
    } catch (error) {
      console.error("Error approving escrow:", error);
    }
  };

  // Function to raise a dispute
  const raiseDispute = async (escrowId) => {
    console.log(`Raising dispute for escrow ${escrowId}...`);

    try {
      // Logic for raising a dispute
    } catch (error) {
      console.error("Error raising dispute:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Substrate Escrow DApp</h1>
        {isConnected ? (
          <p className="text-sm">Connected: {account}</p>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Escrow Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Your Escrows</CardTitle>
            <p>Manage your ongoing escrow contracts</p>
          </CardHeader>
          <CardContent>
            {escrows.map((escrow) => (
              <Card key={escrow.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Escrow #{escrow.id}</CardTitle>
                  <p>{escrow.seller} - {escrow.amount}</p>
                </CardHeader>
                <CardContent>
                  <p>Status: <span className="capitalize">{escrow.status}</span></p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {escrow.status === 'ongoing' && (
                    <>
                      <Button onClick={() => depositFunds(escrow.id)}>Deposit</Button>
                      <Button onClick={() => approveEscrow(escrow.id)}>Approve</Button>
                      <Button onClick={() => raiseDispute(escrow.id)} variant="destructive">Raise Dispute</Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Create New Escrow */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Escrow</CardTitle>
            <p>Set up a new escrow contract</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={createEscrow} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller">Seller Address</Label>
                <Input id="seller" placeholder="Enter seller's address..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (SOL)</Label>
                <Input id="amount" type="number" step="0.01" placeholder="Enter amount in SOL" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arbiter">Arbiter Address (Optional)</Label>
                <Input id="arbiter" placeholder="Enter arbiter's address (optional)" />
              </div>
              <Button type="submit" className="w-full">Create Escrow</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
