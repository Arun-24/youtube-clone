import { createContext } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { getUserLocationAndTime } from "./location";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpChannel, setOtpChannel] = useState(null);

  /* ---------------- LOGIN ---------------- */

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  /* ---------------- LOGOUT ---------------- */

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  /* ---------------- GOOGLE SIGN IN ---------------- */

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      /* -------- GET USER LOCATION -------- */
      let locationInfo = null;

      try {
        locationInfo = await getUserLocationAndTime();
      } catch (error) {
        console.error("Location detection failed:", error);
      }

      /* -------- GENERATE OTP -------- */
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      /* -------- OTP ROUTING -------- */
      if (locationInfo?.isSouthIndia) {
        console.log("Email OTP:", otp);
        setOtpChannel("email");
      } else {
        console.log("Mobile OTP:", otp);
        setOtpChannel("mobile");
      }

      setOtpRequired(true);

      /* -------- STORE TEMP USER -------- */

      sessionStorage.setItem(
        "pendingUser",
        JSON.stringify({
          email: firebaseuser.email,
          name: firebaseuser.displayName,
          image: firebaseuser.photoURL || "https://github.com/shadcn.png",
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- OTP VERIFY ---------------- */

  const verifyOtp = async () => {
    if (otpValue !== generatedOtp) {
      alert("Invalid OTP");
      return;
    }

    const storedUser = sessionStorage.getItem("pendingUser");
    if (!storedUser) return;

    const payload = JSON.parse(storedUser);

    try {
      const response = await axiosInstance.post("/user/login", payload);

      login(response.data.result);

      setOtpRequired(false);
      setOtpValue("");
      setGeneratedOtp("");
      setOtpChannel(null);

      sessionStorage.removeItem("pendingUser");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  /* ---------------- CLEAN OTP STATE ---------------- */

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingUser");

    if (!pending) {
      setOtpRequired(false);
    }
  }, []);

  /* ---------------- AUTH STATE LISTENER ---------------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };

          const response = await axiosInstance.post("/user/login", payload);

          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- CONTEXT PROVIDER ---------------- */

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        otpRequired,
        otpValue,
        setOtpValue,
        verifyOtp,
        otpChannel,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);