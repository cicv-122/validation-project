import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		try {
			const saved = localStorage.getItem('theme') as Theme | null;
			if (saved === 'dark' || saved === 'light') {
				return saved;
			}
		} catch (e) {
			// ignore
		}
		return 'light';
	});

	useEffect(() => {
		try {
			const root = document.documentElement;
			const body = document.body;
			if (theme === 'dark') {
				root.classList.add('dark');
				body.classList.add('dark');
			} else {
				root.classList.remove('dark');
				body.classList.remove('dark');
			}
			localStorage.setItem('theme', theme);
		} catch (e) {
			console.error('Failed to set theme class:', e);
		}
	}, [theme]);

	const toggleTheme = () => {
		setThemeState((prev) => {
			const next = prev === 'dark' ? 'light' : 'dark';
			console.log('[Theme] Toggled from', prev, 'to', next);
			return next;
		});
	};

	const setTheme = (t: Theme) => {
		setThemeState(t);
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
