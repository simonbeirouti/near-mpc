// import React, { useState, useContext } from 'react';
// import { initializeNear, sign } from "@/lib/near";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { genAddress } from "@/lib/kdf";
// import { NearContext } from "@/context";

// console.log('All env variables:', import.meta.env);
// console.log('VITE_NEAR_PRIVATE_KEY:', import.meta.env.VITE_NEAR_PRIVATE_KEY);
// console.log('VITE_MPC_PUBLIC_KEY:', import.meta.env.VITE_MPC_PUBLIC_KEY);
// console.log('VITE_MPC_PATH:', import.meta.env.VITE_MPC_PATH);

// export default function KeysPage() {
//     const { wallet, signedAccountId } = useContext(NearContext);
//     const [address, setAddress] = useState('');
//     const [publicKey, setPublicKey] = useState('');
//     const [signature, setSignature] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     const handleGenerateKeys = async () => {
//         setIsLoading(true);
//         try {
//             const userNearAccountId = signedAccountId;
//             console.log('userNearAccountId:', userNearAccountId);
//             const userPrivateKey = import.meta.env.VITE_NEAR_PRIVATE_KEY;
//             const mpcPublicKey = import.meta.env.VITE_MPC_PUBLIC_KEY;
//             const userCustomPath = import.meta.env.VITE_MPC_PATH;

//             console.log('Generating address with:', {
//                 userNearAccountId,
//                 mpcPublicKey,
//                 userCustomPath
//             });

//             if (!mpcPublicKey) {
//                 throw new Error('MPC Public Key is undefined. Check your environment variables.');
//             }

//             // Generate address
//             const { address: generatedAddress, publicKey: generatedPublicKey } = await genAddress(userNearAccountId, mpcPublicKey, userCustomPath);
//             setAddress(generatedAddress);
//             setPublicKey(generatedPublicKey);

//             // Initialize NEAR
//             const { account } = await initializeNear(userNearAccountId, userPrivateKey);

//             // Sign a payload
//             const sig = await sign(account, 'Hello, World!', userCustomPath);
//             setSignature(JSON.stringify(sig));
//         } catch (error) {
//             console.error('Error generating keys:', error);
//             alert(error.message || 'Error generating keys. Check console for details.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="p-4 space-y-4 flex flex-col items-center justify-center h-screen">
//             {/* <Button variant="outline">{wallet ? 'Connected' : 'Not Connected'}</Button> */}
//             <div variant="outline">{signedAccountId || 'Not signed in'}</div>
//             <Button 
//                 onClick={handleGenerateKeys} 
//                 disabled={isLoading}
//             >
//                 {isLoading ? 'Generating...' : 'Generate Keys and Sign'}
//             </Button>
//             {address && (
//                 <div className="space-y-2 w-full px-12">
//                     <h2 className="text-xl font-semibold">Generated Data:</h2>
//                     <div className="space-y-2">
//                         <Label htmlFor="address">Address:</Label>
//                         <Input id="address" value={address} />
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="publicKey">Public Key:</Label>
//                         <Input id="publicKey" value={publicKey} />
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="signature">Signature:</Label>
//                         <Input id="signature" value={signature} />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
