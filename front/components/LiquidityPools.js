import { useMoralis, useWeb3Contract } from "react-moralis"
import { dexAbi, dexAddresses } from "../constants/dex-constants"
import CreateModal from "./CreateModal";
import { useState } from "react";

const LiquidityPools = () => {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const [isOpen, setIsOpen] = useState(false);

    const contractAddress = parseInt(chainIdHex) in dexAddresses ? dexAddresses[parseInt(chainIdHex)].dex : null;

    const { runContractFunction : createLiquidityPool } = useWeb3Contract({
        abi: dexAbi,
        contractAddress: contractAddress,
        functionName: "createPairs"
    });

    const onClose = () => {
        setIsOpen(false);
    }

    const onConfirm = async (token1Address, token2Address, token1Name, token2Name) => {
        try {
            await createLiquidityPool({
                params: {
                    params: {
                        token1: token1Address,
                        token2: token2Address,
                        token1Name: token1Name,
                        token2Name: token2Name
                    }
                },
                onSuccess: async (tx) => {
                    console.log("Liquidity Pool created :", tx);
                },
                onError: async (e) => {
                    console.log(e)
                },
            })
        } catch(error) {
            console.log(error);
        }

        setIsOpen(false);
    }

    return (
        <div className="mt-8 p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Liquidity Pools</h2>
            { isWeb3Enabled && contractAddress != null ? (
                <div>
                    <p>Welcome, {account}!</p>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4" onClick={()=>{
                        setIsOpen(true)
                    }}>
                        Create Liquidity Pool
                    </button>
                </div>
            ) : (
                <div>Please log in!</div>
            )}

            <CreateModal
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={onConfirm}
            />
        </div>
    )
}

export default LiquidityPools;