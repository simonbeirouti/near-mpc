import React, {useState, useEffect} from "react";
import {useNearStore} from "@/store";
import {useNearActions} from "@/hooks/useNearActions";
import {Button} from "@/components/ui/button";
import {useCopyToClipboard} from "usehooks-ts";
import {useToast} from "@/hooks/use-toast";
import {Trash, Infinity, CheckCheck, ClipboardCopy, Plus} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const KeySkeleton = () => (
	<li className="bg-gray-100 p-4 rounded-lg list-none">
		<div className="flex items-center w-full gap-x-2">
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-9 w-14" />
			<Skeleton className="h-9 w-14" />
		</div>
		<div className="flex flex-col gap-y-2 items-center w-full gap-x-2 mt-2">
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-9 w-full" />
		</div>
	</li>
);

const KeysPage = () => {
	const {signedAccountId, fetchAndSortKeys} = useNearStore();
	const {handleRevokeKey, handleGenerateKey, loadAccounts, handleCreateAccount, handleDeleteAccount} = useNearActions();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	// const [newKeyOptions, setNewKeyOptions] = useState({
	// 	fullAccess: false,
	// 	allowance: "",
	// 	contractId: "",
	// 	methodNames: "",
	// });
	// const [availableMethods, setAvailableMethods] = useState({});
	// const [copiedText, copy] = useCopyToClipboard();

	const [newAccountName, setNewAccountName] = useState('');

	// const handleCopy = (text) => () => {
	// 	copy(text)
	// 		.then(() => {
	// 			console.log("Copied!", {text});
	// 		})
	// 		.catch((error) => {
	// 			console.error("Failed to copy!", error);
	// 		});
	// };

	useEffect(() => {
		const loadKeys = async () => {
			if (!signedAccountId) {
				setLoading(false);
				return;
			}

			try {
				await fetchAndSortKeys(signedAccountId);
				await loadAccounts();
			} catch (err) {
				setError("Failed to load keys. Please try again.");
				console.error("Failed to load keys:", err);
			} finally {
				setLoading(false);
			}
		};

		loadKeys();
	}, [signedAccountId, fetchAndSortKeys, loadAccounts]);

	// const onGenerateKey = async () => {
	// 	const options = {
	// 		...newKeyOptions,
	// 		allowance: newKeyOptions.allowance
	// 			? BigInt(newKeyOptions.allowance) * BigInt(1e24)
	// 			: null,
	// 		methodNames: newKeyOptions.methodNames
	// 			.split(",")
	// 			.map((method) => method.trim()),
	// 	};
	// 	await handleGenerateKey(options);
	// };

	if (!signedAccountId) return <div>Please connect your wallet.</div>;
	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	// console.log("Available methods:", availableMethods); // Log available methods before rendering

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4 text-center">
				{signedAccountId}
			</h2>

			<Card className="mb-4">
				<CardHeader>
					<CardTitle>Create New Account</CardTitle>
					<CardDescription>
						Create a new sub-account under your current account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Input
							placeholder="New Account Name"
							value={newAccountName}
							onChange={(e) => setNewAccountName(e.target.value)}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={() => handleCreateAccount(newAccountName)} className="w-full">
						<Plus className="mr-2 h-4 w-4" /> Create Account
					</Button>
				</CardFooter>
			</Card>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, index) => (
						<KeySkeleton key={index} />
					))}
				</div>
			) : (
				<div>{error}</div>
			)}
			{/* {loading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, index) => (
						<KeySkeleton key={index} />
					))}
				</div>
			) : error ? (
				<div>{error}</div>
			) : sortedKeys.length === 0 ? (
				<Card className="mb-4">
					<CardHeader>
						<CardTitle>Generate New Key</CardTitle>
						<CardDescription>
							Create a new access key for your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<Switch
									id="full-access"
									checked={newKeyOptions.fullAccess}
									onCheckedChange={(checked) =>
										setNewKeyOptions((prev) => ({
											...prev,
											fullAccess: checked,
										}))
									}
								/>
								<Label htmlFor="full-access">Full Access</Label>
							</div>
							{!newKeyOptions.fullAccess && (
								<>
									<Input
										type="number"
										placeholder="Allowance (in NEAR)"
										value={newKeyOptions.allowance}
										onChange={(e) =>
											setNewKeyOptions((prev) => ({
												...prev,
												allowance: e.target.value,
											}))
										}
									/>
									<Input
										placeholder="Contract ID"
										value={newKeyOptions.contractId}
										onChange={(e) =>
											setNewKeyOptions((prev) => ({
												...prev,
												contractId: e.target.value,
											}))
										}
									/>
									<div className="space-y-2">
										<Label>Select Methods</Label>
										<div className="flex flex-wrap gap-2">
											{availableMethods.map((method) => (
												<Button
													key={method}
													variant={newKeyOptions.methodNames.includes(method) ? "default" : "outline"}
													onClick={() => {
														setNewKeyOptions((prev) => ({
															...prev,
															methodNames: prev.methodNames.includes(method)
																? prev.methodNames.filter((m) => m !== method)
																: [...prev.methodNames, method],
														}));
													}}
												>
													{method}
												</Button>
											))}
										</div>
									</div>
								</>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button onClick={onGenerateKey} className="w-full">
							<Plus className="mr-2 h-4 w-4" /> Generate Key
						</Button>
					</CardFooter>
				</Card>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
					{sortedKeys.map((key, index) => (
						<li
							key={index}
							className="bg-gray-100 p-4 rounded-lg list-none"
						>
							<div className="flex items-center w-full gap-x-2">
								<Button className="flex-grow cursor-pointer font-semibold truncate">
									Visit!
								</Button>
								<Button
									onClick={handleCopy(key.public_key)}
									className="p-2"
								>
									<p>
										{copiedText === key.public_key ? (
											<CheckCheck />
										) : (
											<ClipboardCopy />
										)}
									</p>
								</Button>
								<Button
									variant="destructive"
									className="p-2"
									onClick={() =>
										handleRevokeKey(key.public_key)
									}
								>
									<Trash className="h-5 w-5" />
								</Button>
							</div>
							<div className="flex flex-col gap-y-2 items-center w-full gap-x-2 mt-2">
								{key.access_key.permission !== "FullAccess" && (
									<>
										<Button className="w-full font-semibold">
											{key.access_key.permission
												.FunctionCall.allowance ? (
												`${(
													parseInt(
														key.access_key
															.permission
															.FunctionCall
															.allowance
													) / 1e24
												).toFixed(2)}`
											) : (
												<Infinity />
											)}
										</Button>
										<Button className="w-full font-semibold overflow-hidden">
											<div className="truncate hover:text-clip hover:overflow-x-auto">
												{
													key.access_key.permission
														.FunctionCall
														.receiver_id
												}
											</div>
										</Button>
										<Select>
											<SelectTrigger className="w-full bg-white">
												<SelectValue
													className="text-xl font-semibold text-center"
													placeholder="View Methods"
												/>
											</SelectTrigger>
											<SelectContent>
												{availableMethods && 
												 availableMethods[key.access_key.permission.FunctionCall.receiver_id] ? (
													availableMethods[key.access_key.permission.FunctionCall.receiver_id].map((method, methodIndex) => (
														<SelectItem key={methodIndex} value={method}>
															<Button
																onClick={() => handleMethodClick(key.access_key.permission.FunctionCall.receiver_id, method)}
																className="w-full text-left"
															>
																{method}
															</Button>
														</SelectItem>
													))
												) : (
													<SelectItem value="no-methods">No methods available</SelectItem>
												)}
											</SelectContent>
										</Select>
									</>
								)}
							</div>
						</li>
					))}
				</div>
			)} */}
		</div>
	);
};

export default KeysPage;