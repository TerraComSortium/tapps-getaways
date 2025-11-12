import { useEffect, useState } from "react";

function Header() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to get user data fetching");
      }

      const data = await response.json();
      console.log(data);
    };

    getData()
  }, []);

  return (
    <header className="bg-purple h-14 w-full flex items-center justify-between px-8 py-2 text-yellow">
      <div>GetAways</div>
      <div className="flex items-center gap-2">
        <div className="size-10 bg-yellow rounded-full"></div>
        <span>@PlayerName</span>
      </div>
    </header>
  );
}

export default Header;
