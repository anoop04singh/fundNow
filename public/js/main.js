// Aptos SDK integration (assuming you have included the Aptos SDK in your index.html as shown before)
const { AptosClient } = window.aptos;

let walletAddress = null;  // Variable to store the connected wallet address

// Function to connect to Aptos Wallet
async function connectWallet() {
    try {
        // Connect to the Aptos Wallet
        const response = await window.aptos.connect();
        
        // Capture the connected wallet's address
        walletAddress = response.address;
        
        // Log the wallet address in the console (or show it in the UI)
        console.log("Wallet connected: ", walletAddress);
        alert(`Wallet connected: ${walletAddress}`);
        
        // Change the Connect Wallet text to "Connected"
        document.getElementById('connectWallet').innerText = 'Connected';
        
    } catch (err) {
        // Handle connection errors
        console.error("Error connecting to wallet: ", err);
        alert('Failed to connect wallet. Please make sure your wallet is installed.');
    }
}

// Function to check if the wallet is connected and proceed to campaign creation
function createCampaign() {
    if (walletAddress) {
        // Wallet is connected, navigate to campaign creation page
        window.location.href = '/create_campaign.html'; // Change this to your actual campaign creation page
    } else {
        // Wallet is not connected, prompt the user to connect their wallet
        alert('Please connect your wallet first.');
    }
}

// Attach event listener to "Connect Wallet" link
document.getElementById('connectWallet').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the link from following its href
    
    connectWallet(); // Call the wallet connection function
});

// Attach event listener to "Create Campaign" button
document.getElementById('createCampaign').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior

    createCampaign(); // Check wallet connection and navigate to campaign creation
});
