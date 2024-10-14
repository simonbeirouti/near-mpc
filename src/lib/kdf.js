import ellipticPkg from 'elliptic';
const { ec: EC } = ellipticPkg;

import jsSha3Pkg from 'js-sha3';
const { sha3_256 } = jsSha3Pkg;

import keccak from 'keccak';
import dotenv from 'dotenv';
dotenv.config();

function najPublicKeyStrToUncompressedHexPoint(najPublicKeyStr) {
    return '04' + Buffer.from(najPublicKeyStr.split(':')[1], 'base64').toString('hex');
}

async function deriveChildPublicKey(parentUncompressedPublicKeyHex, signerId, path = '') {
    const ec = new EC('secp256k1');
    const scalarHex = sha3_256(`near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`);

    const x = parentUncompressedPublicKeyHex.substring(2, 66);
    const y = parentUncompressedPublicKeyHex.substring(66);

    // Create a point object from X and Y coordinates
    const oldPublicKeyPoint = ec.curve.point(x, y);

    // Multiply the scalar by the generator point G
    const scalarTimesG = ec.g.mul(scalarHex);

    // Add the result to the old public key point
    const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);

    const newX = newPublicKeyPoint.getX().toString('hex').padStart(64, '0');
    const newY = newPublicKeyPoint.getY().toString('hex').padStart(64, '0');
    return '04' + newX + newY;
}

function uncompressedHexPointToEvmAddress(uncompressedHexPoint) {
    const address = keccak('keccak256')
        .update(Buffer.from(uncompressedHexPoint.substring(2), 'hex'))
        .digest('hex');

    // Ethereum address is last 20 bytes of hash (40 characters), prefixed with 0x
    return '0x' + address.substring(address.length - 40);
}

export async function genAddress() {
    const { MPC_PUBLIC_KEY, NEAR_ACCOUNT_ID, MPC_PATH } = process.env;
    
    let childPublicKey = await deriveChildPublicKey(
        najPublicKeyStrToUncompressedHexPoint(MPC_PUBLIC_KEY),
        NEAR_ACCOUNT_ID,
        MPC_PATH
    );

    let address = uncompressedHexPointToEvmAddress(childPublicKey);
    return { address, publicKey: childPublicKey };
}
