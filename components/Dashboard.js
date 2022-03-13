import { Connection, PublicKey } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import { useEffect, useState } from "react";
import IDL from "../idl/anchor_heroes.json";

const { SystemProgram, Keypair } = web3;

const programID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
const opts = {
  preflightCommitment: "processed",
};
const network = "http://localhost:8899";

let baseAccount = Keypair.generate();
const connection = new Connection(network, opts.preflightCommitment);

const getProvider = (wallet) => {
  return new Provider(connection, wallet, opts.preflightCommitment);
};

const createHero = async () => {
  try {
    const provider = getProvider(window.solana);
    const program = new Program(IDL, programID, provider);
    await program.rpc.initialize({
      accounts: {
        heroAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    const account = await program.account.heroAccount.fetch(
      baseAccount.publicKey
    );
    console.log("hero level", account.level.toString());
  } catch (e) {
    console.error(e);
  }
};

export default function Dashboard({ logout }) {
  const [heroes, setHeroes] = useState([]);

  const handleLogout = async () => {
    await window.solana.disconnect();
    logout();
  };

  const levelUpHero = async (pubKey) => {
    const provider = getProvider(window.solana);
    const program = new Program(IDL, programID, provider);
    await program.rpc.levelUp({
      accounts: {
        heroAccount: pubKey,
      },
    });
    await getAccounts();
  };

  async function getAccounts() {
    const provider = getProvider(window.solana);

    const program = new Program(IDL, programID, provider);
    try {
      const accounts = await connection.getProgramAccounts(programID);
      const heroAccounts = [];
      for (const account of accounts) {
        const publicKey = account.pubkey.toString();
        const heroStats = await program.account.heroAccount.fetch(
          account.pubkey.toString()
        );
        heroAccounts.push({ publicKey, heroStats });
      }
      setHeroes(heroAccounts);
    } catch (e) {
      console.error("could not get accounts: ", e);
    }
  }

  useEffect(() => {
    if (!window) return;
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center py-10 px-4 bg-black overflow-auto">
      <button
        onClick={async () => await handleLogout()}
        className="text-white self-end"
      >
        logout
      </button>

      <div className="w-full h-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-cyan md:col-span-2 rounded-2xl drop-shadow-md px-2 py-2 md:px-4 md:py-4 md:text-lg">
          <ul className="flex flex-col list-disc px-4 mt-4 md:mt-10 text-md md:text-lg">
            <button onClick={async () => await createHero()}>
              Create hero
            </button>
            <button onClick={getAccounts}>Get accounts</button>
          </ul>
          <ul>
            {heroes.map((hero, index) => (
              <div key={hero.publicKey}>
                <p>Hero # {index}</p>
                <p>Key: {hero.publicKey}</p>
                <p>Level: {hero.heroStats.level.toString()}</p>
                <button onClick={() => levelUpHero(hero.publicKey)}>
                  level up
                </button>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
