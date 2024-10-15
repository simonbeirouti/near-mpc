// import { createContext } from 'react';

// /**
//  * @typedef NearContext
//  * @property {import('./services/near-wallet').Wallet} wallet Current wallet
//  * @property {string} signedAccountId The AccountId of the signed user
//  */

// /** @type {import ('react').Context<NearContext>} */
// export const NearContext = createContext({
//   wallet: undefined,
//   signedAccountId: ''
// });

import { create } from 'zustand';
import { getAccountKeys } from '@/lib/nearUtils';

/**
 * @typedef {Object} NearStore
 * @property {import('./services/near-wallet').Wallet | undefined} wallet Current wallet
 * @property {string} signedAccountId The AccountId of the signed user
 * @property {function} setWallet Function to update the wallet
 * @property {function} setSignedAccountId Function to update the signedAccountId
 */

/** @type {import('zustand').StateCreator<NearStore>} */
const createNearStore = (set) => ({
  wallet: undefined,
  signedAccountId: '',
  isWalletInitialized: false,
  setWallet: (wallet) => set({ wallet }),
  setSignedAccountId: (signedAccountId) => set({ signedAccountId }),
  setWalletInitialized: (isInitialized) => set({ isWalletInitialized: isInitialized }),
  sortedKeys: [],
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  
  fetchAndSortKeys: async (accountId) => {
    try {
      const keys = await getAccountKeys(accountId);
      const sortedKeys = keys.sort((a, b) => {
        const allowanceA = a.access_key.permission.FunctionCall?.allowance;
        const allowanceB = b.access_key.permission.FunctionCall?.allowance;
        
        if (allowanceA === null && allowanceB === null) return 0;
        if (allowanceA === null) return -1;
        if (allowanceB === null) return 1;
        
        return parseInt(allowanceB) - parseInt(allowanceA);
      });
      set({ sortedKeys });
    } catch (error) {
      console.error('Failed to fetch and sort keys:', error);
      set({ sortedKeys: [] });
    }
  },
});

export const useNearStore = create(createNearStore);
