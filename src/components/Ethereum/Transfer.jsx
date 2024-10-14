import { useState } from "react";

import PropTypes from 'prop-types';
import { forwardRef } from "react";
import { useImperativeHandle } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export const TransferForm = forwardRef(({ props: { Eth, senderAddress, loading } }, ref) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState(0.005);

  useImperativeHandle(ref, () => ({
    async createPayload() {
      const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount, undefined);
      return { transaction, payload };
    },
    async afterRelay() { }
  }));

  return (
    <>
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-1">To:</Label>
        <div className="mt-1">
          <Input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
            value={receiver} 
            onChange={(e) => setReceiver(e.target.value)} 
            disabled={loading} 
          />
        </div>
      </div>
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-1">Amount:</Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <Input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            step="0.001" 
            disabled={loading} 
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm mr-4">Ethereum units</span>
          </div>
        </div>
      </div>
    </>
  )
});

TransferForm.propTypes = {
  props: PropTypes.shape({
    senderAddress: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    Eth: PropTypes.shape({
      createPayload: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

TransferForm.displayName = 'TransferForm';