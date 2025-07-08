#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod wcv_token {
    use ink::storage::traits::StorageLayout;
    use scale_info::TypeInfo;

    #[ink(storage)]
    #[derive(Debug, TypeInfo, StorageLayout)]
    pub struct WCVToken {
        /// Total supply of tokens
        total_supply: Balance,
        /// Mapping from account to balance
        balances: ink::storage::Mapping<AccountId, Balance>,
        /// Mapping from account to allowance
        allowances: ink::storage::Mapping<(AccountId, AccountId), Balance>,
        /// Owner of the contract
        owner: AccountId,
        /// Mapping of authorized minters
        minters: ink::storage::Mapping<AccountId, bool>,
        /// Mapping of authorized burners
        burners: ink::storage::Mapping<AccountId, bool>,
        /// Bridge contract address
        bridge_contract: Option<AccountId>,
        /// Maximum transfer amount
        max_transfer_amount: Balance,
        /// Daily transfer limit
        daily_transfer_limit: Balance,
        /// Daily transfers per account
        daily_transfers: ink::storage::Mapping<AccountId, Balance>,
        /// Last transfer day per account
        last_transfer_day: ink::storage::Mapping<AccountId, u64>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        InsufficientBalance,
        InsufficientAllowance,
        NotAuthorized,
        TransferLimitExceeded,
        DailyLimitExceeded,
        InvalidAmount,
        InvalidAddress,
        TransferAlreadyProcessed,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(event)]
    #[derive(Debug)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: Balance,
    }

    #[ink(event)]
    #[derive(Debug)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        value: Balance,
    }

    #[ink(event)]
    #[derive(Debug)]
    pub struct TokensMinted {
        #[ink(topic)]
        to: AccountId,
        amount: Balance,
        reason: String,
    }

    #[ink(event)]
    #[derive(Debug)]
    pub struct TokensBurned {
        #[ink(topic)]
        from: AccountId,
        amount: Balance,
        reason: String,
    }

    #[ink(event)]
    #[derive(Debug)]
    pub struct BridgeTransfer {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        amount: Balance,
        source_chain: String,
    }

    impl WCVToken {
        /// Creates a new WCV token contract
        #[ink(constructor)]
        pub fn new() -> Self {
            let owner = Self::env().caller();
            let total_supply = 30_000_000_000; // 30M WCV with 3 decimals
            
            let mut instance = Self {
                total_supply,
                balances: ink::storage::Mapping::default(),
                allowances: ink::storage::Mapping::default(),
                owner,
                minters: ink::storage::Mapping::default(),
                burners: ink::storage::Mapping::default(),
                bridge_contract: None,
                max_transfer_amount: 1_000_000_000, // 1M WCV
                daily_transfer_limit: 10_000_000_000, // 10M WCV
                daily_transfers: ink::storage::Mapping::default(),
                last_transfer_day: ink::storage::Mapping::default(),
            };
            
            // Set initial balance for owner
            instance.balances.insert(owner, &total_supply);
            
            // Set owner as minter and burner
            instance.minters.insert(owner, &true);
            instance.burners.insert(owner, &true);
            
            // Emit initial mint event
            Self::env().emit_event(TokensMinted {
                to: owner,
                amount: total_supply,
                reason: "Initial distribution".to_string(),
            });
            
            instance
        }

        /// Returns the total supply of tokens
        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }

        /// Returns the balance of the specified account
        #[ink(message)]
        pub fn balance_of(&self, account: AccountId) -> Balance {
            self.balances.get(account).unwrap_or(0)
        }

        /// Transfers tokens from the caller to the specified account
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: Balance) -> Result<()> {
            let from = self.env().caller();
            self._transfer(from, to, value)
        }

        /// Transfers tokens from one account to another using allowance
        #[ink(message)]
        pub fn transfer_from(&mut self, from: AccountId, to: AccountId, value: Balance) -> Result<()> {
            let caller = self.env().caller();
            let allowance = self.allowances.get((from, caller)).unwrap_or(0);
            
            if allowance < value {
                return Err(Error::InsufficientAllowance);
            }
            
            self.allowances.insert((from, caller), &(allowance - value));
            self._transfer(from, to, value)
        }

        /// Approves the specified account to spend tokens on behalf of the caller
        #[ink(message)]
        pub fn approve(&mut self, spender: AccountId, value: Balance) -> Result<()> {
            let owner = self.env().caller();
            self.allowances.insert((owner, spender), &value);
            
            Self::env().emit_event(Approval {
                owner,
                spender,
                value,
            });
            
            Ok(())
        }

        /// Returns the allowance given to spender by owner
        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowances.get((owner, spender)).unwrap_or(0)
        }

        /// Mints new tokens (only authorized minters)
        #[ink(message)]
        pub fn mint(&mut self, to: AccountId, amount: Balance, reason: String) -> Result<()> {
            let caller = self.env().caller();
            
            if !self.minters.get(caller).unwrap_or(false) && caller != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            if to == AccountId::from([0u8; 32]) {
                return Err(Error::InvalidAddress);
            }
            
            if amount == 0 {
                return Err(Error::InvalidAmount);
            }
            
            let current_balance = self.balances.get(to).unwrap_or(0);
            self.balances.insert(to, &(current_balance + amount));
            self.total_supply += amount;
            
            Self::env().emit_event(TokensMinted {
                to,
                amount,
                reason,
            });
            
            Ok(())
        }

        /// Burns tokens (only authorized burners)
        #[ink(message)]
        pub fn burn(&mut self, from: AccountId, amount: Balance, reason: String) -> Result<()> {
            let caller = self.env().caller();
            
            if !self.burners.get(caller).unwrap_or(false) && caller != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            if from == AccountId::from([0u8; 32]) {
                return Err(Error::InvalidAddress);
            }
            
            if amount == 0 {
                return Err(Error::InvalidAmount);
            }
            
            let current_balance = self.balances.get(from).unwrap_or(0);
            if current_balance < amount {
                return Err(Error::InsufficientBalance);
            }
            
            self.balances.insert(from, &(current_balance - amount));
            self.total_supply -= amount;
            
            Self::env().emit_event(TokensBurned {
                from,
                amount,
                reason,
            });
            
            Ok(())
        }

        /// Bridge transfer (only bridge operators)
        #[ink(message)]
        pub fn bridge_transfer(&mut self, from: AccountId, to: AccountId, amount: Balance, source_chain: String) -> Result<()> {
            let caller = self.env().caller();
            
            if !self.burners.get(caller).unwrap_or(false) && 
               caller != self.owner && 
               Some(caller) != self.bridge_contract {
                return Err(Error::NotAuthorized);
            }
            
            self._transfer(from, to, amount)?;
            
            Self::env().emit_event(BridgeTransfer {
                from,
                to,
                amount,
                source_chain,
            });
            
            Ok(())
        }

        /// Add minter (only owner)
        #[ink(message)]
        pub fn add_minter(&mut self, minter: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            if minter == AccountId::from([0u8; 32]) {
                return Err(Error::InvalidAddress);
            }
            
            self.minters.insert(minter, &true);
            Ok(())
        }

        /// Remove minter (only owner)
        #[ink(message)]
        pub fn remove_minter(&mut self, minter: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            self.minters.insert(minter, &false);
            Ok(())
        }

        /// Add burner (only owner)
        #[ink(message)]
        pub fn add_burner(&mut self, burner: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            if burner == AccountId::from([0u8; 32]) {
                return Err(Error::InvalidAddress);
            }
            
            self.burners.insert(burner, &true);
            Ok(())
        }

        /// Remove burner (only owner)
        #[ink(message)]
        pub fn remove_burner(&mut self, burner: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            self.burners.insert(burner, &false);
            Ok(())
        }

        /// Set bridge contract (only owner)
        #[ink(message)]
        pub fn set_bridge_contract(&mut self, bridge: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            if bridge == AccountId::from([0u8; 32]) {
                return Err(Error::InvalidAddress);
            }
            
            self.bridge_contract = Some(bridge);
            self.burners.insert(bridge, &true);
            Ok(())
        }

        /// Set transfer limits (only owner)
        #[ink(message)]
        pub fn set_transfer_limits(&mut self, max_transfer: Balance, daily_limit: Balance) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotAuthorized);
            }
            
            if max_transfer == 0 || daily_limit == 0 {
                return Err(Error::InvalidAmount);
            }
            
            self.max_transfer_amount = max_transfer;
            self.daily_transfer_limit = daily_limit;
            Ok(())
        }

        /// Get token statistics
        #[ink(message)]
        pub fn get_token_stats(&self) -> (Balance, Balance, Balance, Balance, Balance) {
            (
                self.total_supply,
                self.total_supply, // circulating supply (same as total for now)
                0, // burned supply
                self.max_transfer_amount,
                self.daily_transfer_limit,
            )
        }

        /// Internal transfer function
        fn _transfer(&mut self, from: AccountId, to: AccountId, value: Balance) -> Result<()> {
            if value > self.max_transfer_amount {
                return Err(Error::TransferLimitExceeded);
            }
            
            if !self._check_daily_limit(from, value) {
                return Err(Error::DailyLimitExceeded);
            }
            
            let from_balance = self.balances.get(from).unwrap_or(0);
            if from_balance < value {
                return Err(Error::InsufficientBalance);
            }
            
            self.balances.insert(from, &(from_balance - value));
            
            let to_balance = self.balances.get(to).unwrap_or(0);
            self.balances.insert(to, &(to_balance + value));
            
            self._update_daily_transfer(from, value);
            
            Self::env().emit_event(Transfer {
                from: Some(from),
                to: Some(to),
                value,
            });
            
            Ok(())
        }

        /// Check daily transfer limit
        fn _check_daily_limit(&self, account: AccountId, amount: Balance) -> bool {
            let today = self.env().block_timestamp() / (24 * 60 * 60 * 1000); // days
            let last_day = self.last_transfer_day.get(account).unwrap_or(0);
            
            if last_day != today {
                return amount <= self.daily_transfer_limit;
            }
            
            let daily_transfers = self.daily_transfers.get(account).unwrap_or(0);
            daily_transfers + amount <= self.daily_transfer_limit
        }

        /// Update daily transfer count
        fn _update_daily_transfer(&mut self, account: AccountId, amount: Balance) {
            let today = self.env().block_timestamp() / (24 * 60 * 60 * 1000); // days
            let last_day = self.last_transfer_day.get(account).unwrap_or(0);
            
            if last_day != today {
                self.daily_transfers.insert(account, &amount);
                self.last_transfer_day.insert(account, &today);
            } else {
                let daily_transfers = self.daily_transfers.get(account).unwrap_or(0);
                self.daily_transfers.insert(account, &(daily_transfers + amount));
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let contract = WCVToken::new();
            assert_eq!(contract.total_supply(), 30_000_000_000);
        }

        #[ink::test]
        fn transfer_works() {
            let mut contract = WCVToken::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            assert_eq!(contract.balance_of(accounts.alice), 30_000_000_000);
            assert_eq!(contract.balance_of(accounts.bob), 0);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert!(contract.transfer(accounts.bob, 1000).is_ok());
            
            assert_eq!(contract.balance_of(accounts.alice), 30_000_000_000 - 1000);
            assert_eq!(contract.balance_of(accounts.bob), 1000);
        }

        #[ink::test]
        fn mint_works() {
            let mut contract = WCVToken::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert!(contract.mint(accounts.bob, 1000, "Test".to_string()).is_ok());
            
            assert_eq!(contract.balance_of(accounts.bob), 1000);
            assert_eq!(contract.total_supply(), 30_000_000_000 + 1000);
        }
    }
} 