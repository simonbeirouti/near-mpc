import { useState, useEffect, useContext } from "react";
import { NearContext } from "../context";

import { Bitcoin as Bitcoin } from "../services/bitcoin";
import { useDebounce } from "../hooks/debounce";
import PropTypes from 'prop-types';

const BTC_NETWORK = 'testnet';
const BTC = new Bitcoin('https://blockstream.info/testnet/api', BTC_NETWORK);

export function BitcoinView({ props: { setStatus, MPC_CONTRACT } }) {
  const { wallet, signedAccountId } = useContext(NearContext);

  const [receiver, setReceiver] = useState("tb1q86ec0aszet5r3qt02j77f3dvxruk7tuqdlj0d5");
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("request");
  const [signedTransaction, setSignedTransaction] = useState(null);
  const [senderAddress, setSenderAddress] = useState("")
  const [senderPK, setSenderPK] = useState("")

  const [derivation, setDerivation] = useState("bitcoin-1");
  const derivationPath = useDebounce(derivation, 500);

  useEffect(() => {
    setSenderAddress('Waiting for you to stop typing...')
  }, [derivation]);

  useEffect(() => {
    setBtcAddress()

    async function setBtcAddress() {
      setStatus('Querying your address and balance');
      setSenderAddress(`Deriving address from path ${derivationPath}...`);

      const { address, publicKey } = await BTC.deriveAddress(signedAccountId, derivationPath);
      setSenderAddress(address);
      setSenderPK(publicKey);

      const balance = await BTC.getBalance(address);
      setStatus(`Your Bitcoin address is: ${address}, balance: ${balance} satoshi`);
    }
  }, [signedAccountId, derivationPath, setStatus]);

  async function chainSignature() {
    setStatus('🏗️ Creating transaction');
    const payload = await BTC.createPayload(senderAddress, receiver, amount);

    setStatus('🕒 Asking MPC to sign the transaction, this might take a while...');
    try {
      const signedTransaction = await BTC.requestSignatureToMPC(wallet, MPC_CONTRACT, derivationPath, payload, senderPK);
      setStatus('✅ Signed payload ready to be relayed to the Bitcoin network');
      setSignedTransaction(signedTransaction);
      setStep('relay');
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
      setLoading(false);
    }
  }

  async function relayTransaction() {
    setLoading(true);
    setStatus('🔗 Relaying transaction to the Bitcoin network... this might take a while');

    try {
      const txHash = await BTC.relayTransaction(signedTransaction);
      setStatus(
        <>
          <a href={`https://blockstream.info/testnet/tx/${txHash}`} target="_blank"> ✅ Successful </a>
        </>
      );
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
    }

    setStep('request');
    setLoading(false);
  }

  const UIChainSignature = async () => {
    setLoading(true);
    await chainSignature();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <label className="w-1/5 text-sm font-medium">Path:</label>
        <div className="w-4/5">
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={derivation}
            onChange={(e) => setDerivation(e.target.value)}
            disabled={loading}
          />
          <div className="mt-1 text-sm text-gray-600" id="eth-sender">
            {senderAddress}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <label className="w-1/5 text-sm font-medium">To:</label>
        <div className="w-4/5">
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className="flex items-center">
        <label className="w-1/5 text-sm font-medium">Amount:</label>
        <div className="w-4/5">
          <input
            type="number"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="1"
            disabled={loading}
          />
          <div className="mt-1 text-sm text-gray-600">satoshi units</div>
        </div>
      </div>

      <div className="text-center mt-6">
        {step === 'request' && (
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            onClick={UIChainSignature}
            disabled={loading}
          >
            Request Signature
          </button>
        )}
        {step === 'relay' && (
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            onClick={relayTransaction}
            disabled={loading}
          >
            Relay Transaction
          </button>
        )}
      </div>
    </div>
  );
}

BitcoinView.propTypes = {
  props: PropTypes.shape({
    setStatus: PropTypes.func.isRequired,
    MPC_CONTRACT: PropTypes.string.isRequired,
  }).isRequired
};
