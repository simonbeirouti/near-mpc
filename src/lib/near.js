import * as nearAPI from 'near-api-js';
import BN from 'bn.js';
import dotenv from 'dotenv';
dotenv.config();

const { Near, Account, keyStores, KeyPair } = nearAPI;
const {
    MPC_CONTRACT_ID,
    NEAR_PROXY_CONTRACT,
    NEAR_PROXY_ACCOUNT_ID,
    NEAR_PROXY_ACCOUNT,
    NEAR_PROXY_PRIVATE_KEY,
} = process.env;

const isProxyCall = NEAR_PROXY_CONTRACT === 'true';
const contractId = isProxyCall ? NEAR_PROXY_ACCOUNT_ID : MPC_CONTRACT_ID;

export function initializeNear(accountId, privateKey) {
    const keyStore = new keyStores.InMemoryKeyStore();
    keyStore.setKey('testnet', accountId, KeyPair.fromString(privateKey));

    console.log('Near Chain Signature (NCS) call details:');
    console.log('Near accountId', accountId);
    console.log('NCS contractId', contractId);

    const config = {
        networkId: 'testnet',
        keyStore: keyStore,
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://testnet.mynearwallet.com/',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://testnet.nearblocks.io',
    };
    const near = new Near(config);
    const account = new Account(near.connection, accountId);
    
    return { near, account };
}

export async function sign(account, payload, path) {
    const args = {
        request: {
            payload,
            path,
            key_version: 0,
        },
    };
    const proxyArgs = {
        rlp_payload: undefined,
        path,
        key_version: 0,
    };
    let attachedDeposit = nearAPI.utils.format.parseNearAmount('0.2');

    if (isProxyCall) {
        proxyArgs.rlp_payload = payload.substring(2);
        attachedDeposit = nearAPI.utils.format.parseNearAmount('1');
    }

    console.log(
        'sign payload',
        payload.length > 200 ? payload.length : payload.toString(),
    );
    console.log('with path', path);
    console.log('this may take approx. 30 seconds to complete');
    console.log('argument to sign: ', isProxyCall ? proxyArgs : args);

    let res;
    try {
        res = await account.functionCall({
            contractId,
            methodName: 'sign',
            args: isProxyCall ? proxyArgs : args,
            gas: new BN('300000000000000'),
            attachedDeposit: new BN(attachedDeposit),
        });
    } catch (e) {
        throw new Error(`error signing ${JSON.stringify(e)}`);
    }

    if ('SuccessValue' in (res.status)) {
        const successValue = (res.status).SuccessValue;
        const decodedValue = Buffer.from(successValue, 'base64').toString();
        console.log('decoded value: ', decodedValue);
        const { big_r, s: S, recovery_id } = JSON.parse(decodedValue);
        const r = Buffer.from(big_r.affine_point.substring(2), 'hex');
        const s = Buffer.from(S.scalar, 'hex');

        return {
            r,
            s,
            v: recovery_id,
        };
    } else {
        throw new Error(`error signing ${JSON.stringify(res)}`);
    }
}
