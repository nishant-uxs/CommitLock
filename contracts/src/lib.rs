#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec, symbol_short,
};

#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
pub enum ReservationStatus {
    Open = 0,
    Booked = 1,
    Completed = 2,
    NoShow = 3,
}

#[derive(Clone)]
#[contracttype]
pub struct Reservation {
    pub id: u64,
    pub host: Address,
    pub guest: Option<Address>,
    pub title: String,
    pub description: String,
    pub deposit: i128,
    pub timestamp: u64,
    pub status: ReservationStatus,
}

#[contracttype]
pub enum DataKey {
    ReservationCounter,
    Reservation(u64),
    ReservationList,
    TokenAddress,
}

#[contract]
pub struct CommitLockContract;

#[contractimpl]
impl CommitLockContract {
    pub fn initialize(env: Env, token_address: Address) {
        if env.storage().instance().has(&DataKey::ReservationCounter) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&DataKey::ReservationCounter, &0u64);
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
        let empty_list: Vec<u64> = Vec::new(&env);
        env.storage().instance().set(&DataKey::ReservationList, &empty_list);
    }

    pub fn create_reservation(
        env: Env,
        host: Address,
        title: String,
        description: String,
        timestamp: u64,
        deposit: i128,
    ) -> u64 {
        host.require_auth();

        if deposit <= 0 {
            panic!("Deposit must be greater than 0");
        }

        if timestamp <= env.ledger().timestamp() {
            panic!("Timestamp must be in the future");
        }

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ReservationCounter)
            .unwrap_or(0);
        
        counter += 1;

        let reservation = Reservation {
            id: counter,
            host: host.clone(),
            guest: None,
            title: title.clone(),
            description: description.clone(),
            deposit,
            timestamp,
            status: ReservationStatus::Open,
        };

        env.storage()
            .instance()
            .set(&DataKey::Reservation(counter), &reservation);
        env.storage()
            .instance()
            .set(&DataKey::ReservationCounter, &counter);

        let mut reservation_list: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ReservationList)
            .unwrap_or(Vec::new(&env));
        reservation_list.push_back(counter);
        env.storage()
            .instance()
            .set(&DataKey::ReservationList, &reservation_list);

        env.events().publish(
            (symbol_short!("created"), counter),
            (host, title, deposit, timestamp),
        );

        counter
    }

    pub fn book_reservation(env: Env, reservation_id: u64, guest: Address) {
        guest.require_auth();

        let mut reservation: Reservation = env
            .storage()
            .instance()
            .get(&DataKey::Reservation(reservation_id))
            .expect("Reservation not found");

        if reservation.status != ReservationStatus::Open {
            panic!("Reservation is not open for booking");
        }

        if reservation.timestamp <= env.ledger().timestamp() {
            panic!("Reservation time has passed");
        }

        // Transfer deposit from guest to contract (escrow)
        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .expect("Token not configured");
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&guest, &env.current_contract_address(), &reservation.deposit);

        reservation.guest = Some(guest.clone());
        reservation.status = ReservationStatus::Booked;

        env.storage()
            .instance()
            .set(&DataKey::Reservation(reservation_id), &reservation);

        env.events().publish(
            (symbol_short!("booked"), reservation_id),
            (guest, reservation.deposit),
        );
    }

    pub fn confirm_attendance(env: Env, reservation_id: u64, host: Address, attended: bool) {
        host.require_auth();

        let mut reservation: Reservation = env
            .storage()
            .instance()
            .get(&DataKey::Reservation(reservation_id))
            .expect("Reservation not found");

        if reservation.host != host {
            panic!("Only the host can confirm attendance");
        }

        if reservation.status != ReservationStatus::Booked {
            panic!("Reservation is not in booked status");
        }

        if reservation.timestamp > env.ledger().timestamp() {
            panic!("Cannot confirm before reservation time");
        }

        let guest = reservation.guest.clone().expect("No guest found");

        // Get token client for transfer
        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .expect("Token not configured");
        let token_client = token::Client::new(&env, &token_address);

        if attended {
            // Guest attended - refund deposit back to guest
            reservation.status = ReservationStatus::Completed;
            token_client.transfer(&env.current_contract_address(), &guest, &reservation.deposit);

            env.events().publish(
                (symbol_short!("refund"), reservation_id),
                (guest, reservation.deposit),
            );
        } else {
            // No-show - transfer deposit to host
            reservation.status = ReservationStatus::NoShow;
            token_client.transfer(&env.current_contract_address(), &reservation.host, &reservation.deposit);

            env.events().publish(
                (symbol_short!("claim"), reservation_id),
                (reservation.host.clone(), reservation.deposit),
            );
        }

        env.storage()
            .instance()
            .set(&DataKey::Reservation(reservation_id), &reservation);
    }

    pub fn get_reservation(env: Env, reservation_id: u64) -> Option<Reservation> {
        env.storage()
            .instance()
            .get(&DataKey::Reservation(reservation_id))
    }

    pub fn get_all_reservations(env: Env) -> Vec<Reservation> {
        let reservation_list: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ReservationList)
            .unwrap_or(Vec::new(&env));

        let mut reservations = Vec::new(&env);
        for id in reservation_list.iter() {
            if let Some(reservation) = env
                .storage()
                .instance()
                .get::<DataKey, Reservation>(&DataKey::Reservation(id))
            {
                reservations.push_back(reservation);
            }
        }
        reservations
    }

    pub fn get_user_bookings(env: Env, user: Address) -> Vec<Reservation> {
        let reservation_list: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ReservationList)
            .unwrap_or(Vec::new(&env));

        let mut user_reservations = Vec::new(&env);
        for id in reservation_list.iter() {
            if let Some(reservation) = env
                .storage()
                .instance()
                .get::<DataKey, Reservation>(&DataKey::Reservation(id))
            {
                if reservation.host == user {
                    user_reservations.push_back(reservation);
                } else if let Some(guest) = &reservation.guest {
                    if guest == &user {
                        user_reservations.push_back(reservation);
                    }
                }
            }
        }
        user_reservations
    }

    pub fn get_reservation_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::ReservationCounter)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn setup_token(env: &Env) -> Address {
        // Use a dummy token address for tests that don't involve transfers
        Address::generate(env)
    }

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CommitLockContract);
        let client = CommitLockContractClient::new(&env, &contract_id);
        let token = setup_token(&env);

        client.initialize(&token);

        let count = client.get_reservation_count();
        assert_eq!(count, 0);
    }

    #[test]
    fn test_create_reservation() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, CommitLockContract);
        let client = CommitLockContractClient::new(&env, &contract_id);
        let token = setup_token(&env);

        client.initialize(&token);

        let host = Address::generate(&env);
        let title = String::from_str(&env, "Dinner Reservation");
        let description = String::from_str(&env, "Table for 2");
        let timestamp = env.ledger().timestamp() + 86400;
        let deposit = 1000000i128;

        let reservation_id = client.create_reservation(&host, &title, &description, &timestamp, &deposit);

        assert_eq!(reservation_id, 1);

        let reservation = client.get_reservation(&reservation_id).unwrap();
        assert_eq!(reservation.id, 1);
        assert_eq!(reservation.host, host);
        assert_eq!(reservation.deposit, deposit);
        assert_eq!(reservation.status, ReservationStatus::Open);
    }

    #[test]
    fn test_book_reservation_status() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, CommitLockContract);
        let client = CommitLockContractClient::new(&env, &contract_id);
        let token = setup_token(&env);

        client.initialize(&token);

        let host = Address::generate(&env);
        let title = String::from_str(&env, "Dinner Reservation");
        let description = String::from_str(&env, "Table for 2");
        let timestamp = env.ledger().timestamp() + 86400;
        let deposit = 1000000i128;

        let reservation_id = client.create_reservation(&host, &title, &description, &timestamp, &deposit);

        let reservation = client.get_reservation(&reservation_id).unwrap();
        assert_eq!(reservation.status, ReservationStatus::Open);
        assert_eq!(reservation.guest, None);
    }

    #[test]
    fn test_get_all_reservations() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, CommitLockContract);
        let client = CommitLockContractClient::new(&env, &contract_id);
        let token = setup_token(&env);

        client.initialize(&token);

        let host = Address::generate(&env);
        let title1 = String::from_str(&env, "Reservation 1");
        let title2 = String::from_str(&env, "Reservation 2");
        let description = String::from_str(&env, "Description");
        let timestamp = env.ledger().timestamp() + 86400;
        let deposit = 1000000i128;

        client.create_reservation(&host, &title1, &description, &timestamp, &deposit);
        client.create_reservation(&host, &title2, &description, &timestamp, &deposit);

        let reservations = client.get_all_reservations();
        assert_eq!(reservations.len(), 2);
    }
}
