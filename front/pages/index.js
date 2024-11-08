import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    return (
        <>
            <main>
                <div className="py-5 mx-32">
                    <h1 className="text-white text-3xl font-bold">
                        Decentralized Exchange
                    </h1>
                    <h3 className="text-white text-xl font-bold pt-12">
                        A decentralized exchange (DEX) is a type of
                        cryptocurrency exchange that operates without a central
                        authority or intermediary. Unlike traditional
                        centralized exchanges, DEXs facilitate peer-to-peer
                        trading of cryptocurrencies directly between users.
                    </h3>
                    <div className="pt-12">
                    <button className="bg-pink-500 hover:bg-pink-900 text-white fond-bold rounded px-8 py-2 mx-2" 
                        onClick={async function () {
                            router.push("/swap")
                        }}>
                            Swap
                        </button>
                        <button className="bg-pink-500 hover:bg-pink-900 text-white fond-bold rounded px-8 py-2 mx-2" 
                        onClick={async function () {
                            router.push("/pools")
                        }}>
                            Liquidity
                        </button>
                    </div>
                </div>
            </main>
        </>
    )
}
