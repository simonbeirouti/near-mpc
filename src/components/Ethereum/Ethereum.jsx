import {useState, useEffect, useContext} from "react";
import {NearContext} from "../../context";

import {Ethereum} from "../../services/ethereum";
import {useDebounce} from "../../hooks/debounce";
import PropTypes from "prop-types";
import {useRef} from "react";
import {TransferForm} from "./Transfer";
import {FunctionCallForm} from "./FunctionCall";
import {Label} from "../ui/label";
import {Input} from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import {Button} from "../ui/button";

const Sepolia = 11155111;
const Eth = new Ethereum("https://rpc2.sepolia.org", Sepolia);

export function EthereumView({props: {setStatus, MPC_CONTRACT, transactions}}) {
	const {wallet, signedAccountId} = useContext(NearContext);

	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(transactions ? "relay" : "request");
	const [signedTransaction, setSignedTransaction] = useState(null);

	const [senderLabel, setSenderLabel] = useState("");
	const [senderAddress, setSenderAddress] = useState("");
	const [action, setAction] = useState("transfer");
	const [derivation, setDerivation] = useState(
		sessionStorage.getItem("derivation") || "ethereum-1"
	);
	const derivationPath = useDebounce(derivation, 1200);

	const [reloaded, setReloaded] = useState(
		transactions.length ? true : false
	);

	const childRef = useRef();

	useEffect(() => {
		// special case for web wallet that reload the whole page
		if (reloaded && senderAddress) signTransaction();

		async function signTransaction() {
			const {big_r, s, recovery_id} = await wallet.getTransactionResult(
				transactions[0]
			);
			console.log({big_r, s, recovery_id});
			const signedTransaction =
				await Eth.reconstructSignatureFromLocalSession(
					big_r,
					s,
					recovery_id,
					senderAddress
				);
			setSignedTransaction(signedTransaction);
			setStatus(
				`✅ Signed payload ready to be relayed to the Ethereum network`
			);
			setStep("relay");

			setReloaded(false);
			removeUrlParams();
		}
	}, [senderAddress]);

	useEffect(() => {
		setSenderLabel("Waiting for you to stop typing...");
		setStatus("Querying Ethereum address and Balance...");
		setSenderAddress(null);
		setStep("request");
	}, [derivation]);

	useEffect(() => {
		setEthAddress();
		console.log(derivationPath);
		async function setEthAddress() {
			const {address} = await Eth.deriveAddress(
				signedAccountId,
				derivationPath
			);
			setSenderAddress(address);
			setSenderLabel(address);

			const balance = await Eth.getBalance(address);
			if (!reloaded)
				setStatus(
					<div className="flex flex-col">
						<h1 className="text-2xl">Ethereum address: </h1>
						<h1 className="mt-1 font-medium">{address}</h1>
						<h1 className="text-2xl">Balance: </h1>
						<h1 className="mt-1 font-medium">{balance} ETH</h1>
					</div>
				);
		}
	}, [derivationPath]);

	async function chainSignature() {
		setStatus("🏗️ Creating transaction");

		const {transaction, payload} = await childRef.current.createPayload();
		// const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount, undefined);

		setStatus(
			`🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`
		);
		try {
			const {big_r, s, recovery_id} = await Eth.requestSignatureToMPC(
				wallet,
				MPC_CONTRACT,
				derivationPath,
				payload,
				transaction,
				senderAddress
			);
			const signedTransaction = await Eth.reconstructSignature(
				big_r,
				s,
				recovery_id,
				transaction,
				senderAddress
			);

			setSignedTransaction(signedTransaction);
			setStatus(
				`✅ Signed payload ready to be relayed to the Ethereum network`
			);
			setStep("relay");
		} catch (e) {
			setStatus(`❌ Error: ${e.message}`);
			setLoading(false);
		}
	}

	async function relayTransaction() {
		setLoading(true);
		setStatus(
			"🔗 Relaying transaction to the Ethereum network... this might take a while"
		);

		try {
			const txHash = await Eth.relayTransaction(signedTransaction);
			setStatus(
				<>
					<a
						href={`https://sepolia.etherscan.io/tx/${txHash}`}
						target="_blank"
					>
						{" "}
						✅ Successful{" "}
					</a>
				</>
			);
			childRef.current.afterRelay();
		} catch (e) {
			setStatus(`❌ Error: ${e.message}`);
		}

		setStep("request");
		setLoading(false);
	}

	const UIChainSignature = async () => {
		setLoading(true);
		await chainSignature();
		setLoading(false);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col items-center">
				{/* <Label className="w-full text-sm font-medium">Path:</Label> */}
				<Input
					type="text"
					className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					value={derivation}
					onChange={(e) => setDerivation(e.target.value)}
					disabled={loading}
				/>
				<div
					className="mt-1 text-center text-sm text-gray-600"
					id="eth-sender"
				>
					{senderLabel}
				</div>
			</div>
			<div className="flex flex-col items-center">
				<Label className="w-full text-sm font-medium mb-1">
					Action
				</Label>
				<div className="w-full mt-1 relative rounded-md shadow-sm">
					<Select
						className="w-4/5 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						onValueChange={(value) => setAction(value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Action" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="transfer">Ξ Transfer</SelectItem>
							<SelectItem value="function-call">
								Ξ Call Counter
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{action === "transfer" ? (
				<TransferForm
					ref={childRef}
					props={{Eth, senderAddress, loading}}
				/>
			) : (
				<FunctionCallForm
					ref={childRef}
					props={{Eth, senderAddress, loading}}
				/>
			)}

			<div className="text-center">
				{step === "request" && (
					<Button
						className=""
						onClick={UIChainSignature}
						disabled={loading}
					>
						Request Signature
					</Button>
				)}
				{step === "relay" && (
					<Button
						className=""
						onClick={relayTransaction}
						disabled={loading}
					>
						Relay Transaction
					</Button>
				)}
			</div>
		</div>
	);

	function removeUrlParams() {
		const url = new URL(window.location.href);
		url.searchParams.delete("transactionHashes");
		window.history.replaceState({}, document.title, url);
	}
}

EthereumView.propTypes = {
	props: PropTypes.shape({
		setStatus: PropTypes.func.isRequired,
		MPC_CONTRACT: PropTypes.string.isRequired,
		transactions: PropTypes.arrayOf(PropTypes.string).isRequired,
	}).isRequired,
};
