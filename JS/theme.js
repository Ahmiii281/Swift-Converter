// Dark Mode Toggle
function toggleTheme() {
    // Toggle dark mode class on the body
    document.body.classList.toggle('dark-mode');

    // Check if dark mode is enabled and store preference in localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeIcon.classList.replace(
        isDarkMode ? 'bi-brightness-high-fill' : 'bi-moon-fill',
        isDarkMode ? 'bi-moon-fill' : 'bi-brightness-high-fill'
    );
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
window.onload = function () {
    loadTheme();
};

// Add event listener to the theme toggle button
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
themeToggleBtn.addEventListener('click', toggleTheme);
