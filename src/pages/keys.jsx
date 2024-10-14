import React, {useState, useEffect} from "react";
import {revokeAccessKey, generateAccessKey} from "@/lib/nearUtils";
import {useNearStore} from "@/store";
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
	const {toast} = useToast();
	const {signedAccountId, sortedKeys, fetchAndSortKeys} = useNearStore();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [newKeyOptions, setNewKeyOptions] = useState({
		fullAccess: false,
		allowance: "",
		contractId: "",
		methodNames: "",
	});

	useEffect(() => {
		const loadKeys = async () => {
			if (!signedAccountId) {
				setLoading(false);
				return;
			}

			try {
				await fetchAndSortKeys(signedAccountId);
			} catch (err) {
				setError("Failed to load keys. Please try again.");
				console.error("Failed to load keys:", err);
			} finally {
				setLoading(false);
			}
		};

		loadKeys();
	}, [signedAccountId, fetchAndSortKeys]);

	const handleRevokeKey = async (publicKey) => {
		try {
			await revokeAccessKey(signedAccountId, publicKey);
			toast({
				title: "Key Revoked",
				description: `Successfully revoked key: ${publicKey.slice(
					0,
					10
				)}...`,
			});
			// Reload keys after revoking
			await fetchAndSortKeys(signedAccountId, true);
		} catch (err) {
			console.error("Failed to revoke key:", err);
			toast({
				title: "Error",
				description: "Failed to revoke key. Please try again.",
				variant: "destructive",
			});
		}
	};

	const [copiedText, copy] = useCopyToClipboard();

	const handleCopy = (text) => () => {
		copy(text)
			.then(() => {
				console.log("Copied!", {text});
			})
			.catch((error) => {
				console.error("Failed to copy!", error);
			});
	};

	const handleGenerateKey = async () => {
		try {
			const options = {
				...newKeyOptions,
				allowance: newKeyOptions.allowance
					? BigInt(newKeyOptions.allowance) * BigInt(1e24)
					: null,
				methodNames: newKeyOptions.methodNames
					.split(",")
					.map((method) => method.trim()),
			};
			await generateAccessKey(signedAccountId, options);
			toast({
				title: "Key Generated",
				description: "Successfully generated a new access key.",
			});
			// Reload keys after generating
			await fetchAndSortKeys(signedAccountId, true);
		} catch (err) {
			console.error("Failed to generate key:", err);
			toast({
				title: "Error",
				description: "Failed to generate key. Please try again.",
				variant: "destructive",
			});
		}
	};

	if (!signedAccountId) return <div>Please connect your wallet.</div>;

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4 text-center">
				{signedAccountId}
			</h2>

			{loading ? (
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
									<Input
										placeholder="Method Names (comma-separated)"
										value={newKeyOptions.methodNames}
										onChange={(e) =>
											setNewKeyOptions((prev) => ({
												...prev,
												methodNames: e.target.value,
											}))
										}
									/>
								</>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button onClick={handleGenerateKey} className="w-full">
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
												{/* {key.access_key.permission.FunctionCall.method_names && 
														key.access_key.permission.FunctionCall.method_names.map((method, index) => (
															<SelectItem key={index} value={method}>
																<div className="w-full flex justify-between items-center">
																	<span>Method {index + 1}</span>
																	<span className="text-gray-400">{method}</span>
																</div>
															</SelectItem>
														))
												} */}
												{[...Array(3)].map(
													(_, index) => (
														<SelectItem
															key={index}
															className="font-normal text-center"
															value={`Method ${
																index + 1
															}`}
														>
															Method {index + 1}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									</>
								)}
							</div>
						</li>
					))}
				</div>
			)}
		</div>
	);
};

export default KeysPage;
