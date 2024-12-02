function convertImage() {
    const imageFile = document.getElementById('imageUpload').files[0];
    const outputElement = document.getElementById('output');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');

    // Check if an image file is uploaded
    if (!imageFile) {
        alert("Please upload an image first.");
        return;
    }

    // Reset output and progress bar
    outputElement.innerText = "";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    // Create a FileReader to read the image file
    const reader = new FileReader();
    reader.onload = () => {
        // Perform OCR using Tesseract.js
        Tesseract.recognize(
            reader.result, // Image data URL
            'eng', // Language for OCR (English)
            {
                logger: (progress) => {
                    if (progress.status === 'recognizing text') {
                        const percent = Math.round(progress.progress * 100);
                        progressBar.style.width = `${percent}%`;
                        progressBar.innerText = `${percent}%`;
                    }
                },
            }
        )
        .then(({ data: { text } }) => {
            progressContainer.style.display = "none"; // Hide progress bar
            if (text.trim()) {
                outputElement.innerText = text; // Display the extracted text
            } else {
                outputElement.innerText = "No text found in the image.";
            }
        })
        .catch((err) => {
            progressContainer.style.display = "none"; // Hide progress bar
            console.error(err);
            outputElement.innerText = "Error extracting text. Please try again.";
        });
    };

    reader.onerror = () => {
        progressContainer.style.display = "none"; // Hide progress bar
        console.error("Error reading file.");
        outputElement.innerText = "Failed to process the image. Please try again.";
    };

    reader.readAsDataURL(imageFile); // Start reading the file
}