import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const [wallet, setWallet] = useState(null);
  // useEffect(() => console.log("wallet", wallet), [wallet]);
  return (
    <>
      {wallet ? (
        <Dashboard logout={() => setWallet(null)} />
      ) : (
        <Auth authenticate={setWallet} />
      )}
    </>
  );
}
