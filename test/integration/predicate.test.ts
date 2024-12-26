
import { CoinTransactionRequestInput, ScriptTransactionRequest, sha256, Signer } from 'fuels';
import { launchTestNode } from 'fuels/test-utils';
import { TestPredicate as PredicateSigning } from '../../src/sway-api';
import { describe, it, expect } from 'vitest';
import { getMaxPredicateGasUsed } from '../../src/utils';

describe('predicate', () => {
  it('sends tx', async () => {
    using launched = await launchTestNode({
      walletsConfig: {
        count: 3,
      }
    });
    const { wallets: [
      admin,
      signer,
      receiver,
    ], provider } = launched;

    const initialBalance = await receiver.getBalance();
    const assetId = '0x0101010101010101010101010101010101010101010101010101010101010101';
    const amountToReceiver = 100;
    
    const predicate = new PredicateSigning({
      provider,
      data: [signer.address.toB256()],
    });
    
    const tx = await admin.transfer(
      predicate.address,
      200_000,
      assetId
    );
    await tx.waitForResult();
    
    const request = new ScriptTransactionRequest();
    request.addCoinOutput(
      receiver.address,
      amountToReceiver,
      assetId
    );
    const resources = await predicate.getResourcesToSpend([
      {
        assetId,
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
    expect(Signer.recoverAddress(messageHash, messageSignature).toB256()).toBe(signer.address.toB256());

    const txCost = await signer.getTransactionCost(request, {
      signatureCallback: async (txRequest) => {
        txRequest.addWitness(messageSignature);
        txRequest.addWitness(messageHash);
        return txRequest;
      },
    });

    request.updatePredicateGasUsed(txCost.estimatedPredicates);
    request.gasLimit = txCost.gasUsed;
    request.maxFee = txCost.maxFee;

    await signer.fund(request, txCost);

    request.addWitness(messageSignature);
    request.addWitness(messageHash);

    const maxGasUsed = await getMaxPredicateGasUsed(provider);
    (request.inputs[0] as CoinTransactionRequestInput).predicateGasUsed = maxGasUsed;

    const res = await signer.sendTransaction(request, { estimateTxDependencies: false });
    await res.waitForResult();

    const finalBalance = await receiver.getBalance(assetId);
    expect(finalBalance.toNumber()).toBe(initialBalance.toNumber() + amountToReceiver);
  });
});
