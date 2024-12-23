
import { ScriptTransactionRequest, sha256 } from 'fuels';
import { launchTestNode } from 'fuels/test-utils';
import { TestPredicate as PredicateSigning } from '../../src/sway-api';
import { describe, it, expect } from 'vitest';

describe('predicate', () => {
  it('sends tx', async () => {
    using launched = await launchTestNode({
      walletsConfig: {
        count: 3,
      }
    });
    const { wallets: [
      sender,
      signer,
      receiver,
    ], provider } = launched;

    const initialBalance = await receiver.getBalance();
    
    const amountToReceiver = 100;
    
    const predicate = new PredicateSigning({
      provider,
      data: [signer.address.toB256()],
    });
    
    const tx = await sender.transfer(
      predicate.address,
      200_000,
      provider.getBaseAssetId()
    );
    await tx.waitForResult();
    
    const request = new ScriptTransactionRequest();
    request.addCoinOutput(
      receiver.address,
      amountToReceiver,
      provider.getBaseAssetId()
    );
    
    const resources = await predicate.getResourcesToSpend([
      {
        assetId: provider.getBaseAssetId(),
        amount: amountToReceiver,
      },
    ]);
    
    request.addResources(resources);
    request.addWitness('0x');

    const chainId = await provider.getChainId();
    const txId = request.getTransactionId(chainId);
    const message = `A Fuel Transaction - ${txId}`;
    const messageSignature = await signer.signMessage(message);
    const messageHash = sha256(Buffer.from(message));
    
    const txCost = await predicate.getTransactionCost(request, {
      signatureCallback: async (txRequest) => {
        txRequest.addWitness(messageSignature);
        txRequest.addWitness(messageHash);
        return txRequest;
      },
    });

    request.updatePredicateGasUsed(txCost.estimatedPredicates);

    request.gasLimit = txCost.gasUsed;
    request.maxFee = txCost.maxFee;

    await predicate.fund(request, txCost);

    request.addWitness(messageSignature);
    request.addWitness(messageHash);
    
    const res = await provider.sendTransaction(request);
    await res.waitForResult();

    const finalBalance = await receiver.getBalance();

    expect(finalBalance.toNumber()).toBe(initialBalance.toNumber() + amountToReceiver);
  });
});
