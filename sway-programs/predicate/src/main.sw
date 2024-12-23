predicate;

use std::{b512::B512, ecr::ec_recover_address, tx::{tx_id, tx_witness_data}};

fn main(signer: b256) -> bool {
    let witness_sig: B512 = tx_witness_data(1).unwrap();
    let witness_data: b256 = tx_witness_data(2).unwrap();
    let address: b256 = ec_recover_address(witness_sig, witness_data).unwrap().bits();
    return address == signer;
}
