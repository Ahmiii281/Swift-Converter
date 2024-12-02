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

    reader.onload = function () {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(async function (pdf) {
            let allText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                let previousY = null;
                let pageText = '';

                textContent.items.forEach(function (item) {
                    const currentY = item.transform[5];
                    if (previousY !== null && Math.abs(currentY - previousY) > 10) {
                        pageText += '\n';
                    }
                    pageText += item.str;
                    previousY = currentY;
                });

                allText += pageText + "\n\n";
            }

            generateWordDoc(allText, downloadLink);
            outputArea.innerText = "Conversion complete! You can now download the Word file.";
        }).catch(function (err) {
            outputArea.innerText = "Error extracting text from the PDF: " + err.message;
            console.error(err);
        });
    };

    reader.readAsArrayBuffer(pdfFile);
}

function generateWordDoc(text, downloadLink) {
    const doc = new window.docx.Document({ // Explicitly use `window.docx` to avoid scope issues
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    children: [new docx.TextRun(text)],
                }),
            ],
        }],
    });

    window.docx.Packer.toBlob(doc).then((blob) => {
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.style.display = 'inline'; // Make the download link visible
        downloadLink.download = "converted.docx";
    }).catch((error) => {
        console.error("Error generating Word document:", error);
    });
}
