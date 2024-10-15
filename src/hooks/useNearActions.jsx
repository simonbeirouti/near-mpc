import {useCallback} from "react";
import {useNearStore} from "@/store";
import {useToast} from "@/hooks/use-toast";
import {
	revokeAccessKey,
	generateAccessKey,
	loadAccount,
	createAccount,
	deleteAccount,
} from "@/lib/nearUtils";

export const useNearActions = () => {
	const {signedAccountId, fetchAndSortKeys, setAccounts} = useNearStore();
	const {toast} = useToast();

	const handleRevokeKey = useCallback(
		async (publicKey) => {
			try {
				await revokeAccessKey(signedAccountId, publicKey);
				toast({
					title: "Key Revoked",
					description: `Successfully revoked key: ${publicKey.slice(
						0,
						10
					)}...`,
				});
				await fetchAndSortKeys(signedAccountId);
			} catch (err) {
				console.error("Failed to revoke key:", err);
				toast({
					title: "Error",
					description: "Failed to revoke key. Please try again.",
					variant: "destructive",
				});
			}
		},
		[signedAccountId, fetchAndSortKeys, toast]
	);

	const handleGenerateKey = useCallback(
		async (options) => {
			try {
				await generateAccessKey(signedAccountId, options);
				toast({
					title: "Key Generated",
					description: "Successfully generated a new access key.",
				});
				await fetchAndSortKeys(signedAccountId);
			} catch (err) {
				console.error("Failed to generate key:", err);
				toast({
					title: "Error",
					description: "Failed to generate key. Please try again.",
					variant: "destructive",
				});
			}
		},
		[signedAccountId, fetchAndSortKeys, toast]
	);

	const loadAccounts = useCallback(async () => {
		try {
			const account = await loadAccount(signedAccountId);
			setAccounts([account]);
			toast({
				title: "Account Loaded",
				description: `Successfully loaded account: ${signedAccountId}`,
			});
		} catch (err) {
			console.error("Failed to load account:", err);
			toast({
				title: "Error",
				description: "Failed to load account. Please try again.",
				variant: "destructive",
			});
		}
	}, [signedAccountId, setAccounts, toast]);

	const handleCreateAccount = useCallback(
		async (newAccountName) => {
			try {
				const parentAccount = await loadAccount(signedAccountId);
				const newAccountId = `${newAccountName}.${signedAccountId}`;
				const publicKey =
					await parentAccount.connection.signer.getPublicKey(
						signedAccountId,
						"testnet"
					);
				await createAccount(
					newAccountId,
					publicKey.toString(),
					"10000000000000000000"
				);
				toast({
					title: "Account Created",
					description: `Successfully created account: ${newAccountId}`,
				});
				await loadAccounts();
			} catch (err) {
				console.error("Failed to create account:", err);
				toast({
					title: "Error",
					description: "Failed to create account. Please try again.",
					variant: "destructive",
				});
			}
		},
		[signedAccountId, loadAccounts, toast]
	);

	const handleDeleteAccount = useCallback(
		async (accountId) => {
			try {
				await deleteAccount(accountId, signedAccountId);
				toast({
					title: "Account Deleted",
					description: `Successfully deleted account: ${accountId}`,
				});
				await loadAccounts();
			} catch (err) {
				console.error("Failed to delete account:", err);
				toast({
					title: "Error",
					description: "Failed to delete account. Please try again.",
					variant: "destructive",
				});
			}
		},
		[signedAccountId, loadAccounts, toast]
	);

	const handleMethodClick = useCallback(
		async (contractId, method) => {
			try {
				const near = await initializeNear();
				const account = await near.account(signedAccountId);

				// Determine if it's a view or call method (this is a simple heuristic)
				const isViewMethod =
					method.startsWith("view_") || method.startsWith("get_");

				if (isViewMethod) {
					const result = await account.viewFunction({
						contractId,
						methodName: method,
						args: {},
					});
					console.log(`View method ${method} result:`, result);
					toast({
						title: "View Method Executed",
						description: `Method ${method} has been executed. Check console for results.`,
					});
				} else {
					const result = await account.functionCall({
						contractId,
						methodName: method,
						args: {},
						gas: "300000000000000", // Adjust gas as needed
					});
					console.log(`Call method ${method} result:`, result);
					toast({
						title: "Call Method Executed",
						description: `Method ${method} has been executed. Check console for results.`,
					});
				}
			} catch (error) {
				console.error(`Error executing method ${method}:`, error);
				toast({
					title: "Error",
					description: `Failed to execute method ${method}. Check console for details.`,
					variant: "destructive",
				});
			}
		},
		[signedAccountId, toast]
	);

	return {
		handleRevokeKey,
		handleGenerateKey,
		loadAccounts,
		handleCreateAccount,
		handleDeleteAccount,
		handleMethodClick,
	};
};
