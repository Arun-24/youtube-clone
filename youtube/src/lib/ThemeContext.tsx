import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
});

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const applyDynamicTheme = async () => {
      try {
        /* -------- IST TIME -------- */
        const now = new Date();
        const ISTTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        const hour = ISTTime.getHours();
        const isMorningIST = hour >= 10 && hour < 12;

        /* -------- LOCATION -------- */
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        console.log("Location Data:", data);

        const southStates = [
          "tamil nadu",
          "kerala",
          "karnataka",
          "andhra pradesh",
          "telangana",
        ];

        const southCities = [
          "chennai",
          "coimbatore",
          "madurai",
          "bengaluru",
          "mysuru",
          "hyderabad",
          "kochi",
          "thiruvananthapuram",
        ];

        const region = (data.region || "").toLowerCase();
        const city = (data.city || "").toLowerCase();

        const isSouthState = southStates.some((state) =>
          region.includes(state)
        );

        const isSouthCity = southCities.some((c) =>
          city.includes(c)
        );

        const isSouthIndia = isSouthState || isSouthCity;

        console.log("Region:", region);
        console.log("City:", city);
        console.log("isSouthIndia:", isSouthIndia);
        console.log("isMorningIST:", isMorningIST);

        if (isSouthIndia && isMorningIST) {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      } catch (error) {
        console.error("Theme error:", error);
        setTheme("dark");
      }
    };

    applyDynamicTheme();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 