import { useState, useRef, useEffect } from "react";

export default function SecretGate({ children }) {
  const [isAuth, setIsAuth] = useState(false);

  const [clicks, setClicks] = useState(0);
  const [homeClicks, setHomeClicks] = useState(0);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("404");

  const inputRef = useRef(null);

  // check stored auth (localStorage)
  useEffect(() => {
    const token = localStorage.getItem("ve_auth");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token === "ok_7474") setIsAuth(true);
  }, []);

  // handle 404 click
  const handle404Click = () => {
    if (clicks === 1) setClicks(2);
    else setClicks(1);
  };

  // handle home click
  const handleHomeClick = (e) => {
    if (clicks === 2) {
      e.preventDefault();
      const newCount = homeClicks + 1;
      setHomeClicks(newCount);

      if (newCount >= 2) {
        setActive(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    } else {
      setClicks(0);
      setHomeClicks(0);
    }
  };

  // handle typing
  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);

    if (val === "veieers7474") {
      localStorage.setItem("ve_auth", "ok_7474"); // persist auth
      setIsAuth(true);
    }
  };

  // ✅ if authenticated → show real page
  if (isAuth) return children;

  // ❌ if not → show 404 UI (same UI, unchanged)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div>
        <h1
          onClick={handle404Click}
          className="text-7xl font-extrabold bg-linear-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text cursor-default"
        >
          {active ? (
            <input
              ref={inputRef}
              value={value}
              onChange={handleChange}
              className="bg-transparent text-center outline-none w-full"
            />
          ) : (
            "404"
          )}
        </h1>

        <h2 className="mt-3 text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>

        <p className="mt-2 text-gray-500 text-sm">
          The page you’re looking for doesn’t exist.
        </p>

        <a
          href="/"
          onClick={handleHomeClick}
          className="inline-block mt-5 px-5 py-2.5 rounded-lg text-white bg-linear-to-r from-blue-500 to-blue-700 shadow hover:shadow-md transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}