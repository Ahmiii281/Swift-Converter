// PDF to Word Converter - Enhanced Version
class PdfToWordConverter {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupFileValidation();
        this.initializePdfJs();
    }

    initializeElements() {
        this.pdfUpload = document.getElementById('pdfUpload');
        this.convertButton = document.getElementById('convertPdfButton');
        this.downloadLink = document.getElementById('downloadLink');
        this.outputArea = document.getElementById('pdfOutput');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.statusMessage = document.getElementById('statusMessage');
        this.extractedText = '';
    }

    setupEventListeners() {
        this.pdfUpload.addEventListener('change', (e) => this.handleFileSelection(e));
        this.convertButton.addEventListener('click', () => this.convertPdfToWord());
    }

    setupFileValidation() {
        this.pdfUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.validateFile(file);
            }
        });
    }

    async initializePdfJs() {
        try {
            // Configure PDF.js worker
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
        } catch (error) {
            console.error('Failed to initialize PDF.js:', error);
        }
    }

    validateFile(file) {
        const maxSize = 25 * 1024 * 1024; // 25MB
        const allowedTypes = ['application/pdf'];
        
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please select a valid PDF file.');
            this.resetForm();
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File size must be less than 25MB.');
            this.resetForm();
            return false;
        }

        this.convertButton.disabled = false;
        this.showSuccess(`Selected: ${file.name} (${this.formatFileSize(file.size)})`);
        return true;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async convertPdfToWord() {
        const pdfFile = this.pdfUpload.files[0];
        
        if (!pdfFile) {
            this.showError('Please select a PDF file first.');
            return;
        }

        try {
            this.setLoadingState(true);
            this.showProgress(0, 'Reading PDF file...');
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await this.processPdf(e.target.result);
                } catch (error) {
                    this.handleError(error);
                }
            };
            
            reader.onerror = () => {
                this.handleError(new Error('Failed to read the PDF file.'));
            };
            
            reader.readAsArrayBuffer(pdfFile);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    async processPdf(arrayBuffer) {
        try {
            this.showProgress(10, 'Loading PDF...');
            
            const typedArray = new Uint8Array(arrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            
            this.showProgress(20, `Processing ${pdf.numPages} pages...`);
            
            let allText = '';
            const totalPages = pdf.numPages;
            
            for (let i = 1; i <= totalPages; i++) {
                const progress = 20 + (i / totalPages) * 60;
                this.showProgress(progress, `Extracting text from page ${i} of ${totalPages}...`);
                
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                let pageText = this.extractTextFromPage(textContent);
                allText += pageText + "\n\n";
            }
            
            this.extractedText = allText.trim();
            this.showProgress(90, 'Generating Word document...');
            
            await this.generateWordDocument();
            
            this.showProgress(100, 'Conversion complete!');
            this.displayResults();
            
        } catch (error) {
            throw new Error('PDF processing failed: ' + error.message);
        }
    }

    extractTextFromPage(textContent) {
        let previousY = null;
        let pageText = '';
        
        textContent.items.forEach((item) => {
            const currentY = item.transform[5];
            
            // Add line break if Y position changes significantly
            if (previousY !== null && Math.abs(currentY - previousY) > 10) {
                pageText += '\n';
            }
            
            pageText += item.str;
            previousY = currentY;
        });
        
        return pageText;
    }

    async generateWordDocument() {
        try {
            if (!this.extractedText) {
                throw new Error('No text extracted from PDF');
            }

            // Split text into paragraphs
            const paragraphs = this.extractedText.split('\n\n').filter(p => p.trim());
            
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: paragraphs.map(text => 
                        new docx.Paragraph({
                            children: [new docx.TextRun({
                                text: text.trim(),
                                size: 24, // 12pt font
                            })],
                            spacing: {
                                after: 200, // Space after paragraph
                            },
                        })
                    ),
                }],
            });

            const blob = await docx.Packer.toBlob(doc);
            
            // Create download link
            const url = URL.createObjectURL(blob);
            this.downloadLink.href = url;
            this.downloadLink.style.display = 'inline-block';
            this.downloadLink.download = `converted-${new Date().toISOString().split('T')[0]}.docx`;
            
            // Clean up URL after download
            this.downloadLink.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
            
        } catch (error) {
            throw new Error('Word document generation failed: ' + error.message);
        }
    }

    displayResults() {
        this.hideProgress();
        this.setLoadingState(false);
        
        if (this.extractedText) {
            this.outputArea.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-check-circle text-success" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Conversion Successful!</h3>
                    <p>Your PDF has been converted to Word format. Click the download button below to get your file.</p>
                    <div class="mt-4">
                        <small class="text-muted">
                            Extracted ${this.extractedText.split('\n').length} lines of text
                        </small>
                    </div>
                </div>
            `;
            this.showSuccess('PDF converted to Word successfully!');
        } else {
            this.outputArea.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>No Text Found</h3>
                    <p>The PDF file appears to be empty or contains only images. Try with a different PDF file.</p>
                </div>
            `;
            this.showWarning('No text content found in the PDF.');
        }
    }

    showProgress(percent, message) {
        this.progressContainer.style.display = 'block';
        this.progressBar.style.width = `${percent}%`;
        this.progressBar.setAttribute('aria-valuenow', percent);
        this.statusMessage.textContent = message;
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    setLoadingState(loading) {
        this.convertButton.disabled = loading;
        this.pdfUpload.disabled = loading;
        
        if (loading) {
            this.convertButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Processing...';
            this.convertButton.classList.add('loading');
        } else {
            this.convertButton.innerHTML = '<i class="fas fa-file-word" aria-hidden="true"></i> Convert to Word';
            this.convertButton.classList.remove('loading');
        }
    }

    showSuccess(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-success';
    }

    showWarning(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-warning';
    }

    showError(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-error';
    }

    handleError(error) {
        console.error('PDF to Word Conversion Error:', error);
        this.hideProgress();
        this.setLoadingState(false);
        this.showError(`Error: ${error.message}`);
        
        this.outputArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-exclamation-circle text-error" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Conversion Failed</h3>
                <p>An error occurred during the conversion process. Please try again with a different file.</p>
            </div>
        `;
    }

    resetForm() {
        this.pdfUpload.value = '';
        this.convertButton.disabled = true;
        this.downloadLink.style.display = 'none';
        this.outputArea.innerHTML = '<p class="text-center text-muted">Upload a PDF file to start the conversion process.</p>';
        this.extractedText = '';
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PdfToWordConverter();
});

// Legacy function for backward compatibility
async function convertPdfToWord() {
    // This function is kept for backward compatibility
    console.warn('convertPdfToWord() is deprecated. Use the PdfToWordConverter class instead.');
}

function generateWordDoc(text, downloadLink) {
    // This function is kept for backward compatibility
    console.warn('generateWordDoc() is deprecated. Use the PdfToWordConverter class instead.');
}