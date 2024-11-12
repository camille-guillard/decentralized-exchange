import { useMoralis, useWeb3Contract } from "react-moralis"
import { dexAbi, poolAbi, tokenAbi, dexAddresses } from "../constants/dex-constants"
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import CreateModal from "./CreateModal";
 

const LiquidityPools = () => {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const [isOpen, setIsOpen] = useState(false);
    const [pools, setPools] = useState([]);
    const [selectedPool, setSelectedPool] = useState("");
    const [liquidityTokenName, setLiquidityTokenName] = useState("");
    const [token1Name, setToken1Name] = useState("");
    const [token2Name, setToken2Name] = useState("");
    const [liquidityTokenAmount1, setLiquidityTokenAmount1] = useState("0");
    const [liquidityTokenAmount2, setLiquidityTokenAmount2] = useState("0");
    const [liquidityTokenAmount, setLiquidityTokenAmount] = useState("0");
    const [liquidityTokenAmountToRemove, setLiquidityTokenAmountToRemove] = useState("0");

    const contractAddress = parseInt(chainIdHex) in dexAddresses ? dexAddresses[parseInt(chainIdHex)].dex : null;

    const { runContractFunction : createLiquidityPool } = useWeb3Contract({
        abi: dexAbi,
        contractAddress: contractAddress,
        functionName: "createPairs"
    });

    const { runContractFunction : getPairs } = useWeb3Contract({
        abi: dexAbi,
        contractAddress: contractAddress,
        functionName: "getPairs"
    });
    
    const { runContractFunction : getTokenName } = useWeb3Contract({
        abi: tokenAbi,
        functionName: "name"
    });

    const { runContractFunction : getToken1 } = useWeb3Contract({
        abi: poolAbi,
        functionName: "token1"
    });

    const { runContractFunction : getToken2 } = useWeb3Contract({
        abi: poolAbi,
        functionName: "token2"
    });

    const { runContractFunction : liquidityToken } = useWeb3Contract({
        abi: poolAbi,
        functionName: "liquidityToken"
    });

    const { runContractFunction : getAllowance } = useWeb3Contract({
        abi: tokenAbi,
        functionName: "allowance"
    });

    const { runContractFunction : balanceOf } = useWeb3Contract({
        abi: tokenAbi,
        functionName: "balanceOf"
    });

    const { runContractFunction : approve } = useWeb3Contract({
        abi: tokenAbi,
        functionName: "approve"
    });

    const { runContractFunction : addLiquidity } = useWeb3Contract({
        abi: poolAbi,
        functionName: "addLiquidity"
    });

    const { runContractFunction : removeLiquidity } = useWeb3Contract({
        abi: poolAbi,
        functionName: "removeLiquidity"
    });

    useEffect(() => {
        if(isWeb3Enabled && contractAddress != null) {
            const fetchPools = async () => {
                const pairs = await getPairs();
                if(pairs) {
                    setPools(pairs);
                    if(pairs.length > 0) {
                        setSelectedPool(pairs[0]);

                        

                    }
                }
            }
            fetchPools();
        }
    }, [isWeb3Enabled]);
    
    useEffect(() => {
        if(selectedPool) {
            const getLiquidityAmount = async () => {

                const liquidityTokenAddress = await liquidityToken({
                    params: {
                        contractAddress: selectedPool
                    }
                });

                const token1Address = await getToken1({
                    params: {
                        contractAddress: selectedPool
                    }
                });
                const token2Address = await getToken2({
                    params: {
                        contractAddress: selectedPool
                    }
                });

                const token1Name = await getTokenName({
                    params: {
                        contractAddress: token1Address
                    }
                });

                const token2Name = await getTokenName({
                    params: {
                        contractAddress: token2Address
                    }
                });
                
                setToken1Name(token1Name);
                setToken2Name(token2Name);

                if(liquidityTokenAddress) {
                    const liquidityAmount = await balanceOf({
                        params: {
                            contractAddress: liquidityTokenAddress,
                            params: {
                                account
                            }
                        }
                    });
                    setLiquidityTokenAmount(ethers.utils.formatEther(liquidityAmount));

                    const liquidityTokenName = await getTokenName({
                        params: {
                            contractAddress: liquidityTokenAddress
                        }
                    });
                    setLiquidityTokenName(liquidityTokenName);
                }
            }
            getLiquidityAmount();
        }
    }, [selectedPool]);

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

    const handleAddLiquidity = async () => {
        try {
            const token1 = await getToken1({
                params: {
                    contractAddress: selectedPool
                }
            });
            const token2 = await getToken2({
                params: {
                    contractAddress: selectedPool
                }
            });
            const isToken1Approved = await checkAllowance(
                token1,
                account,
                selectedPool,
                ethers.utils.parseEther(liquidityTokenAmount1)
            );
            const isToken2Approved = await checkAllowance(
                token2,
                account,
                selectedPool,
                ethers.utils.parseEther(liquidityTokenAmount2)
            );
            if(!isToken1Approved || !isToken2Approved) {
                await requestApprovals(
                    isToken1Approved,
                    isToken2Approved,
                    token1,
                    token2,
                    selectedPool,
                    ethers.utils.parseEther(liquidityTokenAmount1),
                    ethers.utils.parseEther(liquidityTokenAmount2)
                );
             } else {
                await triggerAddLiquidity(
                    ethers.utils.parseEther(liquidityTokenAmount1),
                    ethers.utils.parseEther(liquidityTokenAmount2)
                );
             }
        } catch(error) {
            console.log(error);
        }
    }

    const checkAllowance = async (tokenAddress, owner, spender, amountToCompare) => {
        try {
            const allowance = await getAllowance({
                params: {
                    contractAddress: tokenAddress,
                    params: {
                        owner,
                        spender
                    }
                }
            });
            return allowance.gte(amountToCompare)
        } catch(error) {
            console.log(error);
        }
    }

    const requestApprovals = async (isToken1Approved, isToken2Approved, token1, token2, spender, amountToken1, amountToken2) => {
        try {
            if(!isToken1Approved) {
                await approve({
                    params: {
                        contractAddress: token1,
                        params: {
                            spender: spender,
                            value: amountToken1
                        }
                    }
                })

            }
            if(!isToken2Approved) {
                await approve({
                    params: {
                        contractAddress: token2,
                        params: {
                            spender: spender,
                            value: amountToken2
                        }
                    }
                })
            }
            await triggerAddLiquidity(amountToken1, amountToken2);
        } catch(error) {
            console.log(error)
        }
    }

    const triggerAddLiquidity = async (amountToken1, amountToken2) => {
        try {
            await addLiquidity({
                params: {
                    contractAddress: selectedPool,
                    params: {
                        amountToken1: amountToken1, amountToken2: amountToken2
                    }
                }
            })

        } catch(error) {
            console.log(error);
        }
    }

    const handleRemoveLiquidity = async () => {
        try {
            await removeLiquidity({
                params: {
                    contractAddress: selectedPool,
                    params: {
                        amountOfLiquidity: ethers.utils.parseEther(liquidityTokenAmountToRemove)                        
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div className="mt-8 p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Liquidity Pools</h2>
            { isWeb3Enabled && contractAddress != null ? (
                <div>
                    <p className="mb-4">Welcome, {account}!</p>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4" onClick={()=>{
                        setIsOpen(true)
                    }}>
                        Create Liquidity Pool
                    </button>
                    <div className="mb-4">
                        <label className="text-sm font-bold">Select Pool : {liquidityTokenName} </label>
                        <select value={selectedPool} onChange={(e) => {
                            setSelectedPool(e.target.value);
                        }} className="mt-1 p-2 border border-grey-300 rounded w-full">
                            {pools.map((pool) => {
                                return (
                                    <option key={pool} value={pool}>
                                        {pool}
                                    </option>
                                )                                
                            })}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="text-sm font-bold">
                            Liquidity : {token1Name}
                        </label>
                        <input
                            type="text"
                            onChange={(e) => {
                                setLiquidityTokenAmount1(e.target.value);
                            }}
                            value={liquidityTokenAmount1}
                            className="mt-1 p-2 border border-grey-300 rounded w-full"
                        ></input>
                    </div>
                    <div className="mb-4">
                        <label className="text-sm font-bold">
                            Liquidity : {token2Name}
                        </label>
                        <input
                            type="text"
                            onChange={(e) => {
                                setLiquidityTokenAmount2(e.target.value);
                            }}
                            value={liquidityTokenAmount2}
                            className="mt-1 p-2 border border-grey-300 rounded w-full"
                        ></input>
                    </div>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4" 
                        onClick={() => {
                            handleAddLiquidity()
                        }}
                    >
                        Add Liquidity
                    </button>
                    <p className="mb-4">
                        Liquidity Amount : {liquidityTokenAmount}
                    </p>
                    {
                        liquidityTokenAmount > 0 ?
                        (<div>
                            <div className="mb-4">
                                <label className="text-sm font-bold">
                                    Liquidity Token to Remove
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) => {
                                            setLiquidityTokenAmountToRemove(e.target.value)
                                    }}
                                    value={liquidityTokenAmountToRemove}
                                    className="mt-1 p-2 border border-grey-300 rounded w-full"
                                ></input>
                            </div>
                            <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mb-4" 
                                onClick={() => {
                                    handleRemoveLiquidity()
                                }}
                            >
                                Remove Liquidity
                            </button>
                        </div>)
                        : null
                    }
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