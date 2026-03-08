// URL Shortener - Client-side implementation using TinyURL API
class UrlShortener {
    constructor() {
        this.API_ENDPOINT = 'https://tinyurl.com/api-create.php?url=';
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.inputElement = document.getElementById('longUrlInput');
        this.shortenButton = document.getElementById('shortenUrlButton');
        this.outputArea = document.getElementById('outputArea');
        this.statusMessage = document.getElementById('statusMessage');
        this.copyButton = document.getElementById('copyButton');
        this.testLink = document.getElementById('testLink');
        this.shortUrl = '';
    }

    setupEventListeners() {
        this.shortenButton.addEventListener('click', () => this.shortenUrl());
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
    }

    isValidUrl(url) {
        // Basic regex for URL validation (must start with http/https)
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }

    async shortenUrl() {
        const longUrl = this.inputElement.value.trim();
        this.shortUrl = '';
        this.updateDownloadButtons(false);
        this.outputArea.innerHTML = `<p class="text-center text-muted">Processing...</p>`;
        this.showInfo('Processing request...');

        if (!longUrl) {
            this.showError('Please enter a URL to shorten.');
            this.outputArea.innerHTML = `<p class="text-center text-muted">Enter a URL above to generate a short link.</p>`;
            return;
        }

        if (!this.isValidUrl(longUrl)) {
            this.showError('Invalid URL format. Must start with http:// or https://.');
            this.outputArea.innerHTML = `<p class="text-center text-muted">Enter a URL above to generate a short link.</p>`;
            return;
        }

        try {
            this.setLoadingState(true);
            
            // Encode the URL to be safe for a query parameter
            const encodedUrl = encodeURIComponent(longUrl);
            const fullApiUrl = this.API_ENDPOINT + encodedUrl;

            // Use fetch with a simple GET request
            const response = await fetch(fullApiUrl);

            if (!response.ok) {
                // If the response is not OK, TinyURL might return an error message in the body or a 404
                throw new Error(`TinyURL API failed with status: ${response.status}`);
            }

            // The TinyURL API returns the short URL as plain text
            const shortUrl = await response.text();

            if (shortUrl.startsWith('Error') || shortUrl.startsWith('http://tinyurl.com/error')) {
                throw new Error(shortUrl.replace('Error', '').trim());
            }

            this.shortUrl = shortUrl;
            this.displayResults(shortUrl);
            
        } catch (error) {
            this.handleError(error, longUrl);
        } finally {
            this.setLoadingState(false);
        }
    }

    displayResults(shortUrl) {
        this.outputArea.innerHTML = `<pre>${this.escapeHtml(shortUrl)}</pre>`;
        this.testLink.href = shortUrl;
        this.updateDownloadButtons(true);
        this.showSuccess('URL shortened successfully!');
    }

    handleError(error, originalUrl) {
        console.error('URL Shortener Error:', error);
        this.showError(`Shortening failed. Reason: ${error.message || 'Unknown error.'}`);
        this.outputArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-exclamation-circle text-error" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Service Unavailable / Error</h3>
                <p>The client-side API call failed (e.g., due to Cross-Origin Resource Sharing restrictions).</p>
                <div class="mt-4">
                    <p class="text-muted"><strong>Original URL:</strong> ${originalUrl}</p>
                    <small>For reliable shortening, please use a dedicated service:</small>
                    <ul style="text-align: left; margin: 1rem auto; display: inline-block;">
                        <li><a href="https://bitly.com/" target="_blank" rel="noopener">Bitly.com</a></li>
                        <li><a href="https://tinyurl.com/" target="_blank" rel="noopener">TinyURL.com</a></li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    async copyToClipboard() {
        if (!this.shortUrl) {
            this.showError('No link to copy.');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.shortUrl);
            this.showSuccess('Short link copied to clipboard!');
            
            // Visual feedback
            this.copyButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
            setTimeout(() => {
                this.copyButton.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copy Short Link';
            }, 2000);
            
        } catch (error) {
            // Fallback for older browsers or permission issues
            console.error('Clipboard copy failed:', error);
            this.fallbackCopyToClipboard();
        }
    }

    fallbackCopyToClipboard() {
        const textArea = document.createElement('textarea');
        textArea.value = this.shortUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('Link copied (fallback)!');
        } catch (error) {
            this.showError('Failed to copy text. Please copy manually.');
        }
        
        document.body.removeChild(textArea);
    }
    
    updateDownloadButtons(enabled) {
        this.copyButton.disabled = !enabled;
        this.testLink.disabled = !enabled;
        this.testLink.style.display = enabled ? 'inline-flex' : 'none';
    }

    setLoadingState(loading) {
        this.shortenButton.disabled = loading;
        this.inputElement.disabled = loading;
        
        if (loading) {
            this.shortenButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Shortening...';
            this.shortenButton.classList.add('loading');
        } else {
            this.shortenButton.innerHTML = '<i class="fas fa-cut" aria-hidden="true"></i> Shorten URL';
            this.shortenButton.classList.remove('loading');
        }
    }

    showSuccess(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-success';
    }

    showInfo(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-info';
    }
    
    showError(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mt-4 text-error';
        this.updateDownloadButtons(false);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new UrlShortener();
});