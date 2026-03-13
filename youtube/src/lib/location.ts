export const SOUTH_INDIAN_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
];

export type LocationInfo = {
  city: string;
  state: string;
  isSouthIndia: boolean;
  isMorningIST: boolean;
};

export const getUserLocationAndTime = async (): Promise<LocationInfo> => {
  const res = await fetch("https://ipapi.co/json/");
  const data = await res.json();

  const state = data.region;
  const city = data.city;

  const now = new Date();
  const istHour = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getHours();

  const isMorningIST = istHour >= 10 && istHour < 12;
  const isSouthIndia = SOUTH_INDIAN_STATES.includes(state);

  return {
    city,
    state,
    isSouthIndia,
    isMorningIST,
  };
};
