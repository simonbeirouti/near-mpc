import {NearContext} from "./context";

import {useEffect, useState} from "react";
import Navbar from "./components/Navbar";
import {Wallet} from "./services/near-wallet";
import {EthereumView} from "./components/Ethereum/Ethereum";
import {BitcoinView} from "./components/Bitcoin";
import {Input} from "./components/ui/input";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "./components/ui/select";

// CONSTANTS
const MPC_CONTRACT = "v1.signer-prod.testnet";

// NEAR WALLET
const wallet = new Wallet({network: "testnet"});

// parse transactionHashes from URL
const txHash = new URLSearchParams(window.location.search).get(
	"transactionHashes"
);
const transactions = txHash ? txHash.split(",") : [];

function App() {
	const [signedAccountId, setSignedAccountId] = useState("");
	const [status, setStatus] = useState("Please login to request a signature");
	const [chain, setChain] = useState("eth");

	useEffect(() => {
		wallet.startUp(setSignedAccountId);
	}, []);

	return (
		<NearContext.Provider value={{wallet, signedAccountId}}>
			<div className="flex flex-col overflow-hidden min-h-screen">
				<Navbar />
				<div className="flex flex-col h-full items-center justify-center p-4">
					<h1 className="text-3xl font-bold mb-8">
						🔗 NEAR Multi Chain
					</h1>

					{signedAccountId && (
						<div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
							<div className="mb-4">
								<Input
									className="w-full px-3 py-2 text-sm text-gray-900 border rounded-md bg-gray-50 border-gray-500 shadow-md"
									type="text"
									value={`MPC Contract: ${MPC_CONTRACT}`}
									disabled
								/>
							</div>

							<div className="mb-6">
								<Select
									id="chain"
									className="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={chain}
                  onValueChange={(value) => setChain(value)}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Chain" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="eth">
											{" "}
											Ξ Ethereum{" "}
										</SelectItem>
										<SelectItem disabled value="btc">
											{" "}
											₿ BTC{" "}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{chain === "eth" && (
								<EthereumView
									props={{
										setStatus,
										MPC_CONTRACT,
										transactions,
									}}
								/>
							)}
							{chain === "btc" && (
								<BitcoinView
									props={{
										setStatus,
										MPC_CONTRACT,
										transactions,
									}}
								/>
							)}
						</div>
					)}

					<div className="mt-6 text-center text-sm text-gray-600">
						{status}
					</div>

					{/* <div className="mt-4 text-center text-sm text-red-600">
				⚠️ Warning: Minimum deposit is used. MPC congestion may cause transaction failure
</div> */}
				</div>
			</div>
		</NearContext.Provider>
	);
}

export default App;
