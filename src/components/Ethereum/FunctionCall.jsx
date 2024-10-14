import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { forwardRef, useImperativeHandle } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const abi = [
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_num",
				type: "uint256",
			},
		],
		name: "set",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "get",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "num",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

const contract = "0xe2a01146FFfC8432497ae49A7a6cBa5B9Abd71A3";

export const FunctionCallForm = forwardRef(
	({props: {Eth, senderAddress, loading}}, ref) => {
		const [number, setNumber] = useState(1000);
		const [currentNumber, setCurrentNumber] = useState("");

		async function getNumber() {
			const result = await Eth.getContractViewFunction(
				contract,
				abi,
				"get"
			);
			setCurrentNumber(String(result));
		}

		useEffect(() => {
			getNumber();
		}, []);

		useImperativeHandle(ref, () => ({
			async createPayload() {
				const data = Eth.createTransactionData(contract, abi, "set", [
					number,
				]);
				const {transaction, payload} = await Eth.createPayload(
					senderAddress,
					contract,
					0,
					data
				);
				return {transaction, payload};
			},

			async afterRelay() {
				getNumber();
			},
		}));

		return (
			<div className="space-y-4">
				<div className="space-y-2">
          <Label htmlFor="counter" className="block text-sm font-medium text-gray-700 mb-1">
						Contract address
          </Label>
          <div className="mt-1 relative rounded-md shadow-sm">
					<Input
						id="counter"
						type="text"
						value={contract}
						disabled
						className="w-full bg-gray-100"
            />
            </div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
						Number:
          </Label>
          <div className="mt-1 relative rounded-md shadow-sm">
					<Input
						id="number"
						type="number"
						value={number}
						onChange={(e) => setNumber(e.target.value)}
						step="1"
						disabled={loading}
						className="w-full"
            />
            </div>
					<p className="text-sm text-gray-500">
						The number to save, current value:{" "}
						<span className="font-bold">{currentNumber}</span>
					</p>
				</div>
			</div>
		);
	}
);

FunctionCallForm.propTypes = {
	props: PropTypes.shape({
		senderAddress: PropTypes.string.isRequired,
		loading: PropTypes.bool.isRequired,
		Eth: PropTypes.shape({
			createPayload: PropTypes.func.isRequired,
			createTransactionData: PropTypes.func.isRequired,
			getContractViewFunction: PropTypes.func.isRequired,
		}).isRequired,
	}).isRequired,
};

FunctionCallForm.displayName = "EthereumContractView";
