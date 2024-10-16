import {connect, keyStores, WalletConnection} from "near-api-js";

// Initialize the connection to NEAR
const initializeNear = async () => {
	const nearConfig = {
		networkId: "testnet", // or 'mainnet' for production
		keyStore: new keyStores.BrowserLocalStorageKeyStore(),
		nodeUrl: "https://rpc.testnet.near.org",
		walletUrl: "https://testnet.mynearwallet.com/",
		helperUrl: "https://helper.testnet.near.org",
		explorerUrl: "https://testnet.nearblocks.io",
	};

	return await connect(nearConfig);
};

// Load Account
export const loadAccount = async (accountId) => {
	const near = await initializeNear();
	return await near.account(accountId);
};

// Create Account (sub-account)
export const createAccount = async (parentAccountId, subAccountId, publicKey, initialBalance) => {
	const parentAccount = await loadAccount(parentAccountId);
	await parentAccount.createAccount(
		subAccountId,
		publicKey,
		initialBalance
	);
};

// Delete Account
export const deleteAccount = async (accountId, beneficiaryId) => {
	const account = await loadAccount(accountId);
	await account.deleteAccount(beneficiaryId);
};

// Fetch access keys for an account
export const getAccountKeys = async (accountId) => {
	if (!accountId) {
		throw new Error("Account ID is required");
	}

	const near = await initializeNear();

	try {
		const response = await near.connection.provider.query({
			request_type: "view_access_key_list",
			account_id: accountId,
			finality: "final",
		});

		// Process and return the keys, excluding full access keys
		return response.keys
			.filter((key) => key.access_key.permission !== "FullAccess")
			.map((key) => ({
				public_key: key.public_key,
				access_key: key.access_key,
			}));
	} catch (error) {
		console.error("Error fetching account keys:", error);
		throw error;
	}
};

// Revoke an access key for an account
export const revokeAccessKey = async (accountId, publicKeyToRevoke) => {
	if (!accountId || !publicKeyToRevoke) {
		throw new Error("Account ID and public key to revoke are required");
	}

	const near = await initializeNear();
	const appKeyPrefix = "cubed.lol";
	const wallet = new WalletConnection(near, appKeyPrefix);

	if (!accountId) {
		throw new Error("User is not signed in");
	}

	const account = wallet.account();

	try {
		// Create a transaction to delete the key
		const transaction = await account.createTransaction({
			receiverId: accountId,
			actions: [
				{
					type: "DeleteKey",
					params: {
						publicKey: publicKeyToRevoke,
					},
				},
			],
		});

		// Sign and send the transaction
		const result = await account.signAndSendTransaction(transaction);
		console.log("Access key revoked successfully:", result);
		return result;
	} catch (error) {
		console.error("Error revoking access key:", error);
		throw error;
	}
};

// Generate a new access key for an account
export const generateAccessKey = async (accountId, options) => {
	if (!accountId) {
		throw new Error("Account ID is required");
	}

	const near = await initializeNear();
	const appKeyPrefix = "cubed.lol";
	const wallet = new WalletConnection(near, appKeyPrefix);

	// Check if the user is signed in by checking if accountId is present
	if (!accountId) {
		console.log("User is not signed in. Initiating sign-in process...");
		wallet.requestSignIn({
			contractId: options.contractId || "",
			methodNames: options.methodNames || [],
		});
		// Return early as we're redirecting the user to sign in
		return null;
	}


  const account = wallet.account();
  
  console.log(account)

	try {
		const publicKey = await near.connection.signer.createKey(
			accountId,
			appKeyPrefix
		);

		const actions = [
			{
				type: "AddKey",
				params: {
					publicKey: publicKey.toString(),
					accessKey: {
						nonce: 0,
						permission: options.fullAccess
							? "FullAccess"
							: {
									FunctionCall: {
										allowance: options.allowance
											? options.allowance.toString()
											: null,
										receiverId: options.contractId || null,
										methodNames: options.methodNames || [],
									},
							  },
					},
				},
			},
		];

		const result = await account.signAndSendTransaction({
			receiverId: accountId,
			actions: actions,
		});

		console.log("Access key generated successfully:", result);
		return result;
	} catch (error) {
		console.error("Error generating access key:", error);
		throw error;
	}
};
