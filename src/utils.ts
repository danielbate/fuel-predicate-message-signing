import { BN, bn, Provider, ScriptTransactionRequest, sha256, Wallet, ZeroBytes32 } from "fuels";
import { TestPredicate as PredicateSigning } from "./sway-api";

export const getMaxPredicateGasUsed = async (provider: Provider): Promise<BN> => {
    const fakeAccount = Wallet.generate({ provider });
    const chainId = provider.getChainId();
    const fakePredicate = new PredicateSigning({
      provider,
      data: [fakeAccount.address.toB256()],
    });

    const request = new ScriptTransactionRequest();
    request.addCoinInput({
      id: ZeroBytes32,
      assetId: ZeroBytes32,
      amount: bn(),
      owner: fakePredicate.address,
      blockCreated: bn(),
      txCreatedIdx: bn(),
    });
    fakePredicate.populateTransactionPredicateData(request);

    const txId = request.getTransactionId(chainId);
    const signature = await fakeAccount.signMessage(txId);
    const messageSignature = await fakeAccount.signMessage(txId);
    const messageHash = sha256(Buffer.from(txId));

    request.witnesses = [signature, '0x', messageSignature, messageHash];
    await fakePredicate.provider.estimatePredicates(request);

    const predicateInput = request.inputs[0];
    
    if (predicateInput && 'predicate' in predicateInput) {
      return bn(predicateInput.predicateGasUsed);
    }
    return bn();
  };