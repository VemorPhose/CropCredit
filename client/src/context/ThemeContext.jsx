import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });
  
  // Track if this is the initial mount
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // On initial mount, don't apply transitions
    if (isInitialMount) {
      root.classList.add('no-transition');
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      
      // Force a reflow to make sure the no-transition class takes effect
      window.getComputedStyle(root).getPropertyValue("background-color");
      
      // Remove the no-transition class after changes are applied
      setTimeout(() => {
        root.classList.remove('no-transition');
        setIsInitialMount(false);
      }, 0);
    } else {
      // On subsequent theme changes, let transitions happen
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    
    localStorage.setItem("theme", theme);
  }, [theme, isInitialMount]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
