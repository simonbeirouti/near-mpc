import { genAddress } from './kdf.js';

export async function generateEthereumAddress() {
    try {
        const { address } = await genAddress();
        return address;
    } catch (error) {
        console.error('Error generating Ethereum address:', error);
        throw error;
    }
}