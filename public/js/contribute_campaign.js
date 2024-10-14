// Ensure the Aptos SDK is loaded (included in the contribute_campaign.html via a <script> tag)
const { AptosClient } = window.aptos;

let walletAddress = null; // Variable to store the connected wallet address

// Function to connect the wallet if not connected
async function checkWalletConnection() {
    if (!walletAddress) {
        try {
            const response = await window.aptos.connect();
            walletAddress = response.address;
            console.log("Wallet connected: ", walletAddress);
        } catch (err) {
            console.error("Error connecting to wallet: ", err);
            alert("Please connect your Aptos wallet to contribute.");
            throw err; // Stop execution if wallet is not connected
        }
    }
}

// Function to contribute to a campaign
async function contributeToCampaign(campaignOwnerAddress, contributionAmount) {
    try {
        await checkWalletConnection(); // Ensure the wallet is connected

        // Convert the contribution amount to u64 (Aptos expects integers)
        const amountInMicroAptos = contributionAmount * 1e6; // Aptos uses microAptos (1 Aptos = 1e6 microAptos)

        // Prepare the payload for contributing to the campaign
        const payload = {
            type: "entry_function_payload",
            function: "0xa8b10ab4bf87b830aa1d6cc7c3e40825f28c0a8eb44ba3b1b2ce64e7fd79eaff::CrowdFunding3::contribute",
            type_arguments: [],
            arguments: [
                campaignOwnerAddress, // Address of the campaign owner
                amountInMicroAptos // Amount to contribute (in microAptos)
            ]
        };

        // Sign and submit the transaction
        const transaction = await window.aptos.signTransaction(payload);

        // Submit the signed transaction
        const response = await window.aptos.submitTransaction(transaction);

        // Wait for the transaction result
        const result = await window.aptos.waitForTransaction(response.hash);
        console.log("Transaction successful: ", result);
        document.getElementById('result').innerText = "Contribution successful!";
        
    } catch (err) {
        console.error("Error contributing to campaign: ", err);
        document.getElementById('result').innerText = "Failed to contribute. Please try again.";
    }
}

// Handle form submission
document.getElementById('contributionForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission

    // Get the form data
    const campaignOwner = document.getElementById('campaignOwner').value;
    const amount = parseFloat(document.getElementById('amount').value); // Convert amount to float

    // Call the function to contribute to the campaign
    await contributeToCampaign(campaignOwner, amount);
});
