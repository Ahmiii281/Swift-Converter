// Enhanced Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        
        this.initializeTheme();
        this.setupEventListeners();
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (error) {
            console.warn('Unable to access localStorage:', error);
            return null;
        }
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    initializeTheme() {
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.storeTheme(theme);
    }

    storeTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Unable to store theme preference:', error);
        }
    }

    updateThemeIcon() {
        if (!this.themeIcon) return;
        
        const iconClass = this.currentTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill';
        const currentClass = this.currentTheme === 'dark' ? 'bi-moon-fill' : 'bi-sun-fill';
        
        this.themeIcon.classList.remove(currentClass);
        this.themeIcon.classList.add(iconClass);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateThemeIcon();
        
        // Add animation effect
        this.animateThemeChange();
    }

    animateThemeChange() {
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                this.themeToggle.style.transform = 'rotate(0deg)';
            }, 300);
        }
    }

    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only update if user hasn't manually set a preference
                if (!this.getStoredTheme()) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme);
                    this.updateThemeIcon();
                }
            });
        }

        // Keyboard accessibility
        if (this.themeToggle) {
            this.themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to set theme programmatically
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.applyTheme(theme);
            this.updateThemeIcon();
        }
    }
}

// Initialize theme immediately to prevent flash of wrong theme
(function() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    document.documentElement.setAttribute('data-theme', initialTheme);
})();

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Legacy functions for backward compatibility
function toggleTheme() {
    if (window.themeManager) {
        window.themeManager.toggleTheme();
    } else {
        console.warn('ThemeManager not initialized. Using fallback method.');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            const iconClass = newTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill';
            const currentClass = newTheme === 'dark' ? 'bi-moon-fill' : 'bi-sun-fill';
            themeIcon.classList.remove(currentClass);
            themeIcon.classList.add(iconClass);
        }
    }
}

function loadTheme() {
    if (window.themeManager) {
        // ThemeManager handles this automatically
        return;
    }
    
    console.warn('ThemeManager not initialized. Using fallback method.');
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('bi-moon-fill');
            themeIcon.classList.add('bi-sun-fill');
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('bi-sun-fill');
            themeIcon.classList.add('bi-moon-fill');
        }
    }
}

// Initialize theme on page load (fallback)
window.addEventListener('load', () => {
    if (!window.themeManager) {
        loadTheme();
    }
});

// Add event listener to theme toggle button (fallback)
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn && !window.themeManager) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});