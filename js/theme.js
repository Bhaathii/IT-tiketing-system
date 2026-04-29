// Theme toggle script - injects a floating toggle button and persists preference
(function(){
    const THEME_KEY = 'site_theme';

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    function toggleTheme() {
        const current = localStorage.getItem(THEME_KEY) || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        updateButton(next);
    }

    function updateButton(theme) {
        const btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;
        btn.textContent = theme === 'light' ? '🌙' : '☀️';
        btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    }

    function injectButton() {
        if (document.getElementById('theme-toggle-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'theme-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle theme');
        btn.addEventListener('click', toggleTheme);

        // Small accessible tooltip on focus
        btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); } });

        document.body.appendChild(btn);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const stored = localStorage.getItem(THEME_KEY) || 'dark';
        applyTheme(stored);
        injectButton();
        updateButton(stored);
    });
})();
