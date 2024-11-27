// Dark Mode Toggle
function toggleTheme() {
    // Toggle dark mode class on the body
    document.body.classList.toggle('dark-mode');

    // Check if dark mode is enabled and store preference in localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeIcon.classList.replace(isDarkMode ? 'bi-brightness-high-fill' : 'bi-moon-fill', isDarkMode ? 'bi-moon-fill' : 'bi-brightness-high-fill');
}

// Function to load the theme based on localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');

    // If there's a saved theme, apply it
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.replace('bi-brightness-high-fill', 'bi-moon-fill');
    } else {
        document.body.classList.remove('dark-mode');
        themeIcon.classList.replace('bi-moon-fill', 'bi-brightness-high-fill');
    }
}

// Initialize theme on page load
window.onload = function() {
    loadTheme();
};

// Add event listener to the theme toggle button
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
themeToggleBtn.addEventListener('click', toggleTheme);

// Redirect to conversion page from landing page
function startConversion() {
    window.location.href = "conversion.html";
}
// Function to convert image to text
function convertImage() {
    const imageFile = document.getElementById('imageUpload').files[0];
    const outputElement = document.getElementById('output');
    const progressElement = document.getElementById('progress'); // Optional: Progress bar or spinner
    const statusMessage = document.getElementById('statusMessage'); // For status updates

    // Check if an image file is uploaded
    if (!imageFile) {
        alert("Please upload an image first.");
        return;
    }

    // Reset output and show progress spinner
    outputElement.innerText = "";
    statusMessage.innerText = "Processing... Please wait.";
    progressElement.style.display = "block";

    // Create a FileReader to read the image file
    const reader = new FileReader();
    reader.onload = () => {
        // Perform OCR using Tesseract.js
        Tesseract.recognize(
            reader.result, // Image data URL
            'eng', // Language for OCR (English)
            {
                logger: (progress) => {
                    console.log(progress); // Log OCR progress
                    if (progress.status === 'recognizing text') {
                        const percent = Math.round(progress.progress * 100);
                        statusMessage.innerText = `Recognizing text: ${percent}% complete`;
                    }
                },
            }
        )
        .then(({ data: { text } }) => {
            progressElement.style.display = "none"; // Hide progress
            if (text.trim()) {
                outputElement.innerText = text; // Display the extracted text
                statusMessage.innerText = "Conversion complete!";
            } else {
                outputElement.innerText = "No text found in the image.";
                statusMessage.innerText = "Try uploading a clearer image.";
            }
        })
        .catch((err) => {
            progressElement.style.display = "none"; // Hide progress
            console.error(err);
            outputElement.innerText = "Error extracting text. Please try again.";
            statusMessage.innerText = "An error occurred during processing.";
        });
    };

    reader.onerror = () => {
        progressElement.style.display = "none"; // Hide progress
        console.error("Error reading file.");
        outputElement.innerText = "Failed to process the image. Please try again.";
        statusMessage.innerText = "Error reading the image file.";
    };

    reader.readAsDataURL(imageFile); // Start reading the file
}


// Function to convert PDF to Word (Extract Text and Generate DOCX)
async function convertPdfToWord() {
    const pdfFile = document.getElementById('pdfUpload').files[0];
    const downloadLink = document.getElementById('downloadLink');
    const outputArea = document.getElementById('pdfOutput');

    // Clear previous outputs
    downloadLink.style.display = 'none';
    outputArea.innerText = '';

    if (!pdfFile) {
        alert("Please upload a PDF file first.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(async function(pdf) {
            let allText = '';

            // Loop through each page in the PDF and extract text
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                let previousY = null;
                let pageText = '';

                textContent.items.forEach(function(item) {
                    const currentY = item.transform[5]; // Y position of the current text item

                    if (previousY !== null && Math.abs(currentY - previousY) > 10) {
                        // If the Y-position difference is greater than a threshold, assume it's a new line
                        pageText += '\n';
                    }
                    pageText += item.str;
                    previousY = currentY;
                });

                allText += pageText + "\n\n"; // Add spacing between pages
            }

            // Create a DOCX file using the extracted text
            generateWordDoc(allText, downloadLink);
            outputArea.innerText = "Conversion complete! You can now download the Word file.";
        }).catch(function(err) {
            outputArea.innerText = "Error extracting text from the PDF: " + err.message;
            console.error(err);
        });
    };

    reader.readAsArrayBuffer(pdfFile);
}

// Function to generate a Word document using docx.js
function generateWordDoc(text, downloadLink) {
    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    children: [new docx.TextRun(text)],
                }),
            ],
        }],
    });

    docx.Packer.toBlob(doc).then((blob) => {
        // Create a downloadable link for the generated DOCX
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.style.display = 'inline'; // Make the download link visible
        downloadLink.download = "converted.docx"; // Set the filename for the download
    });
}

// Register the service worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}