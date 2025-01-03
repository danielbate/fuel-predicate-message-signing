/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.97.2
  Forc version: 0.66.5
  Fuel-Core version: 0.40.1
*/

import {
  BigNumberish,
  BN,
  decompressBytecode,
  InputValue,
  Predicate,
  PredicateParams,
  Provider,
} from 'fuels';

export type TestPredicateLoaderConfigurables = undefined;

export type TestPredicateLoaderInputs = [signer: string, witness_index: BigNumberish];

export type TestPredicateLoaderParameters = Omit<
  PredicateParams<TestPredicateLoaderInputs, TestPredicateLoaderConfigurables>,
  'abi' | 'bytecode'
>;

const abi = {
  "programType": "predicate",
  "specVersion": "1",
  "encodingVersion": "1",
  "concreteTypes": [
    {
      "type": "b256",
      "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
    },
    {
      "type": "bool",
      "concreteTypeId": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903"
    },
    {
      "type": "u64",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "metadataTypes": [],
  "functions": [
    {
      "inputs": [
        {
          "name": "signer",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        },
        {
          "name": "witness_index",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "name": "main",
      "output": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
      "attributes": null
    }
  ],
  "loggedTypes": [],
  "messagesTypes": [],
  "configurables": []
};

const bytecode = decompressBytecode('H4sIAAAAAAAAA5NyMGAIcGQwkHIJYNjlycBg5MDSCOQrxALZQJoDyG9ScBVmCHIVYPFyYWDgPVds6bzk/u/GH9eUQz623b5w3CU1JJnX/cC07ImiBy9WMUCAA5TGCc6AAQMThMcHNBlM60Bo9hUAOuFItpgAAAA=');

export class TestPredicateLoader extends Predicate<
  TestPredicateLoaderInputs,
  TestPredicateLoaderConfigurables
> {
  static readonly abi = abi;
  static readonly bytecode = bytecode;

  constructor(params: TestPredicateLoaderParameters) {
    super({ abi, bytecode, ...params });
  }
}
