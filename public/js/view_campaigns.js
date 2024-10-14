const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1"; // Aptos Devnet API URL

// Function to check if the wallet is connected
async function checkWalletConnection() {
    if (!window.aptos) {
        alert("Please install and connect your Aptos wallet.");
        return false;
    }

    try {
        const account = await window.aptos.account();
        return account.address ? account.address : false;
    } catch (error) {
        console.error("Wallet not connected:", error);
        return false;
    }
}

// Function to connect the wallet
async function connectWallet() {
    try {
        const response = await window.aptos.connect();
        if (response.address) {
            document.getElementById('wallet-address').innerText = `Wallet Address: ${response.address}`;
            document.getElementById('connect-wallet').style.display = 'none'; // Hide connect button
            fetchCampaigns(response.address); // Fetch campaigns after connection
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
    }
}

// Function to fetch campaigns using direct API calls
// Helper function to convert hex to string
function hexToString(hex) {
    try {
        // Remove the '0x' prefix if it exists
        hex = hex.startsWith("0x") ? hex.slice(2) : hex;
        
        // Convert the hex string to a readable string
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    } catch (error) {
        console.error("Error converting hex to string:", error);
        return hex; // Return the original hex if conversion fails
    }
}

// Function to fetch campaigns using direct API calls
// Function to fetch campaigns using direct API calls
async function fetchCampaigns(walletAddress) {
    try {
        const response = await fetch(`${NODE_URL}/accounts/${walletAddress}/resources`);
        const resources = await response.json();

        // Log all resources to understand their structure
        console.log('Account Resources:', resources);

        // Find the specific resource holding campaigns
        const campaignResource = resources.find(resource => 
            resource.type === '0xa8b10ab4bf87b830aa1d6cc7c3e40825f28c0a8eb44ba3b1b2ce64e7fd79eaff::CrowdFunding3::Campaigns'
        );

        if (campaignResource) {
            const campaigns = campaignResource.data.campaigns; // Assuming campaigns is an array

            // Get the most recent campaign (first one in the array)
            const recentCampaign = campaigns[0];

            // Display campaigns
            document.querySelector('.campaign-container').innerHTML = campaigns.map((campaign, index) => {
                // Check if the campaign is successfully completed
                const amountRaised = campaign.current_amount || 0;
                const isCompleted = amountRaised >= campaign.goal_amount;

                // If it's the most recent campaign, display it in green
                if (index === 0) {
                    if (isCompleted) {
                        // Show "Successfully Completed" if the goal is reached
                        return `
                            <div class="campaign-card recent-campaign completed-campaign">
                                <h3>Campaign: ${hexToString(campaign.name)}</h3>
                                <p>Description: ${hexToString(campaign.description)}</p>
                                <p>Goal Amount: ${campaign.goal_amount} Aptos</p>
                                <p>Amount Raised: ${amountRaised} Aptos</p>
                                <p class="completed-text">Successfully Completed</p>
                            </div>
                        `;
                    } else {
                        // Show the contribute button if the campaign is still running
                        return `
                            <div class="campaign-card recent-campaign">
                                <h3>Campaign: ${hexToString(campaign.name)}</h3>
                                <p>Description: ${hexToString(campaign.description)}</p>
                                <p>Goal Amount: ${campaign.goal_amount} Aptos</p>
                                <p>Amount Raised: ${amountRaised} Aptos</p>
                                <button class="button" onclick="openContributionPopup('${campaign.id}')">Contribute</button>
                            </div>
                        `;
                    }
                } else {
                    // For older campaigns, show them in red without the contribute button
                    return `
                        <div class="campaign-card expired-campaign">
                            <h3>Campaign: ${campaign.name}</h3>
                            <p>Description: ${campaign.description}</p>
                            <p>Goal Amount: ${campaign.goal_amount} Aptos</p>
                            <p>Amount Raised: ${campaign.amount_raised} Aptos</p>
                            ${isCompleted ? '<p class="completed-text">Successfully Completed</p>' : '<p style="color:red;">This campaign is expired.</p>'}
                        </div>
                    `;
                }
            }).join('');
        } else {
            document.querySelector('.campaign-container').innerHTML = '<p>No campaigns found for this wallet address.</p>';
        }
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        document.querySelector('.campaign-container').innerHTML = '<p>Error fetching campaigns.</p>';
    }
}


// Function to open the contribution pop-up
function openContributionPopup(campaignId) {
    document.querySelector('.popup').style.display = 'flex'; // Show the popup
    const contributeButton = document.getElementById('confirm-contribution');

    // Handle contribution submission
    contributeButton.onclick = async () => {
        const amount = document.getElementById('contribution-amount').value;
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        await contributeToCampaign(campaignId, amount);
        document.querySelector('.popup').style.display = 'none'; // Hide the popup after contribution
    };
}

// Function to contribute to the campaign
async function contributeToCampaign(campaignId, amount) {
    const walletAddress = await window.aptos.account(); // Fetch the connected wallet address
//console.log(walletAddress.address);
    //Construct the payload for the contribution transaction
    const payload = {
        type: "entry_function_payload",
        function: '0xa8b10ab4bf87b830aa1d6cc7c3e40825f28c0a8eb44ba3b1b2ce64e7fd79eaff::CrowdFunding3::contribute', // Your actual contribution function
        arguments: [walletAddress.address, amount], // Arguments for your function
        type_arguments: []
    };

    try {
        const response = await window.aptos.signAndSubmitTransaction(payload);
        alert("Contribution successful!");
        fetchCampaigns(walletAddress); // Refresh campaigns
    } catch (error) {
        console.error("Error contributing to campaign:", error);
        alert("Contribution failed. Please try again.");
    }
}

// Event listener for connecting the wallet
document.getElementById('connect-wallet').addEventListener('click', connectWallet);

// Check wallet connection when the page loads
window.addEventListener('load', async () => {
    const walletAddress = await checkWalletConnection();
    if (walletAddress) {
        fetchCampaigns(walletAddress);
    } else {
        document.getElementById('connect-wallet').style.display = 'block'; // Show connect button
    }
});
