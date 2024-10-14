let walletAddress = null;  // Variable to store the connected wallet address

// Function to check the wallet connection and connect if not already connected
async function checkWalletConnection() {
    try {
        if (!walletAddress) {
            const response = await window.aptos.connect();  // Prompt wallet connection
            walletAddress = response.address;
            console.log("Wallet connected successfully: ", walletAddress);
        }
    } catch (err) {
        console.error("Error connecting to wallet: ", err);
        alert("Failed to connect wallet. Please ensure your Aptos wallet is installed.");
        throw err;  // Prevent further execution if wallet connection fails
    }
}

// Function to create a campaign on the Aptos blockchain using Aptos Wallet
async function createCampaignOnBlockchain(campaignName, description, goalAmount, category) {
    try {
        await checkWalletConnection();  // Ensure the wallet is connected

        // Construct the transaction payload for creating a campaign
        const payload = {
            type: "entry_function_payload",
            function: "0xa8b10ab4bf87b830aa1d6cc7c3e40825f28c0a8eb44ba3b1b2ce64e7fd79eaff::CrowdFunding3::create_campaign",
            type_arguments: [],
            arguments: [
                Array.from(new TextEncoder().encode(campaignName)),  // Convert name to bytes
                Array.from(new TextEncoder().encode(description)),  // Convert description to bytes
                goalAmount,                                         // Campaign goal amount (u64)
                category                                            // Category (u8)
            ]
        };

        console.log("Prepared transaction payload: ", payload);

        // Use signAndSubmitTransaction to handle both signing and submitting in one step
        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted: ", response);

        // Call Aptos API to check for transaction confirmation
        const transactionHash = response.hash;
        await checkTransactionStatus(transactionHash);

        alert("Campaign created successfully!");

    } catch (err) {
        console.error("Error during transaction: ", err);
        alert("Failed to create campaign. Please check the console for more details.");
    }
}

// Function to check the transaction status via Aptos API
async function checkTransactionStatus(txnHash) {
    try {
        const response = await fetch(`https://fullnode.devnet.aptoslabs.com/v1/transactions/by_hash/${txnHash}`);
        const result = await response.json();
        if (response.ok) {
            console.log("Transaction confirmed: ", result);
        } else {
            console.error("Transaction failed or not yet confirmed", result);
        }
    } catch (err) {
        console.error("Error fetching transaction status: ", err);
    }
}

// Handle form submission for creating a campaign
document.getElementById('campaignForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent the form from submitting traditionally

    // Retrieve form input values
    const campaignName = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const goalAmount = parseInt(document.getElementById('goal').value);  // Convert to a number
    const category = parseInt(document.getElementById('category').value);  // Convert to a number

    // Call the function to create the campaign on the blockchain
    await createCampaignOnBlockchain(campaignName, description, goalAmount, category);
});
