// Define an array of texts
const texts = [
    "Text 1",
    "Text 2",
    "Text 3",
    "Text 4",
    "Text 5"
];

// Function to select and display a random text
function displayRandomText() {
    // Get a random index within the range of the array
    const randomIndex = Math.floor(Math.random() * texts.length);

    // Get the random text from the array
    const randomText = texts[randomIndex];

    // Display the random text in the HTML element with the id "randomText"
    document.getElementById("randomText").textContent = randomText;
}

// Call the function when the page loads
window.addEventListener("load", displayRandomText);
