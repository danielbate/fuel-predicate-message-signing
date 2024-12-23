import { useBalance, useWallet } from "@fuels/react";
import { useEffect, useState } from "react";
import { bn, Predicate as FuelPredicate, InputValue, ScriptTransactionRequest, sha256 } from "fuels";

import { TestPredicate } from "../sway-api/predicates";
import Button from "./Button";
import LocalFaucet from "./LocalFaucet";
import { isLocal, renderFormattedBalance } from "../lib.tsx";
import { useNotification } from "../hooks/useNotification.tsx";

export default function Predicate() {
  const {
    errorNotification,
    transactionSubmitNotification,
    transactionSuccessNotification,
  } = useNotification();
  const [predicate, setPredicate] = useState<FuelPredicate<InputValue[]>>();
  const [isLoading, setIsLoading] = useState(false);

  const { wallet } = useWallet();
  const address = wallet?.address.toB256() || "";
  const { balance: walletBalance, refetch: refetchWallet } = useBalance({
    address,
  });
  const predicateAddress = predicate?.address?.toB256();
  const { balance: predicateBalance, refetch: refetchPredicate } = useBalance({
    address: predicateAddress,
  });

  useEffect(() => {
    if (wallet) {
      const testPredicate = new TestPredicate(wallet);
      setPredicate(testPredicate);
    }
  }, [wallet]);

  const refetch = () => {
    refetchWallet();
    refetchPredicate();
  };

  const transferToPredicate = async () => {
    if (!wallet || !predicate) return;
    setIsLoading(true);

    try {
      const tx = await wallet.transfer(predicate.address, bn(10_000_000));
      transactionSubmitNotification(tx.id);
      await tx.waitForResult();
      transactionSuccessNotification(tx.id);
    } catch (error) {
      console.error(error);
      errorNotification("Error transferring funds. Check your wallet balance.");
    }
    setIsLoading(false);
    refetch();
  };

  const transferToWallet = async () => {
    if (!wallet || !predicate) return;
    setIsLoading(true);

    const amountToReceiver = bn(1_000_000);
    const baseAssetId = wallet.provider.getBaseAssetId();
    const provider = wallet.provider;

    try {
      const signingPredicate = new TestPredicate({
        provider: wallet.provider,
        data: [address],
      });
      
      const request = new ScriptTransactionRequest();
      request.addCoinOutput(
        wallet.address,
        amountToReceiver,
        baseAssetId
      );
      
      const resources = await signingPredicate.getResourcesToSpend([
        {
          assetId: baseAssetId,
          amount: amountToReceiver,
        },
      ]);
      
      request.addResources(resources);
      request.addWitness('0x');
  
      const chainId = await provider.getChainId();

      const 
      const txId = request.getTransactionId(chainId);
      const message = `A Fuel Transaction - ${txId}`;
      const messageSignature = await wallet.signMessage(message);
      const messageHash = sha256(Buffer.from(message));
      
      const txCost = await signingPredicate.getTransactionCost(request, {
        signatureCallback: async (txRequest) => {
          txRequest.addWitness(messageSignature);
          txRequest.addWitness(messageHash);
          return txRequest;
        },
      });
  
      request.updatePredicateGasUsed(txCost.estimatedPredicates);
  
      request.gasLimit = txCost.gasUsed;
      request.maxFee = txCost.maxFee;
  
      await signingPredicate.fund(request, txCost);
  
      request.addWitness(messageSignature);
      request.addWitness(messageHash);

      const res = await signingPredicate.sendTransaction(request);
      transactionSubmitNotification(res.id);
      await res.waitForResult();
      transactionSuccessNotification(res.id);
    } catch (error) {
      console.error(error);
      errorNotification(
        "Error transferring funds.",
      );
    }
    setIsLoading(false);
    refetch();
  };

  return (
    <>
      <div>
        <p className="pt-2">
          In the below example, we transfer{" "}
          <span className="font-mono font-bold">0.01 ETH</span> to the predicate.
        </p>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Wallet Balance
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={
              walletBalance
                ? `${renderFormattedBalance(walletBalance)} ETH`
                : ""
            }
            className="w-1/2 bg-gray-800 rounded-md px-2 py-1 mr-3 truncate font-mono"
            disabled
          />
          <Button
            onClick={transferToPredicate}
            className="w-1/2"
            disabled={isLoading}
          >
            Transfer to Predicate
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Predicate Address & Balance
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={predicateAddress}
            className="w-1/2 bg-gray-800 rounded-md px-2 py-1 font-mono mr-3"
            disabled
          />
          <input
            type="text"
            value={
              predicateBalance
                ? `${renderFormattedBalance(predicateBalance)} ETH`
                : ""
            }
            className="w-1/2 bg-gray-800 rounded-md px-2 py-1 truncate font-mono"
            disabled
          />
        </div>
      </div>
      <div>
        <Button
          onClick={transferToWallet}
          className="w-full"
          disabled={isLoading}
        >
          Sign and Transfer To Wallet
        </Button>
      </div>
      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}
