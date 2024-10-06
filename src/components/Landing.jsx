import Solflare from '@solflare-wallet/sdk';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function EscrowDApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [escrows, setEscrows] = useState([
    { id: 1, seller: '0x1234...5678', amount: '1 SOL', status: 'ongoing', type: 'buyer' },
    { id: 2, seller: '0x8765...4321', amount: '0.5 SOL', status: 'completed', type: 'seller' },
    { id: 3, seller: '0x2468...1357', amount: '2 SOL', status: 'disputed', type: 'arbiter' },
  ]);

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

    // Check if already connected
    if (solflare.publicKey) {
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const solflare = new Solflare();
      await solflare.connect();
      setAccount(solflare.publicKey.toString());
      setIsConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const createEscrow = (event) => {
    event.preventDefault();
    // Logic to create escrow would go here
    console.log("Creating escrow...");
  };

  const depositFunds = (escrowId) => {
    // Logic to deposit funds would go here
    console.log(`Depositing funds for escrow ${escrowId}...`);
  };

  const confirmDelivery = (escrowId) => {
    // Logic to confirm delivery would go here
    console.log(`Confirming delivery for escrow ${escrowId}...`);
  };

  const raiseDispute = (escrowId) => {
    // Logic to raise dispute would go here
    console.log(`Raising dispute for escrow ${escrowId}...`);
  };

  const resolveDispute = (escrowId, resolution) => {
    // Logic to resolve dispute would go here
    console.log(`Resolving dispute for escrow ${escrowId} in favor of ${resolution}...`);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Escrow DApp</h1>
        {isConnected ? (
          <p className="text-sm">Connected: {account}</p>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </header>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="create">Create Escrow</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Your Escrows</CardTitle>
              <CardDescription>View and manage your ongoing and past escrow transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {escrows.map((escrow) => (
                <Card key={escrow.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Escrow #{escrow.id}</CardTitle>
                    <CardDescription>{escrow.seller} - {escrow.amount}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <span className="mr-2">Status:</span>
                      {escrow.status === 'ongoing' && <AlertCircle className="text-yellow-500" />}
                      {escrow.status === 'completed' && <CheckCircle className="text-green-500" />}
                      {escrow.status === 'disputed' && <XCircle className="text-red-500" />}
                      <span className="ml-1 capitalize">{escrow.status}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    {escrow.status === 'ongoing' && escrow.type === 'buyer' && (
                      <>
                        <Button onClick={() => depositFunds(escrow.id)}>Deposit</Button>
                        <Button onClick={() => confirmDelivery(escrow.id)}>Confirm</Button>
                        <Button onClick={() => raiseDispute(escrow.id)} variant="destructive">Dispute</Button>
                      </>
                    )}
                    {escrow.status === 'disputed' && escrow.type === 'arbiter' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Resolve Dispute</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Dispute for Escrow #{escrow.id}</DialogTitle>
                            <DialogDescription>
                              Choose which party should receive the funds.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center space-x-4">
                            <Button onClick={() => resolveDispute(escrow.id, 'buyer')}>Favor Buyer</Button>
                            <Button onClick={() => resolveDispute(escrow.id, 'seller')}>Favor Seller</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Escrow</CardTitle>
              <CardDescription>Set up a new escrow transaction.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEscrow} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seller">Seller Address</Label>
                  <Input id="seller" placeholder="0x..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (SOL)</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arbiter">Arbiter Address (Optional)</Label>
                  <Input id="arbiter" placeholder="0x..." />
                </div>
                <Button type="submit" className="w-full">Create Escrow</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



// declare_id!("8tBGesS6bbGY63bMLsCYtC1j6K6XSL3asJ6RJGfVWPq9");
