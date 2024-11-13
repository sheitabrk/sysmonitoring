const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        themeIcon.textContent = '🌞'; 
    } else {
        themeIcon.textContent = '🌙'; 
    }
});