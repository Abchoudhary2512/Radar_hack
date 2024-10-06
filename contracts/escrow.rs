#![cfg_attr(not(feature = "std"), no_std)]

use ink::prelude::*;
use ink::env;

#[ink::contract]
mod escrow {
    #[ink(storage)]
    pub struct Escrow {
        arbiter: AccountId,
        beneficiary: AccountId,
        depositor: AccountId,
        is_approved: bool,
    }

    #[ink(event)]
    pub struct Approved {
        #[ink(topic)]
        balance: Balance,
    }

    impl Escrow {
        /// Constructor that initializes the contract with arbiter and beneficiary
        #[ink(constructor, payable)]
        pub fn new(arbiter: AccountId, beneficiary: AccountId) -> Self {
            let depositor = Self::env().caller();
            Self {
                arbiter,
                beneficiary,
                depositor,
                is_approved: false,
            }
        }

        /// Function to approve and send the balance to the beneficiary
        #[ink(message)]
        pub fn approve(&mut self) -> Result<(), &'static str> {
            // Ensure the caller is the arbiter
            let caller = self.env().caller();
            if caller != self.arbiter {
                return Err("Only arbiter can approve");
            }

            // Get the contract's balance
            let balance = self.env().balance();

            // Transfer funds to the beneficiary
            self.env().transfer(self.beneficiary, balance).map_err(|_| "Failed to send funds")?;

            // Emit an event when funds are approved and transferred
            self.env().emit_event(Approved { balance });

            // Mark the contract as approved
            self.is_approved = true;

            Ok(())
        }

        /// Get the arbiter address
        #[ink(message)]
        pub fn get_arbiter(&self) -> AccountId {
            self.arbiter
        }

        /// Get the beneficiary address
        #[ink(message)]
        pub fn get_beneficiary(&self) -> AccountId {
            self.beneficiary
        }

        /// Get the depositor address
        #[ink(message)]
        pub fn get_depositor(&self) -> AccountId {
            self.depositor
        }

        /// Check if the escrow is approved
        #[ink(message)]
        pub fn is_approved(&self) -> bool {
            self.is_approved
        }
    }
}
