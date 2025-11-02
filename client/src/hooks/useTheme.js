import { useState, useEffect } from 'react';

// Chave para salvar no localStorage
const THEME_KEY = 'app-theme';

export function useTheme() {
    // 1. Tenta ler do localStorage, senão usa 'system' como padrão
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(THEME_KEY) || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement; // A tag <html>

        // Limpa classes antigas
        root.classList.remove('light', 'dark');

        let effectiveTheme = theme;

        // 2. Se for 'system', descobre a preferência do SO
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
        }

        // 3. Aplica a classe 'dark' ou 'light' na tag <html>
        root.classList.add(effectiveTheme);

        // 4. Salva a escolha no localStorage
        localStorage.setItem(THEME_KEY, theme);

    }, [theme]); // Roda toda vez que o 'theme' mudar

    return { theme, setTheme };
}