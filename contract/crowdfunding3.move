module 0xa8b10ab4bf87b830aa1d6cc7c3e40825f28c0a8eb44ba3b1b2ce64e7fd79eaff::CrowdFunding3 {
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::signer;
    use aptos_framework::coin;
    use std::vector;

    /// Define categories for campaigns
    const RISING_SCHOLARS: u8 = 1;
    const EMERGING_LEADERS: u8 = 2;
    const FUTURE_PIONEERS: u8 = 3;

    /// A campaign with more detailed information
    struct Campaign has store, key {
        name: vector<u8>,           // Campaign name
        creator: address,           // Creator's address
        description: vector<u8>,    // Small description
        goal_amount: u64,           // Goal amount to be raised
        current_amount: u64,        // Current amount raised
        active: bool,               // Whether the campaign is active
        category: u8,               // Campaign category (1: Rising Scholars, 2: Emerging Leaders, 3: Future Pioneers)
    }

    /// Resource that holds all campaigns for an account
    struct Campaigns has key {
        campaigns: vector<Campaign>,
    }

    /// Initialize a campaign for an account with detailed info
    public entry fun create_campaign(
        account: &signer, 
        name: vector<u8>, 
        description: vector<u8>, 
        goal_amount: u64, 
        category: u8
    ) acquires Campaigns {
        let addr = signer::address_of(account);
        
        // Ensure valid category is chosen
        assert!(category == RISING_SCHOLARS || category == EMERGING_LEADERS || category == FUTURE_PIONEERS, 400);

        // If Campaigns resource doesn't exist for the account, create it
        if (!exists<Campaigns>(addr)) {
            move_to(account, Campaigns {
                campaigns: vector::empty<Campaign>(),
            });
        };

        // Add a new campaign with detailed info to the account
        let campaigns = borrow_global_mut<Campaigns>(addr);
        vector::push_back(&mut campaigns.campaigns, Campaign {
            name,
            creator: addr,
            description,
            goal_amount,
            current_amount: 0,
            active: true,
            category,
        });
    }

    /// View details of the first campaign of an account with the new fields
    public fun view_campaign(addr: address): (vector<u8>, address, vector<u8>, u64, u64, bool, u8) acquires Campaigns {
    if (!exists<Campaigns>(addr)) {
        return (b"", @0x1, b"", 0, 0, false, 0) // No campaign found
    };

    let campaigns = borrow_global<Campaigns>(addr);
    let campaign = vector::borrow(&campaigns.campaigns, 0);
    (campaign.name, addr, campaign.description, campaign.goal_amount, campaign.current_amount, campaign.active, campaign.category)
}

    /// Contribute to a campaign
    public entry fun contribute(account: &signer, campaign_owner: address, amount: u64) acquires Campaigns {
        // Transfer the AptosCoins from the contributor's account to the campaign owner's account
        coin::transfer<AptosCoin>(account, campaign_owner, amount);

        // Ensure the campaign exists and is active
        if (!exists<Campaigns>(campaign_owner)) {
            abort 404; // Campaign does not exist
        };

        let campaigns = borrow_global_mut<Campaigns>(campaign_owner);
        let campaign = vector::borrow_mut(&mut campaigns.campaigns, 0); // Assuming only one campaign for simplicity
        assert!(campaign.active, 403); // Campaign must be active to contribute

        // Update the campaign's current amount
        campaign.current_amount = campaign.current_amount + amount;

        // Mark the campaign as inactive if the goal is met
        if (campaign.current_amount >= campaign.goal_amount) {
            campaign.active = false;
        };
    }
}
