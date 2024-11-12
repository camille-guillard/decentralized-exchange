import { useMoralis, useWeb3Contract } from "react-moralis"
import { dexAbi, poolAbi, tokenAbi, dexAddresses } from "../constants/dex-constants"
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Swap = () => {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const [pools, setPools] = useState([])
    const [selectedPool, setSelectedPool] = useState("");
    const [token1Address, setToken1Address] = useState("");
    const [token2Address, setToken2Address] = useState("");
    const [liquidityTokenName, setLiquidityTokenName] = useState("");
    const [token1Name, setToken1Name] = useState("");
    const [token2Name, setToken2Name] = useState("");
    const [amountIn, setAmountIn] = useState("0");
    const [amountOut, setAmountOut] = useState("0");
    const [tokens, setTokens] = useState([]);
    const [balanceOfToken1, setBalanceOfToken1] = useState("0");
    const [balanceOfToken2, setBalanceOfToken2] = useState("0");
    const [lpBalanceOfToken1, setLpBalanceOfToken1] = useState("0");
    const [lpBalanceOfToken2, setLpBalanceOfToken2] = useState("0");

    const contractAddress = parseInt(chainIdHex) in dexAddresses ? dexAddresses[parseInt(chainIdHex)].dex : null;

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
            const retrieveTokens = async () => {
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
                const liquidityTokenAddress = await liquidityToken({
                    params: {
                        contractAddress: selectedPool
                    }
                });
                const liquidityTokenName = await getTokenName({
                    params: {
                        contractAddress: liquidityTokenAddress
                    }
                });
                setLiquidityTokenName(liquidityTokenName);
                setToken1Address(token1);
                setToken2Address(token2);
                setTokens([token1, token2]);
            }
            retrieveTokens();
        }
    }, [selectedPool]);

    useEffect(() => {
        if(selectedPool) {
            const retrieveTokens = async () => {
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
            }
            retrieveTokens();
        }
    }, [token1Address]);

    useEffect(() => {
        if(token1Address) {
            const fetchTokensBalance = async () => {
                const token1Balance = await balanceOf({
                    params: {
                        contractAddress: token1Address,
                        params: {
                            account
                        }
                    }
                });
                const token2Balance = await balanceOf({
                    params: {
                        contractAddress: token2Address,
                        params: {
                            account
                        }
                    }
                });
                const lpToken1Balance = await balanceOf({
                    params: {
                        contractAddress: token1Address,
                        params: {
                            account : selectedPool
                        }
                    }
                });
                const lpToken2Balance = await balanceOf({
                    params: {
                        contractAddress: token2Address,
                        params: {
                            account : selectedPool
                        }
                    }
                });
                setBalanceOfToken1(ethers.utils.formatEther(token1Balance));
                setBalanceOfToken2(ethers.utils.formatEther(token2Balance));
                setLpBalanceOfToken1(ethers.utils.formatEther(lpToken1Balance));
                setLpBalanceOfToken2(ethers.utils.formatEther(lpToken2Balance));
            }
            fetchTokensBalance();
        }
    }, [token1Address]);

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
    
    const { runContractFunction : estimateOutputAmount } = useWeb3Contract({
        abi: poolAbi,
        functionName: "estimateOutputAmount"
    });

    const { runContractFunction : swapTokens } = useWeb3Contract({
        abi: poolAbi,
        functionName: "swapTokens"
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

    const handleSwap = async () => {
        try {
            const isToken1Approved = await checkAllowance(
                token1Address,
                account,
                selectedPool,
                ethers.utils.parseEther(amountIn)
            );
            if(!isToken1Approved) {
                await requestApprovals(
                    isToken1Approved,
                    token1Address,
                    selectedPool,
                    ethers.utils.parseEther(amountIn)
                );
            } else {
                await triggerSwap();
             }
        } catch(error) {

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

    const requestApprovals = async (isToken1Approved, token1, spender, amountToken1) => {
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
        
            await triggerSwap();
        } catch(error) {
            console.log(error)
        }
    }

    const triggerSwap = async () => {
        try {
            await swapTokens({
                params: {
                    contractAddress: selectedPool,
                    params: {
                        fromToken: token1Address, 
                        toToken: token2Address,
                        amountIn: ethers.utils.parseEther(amountIn),
                        amountOut: ethers.utils.parseEther(amountOut)
                    }
                }
            })
        } catch(error) {
            console.log(error);
        }
    }

    return (
        <div className="mt-8 p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Swap</h2>
            { isWeb3Enabled && contractAddress != null ? (
                <div>
                    <p className="mb-4">Welcome, {account}!</p>
                    <div className="mb-4">
                        <label className="text-sm font-bold">Select Pool : {liquidityTokenName}</label>
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
                            From : {token1Name}
                        </label>
                        <select
                            onChange={(e) => {
                                if(tokens && tokens.length > 0) {
                                    setToken1Address(e.target.value);
                                    if(tokens[0] == e.target.value) {
                                        setToken2Address(tokens[1]);
                                    } else {
                                        setToken2Address(tokens[0]);
                                    }
                                }
                            }}
                            value={token1Address}
                            className="mt-1 p-2 border border-grey-300 rounded w-full"
                        >
                            { tokens.map((token) => {
                                return (
                                    <option key={token} value={token}>{token}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="text-sm font-bold">
                            To : {token2Name}
                        </label>
                        <select
                            value={token2Address}
                            disabled={true}
                            className="mt-1 p-2 border border-grey-300 rounded w-full"
                        >
                            { tokens.map((token) => {
                                return (
                                    <option key={token} value={token}>{token}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="text-sm font-bold">
                            Amount in :
                        </label>
                        <input
                            type="text"
                            value={amountIn}
                            onChange={async (e) => {
                                setAmountIn(e.target.value);
                                if(e.target.value > 0 && selectedPool) {
                                    const estimateAmount = await estimateOutputAmount ({
                                        params: {
                                            contractAddress: selectedPool,
                                            params: {
                                                amountIn: ethers.utils.parseEther(e.target.value),
                                                fromToken: token1Address
                                            }
                                        }
                                    });
                                    setAmountOut(ethers.utils.formatEther(estimateAmount));
                                } else {
                                    setAmountOut("0");
                                }
                            }}
                            className="mt-1 p-2 border border-grey-300 rounded w-full"
                        ></input>
                    </div>
                    <div className="mb-4">
                        <label className="text-sm font-bold">
                            Amount out :
                        </label>
                        <input
                            type="text"
                            value={amountOut}
                            disabled={true}
                            className="mt-1 p-2 border border-grey-300 rounded w-full"
                        ></input>
                    </div>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4" 
                        onClick={() => {
                            handleSwap()
                        }}
                    >
                        Swap
                    </button>
                    <div className="mb-4">
                        <p className="text-sm font-bold">Token 1 Balance : {balanceOfToken1}</p>
                        <p className="text-sm font-bold">Token 2 Balance : {balanceOfToken2}</p>
                        <p className="text-sm font-bold">Liquidity Pool Token 1 Balance : {lpBalanceOfToken1}</p>
                        <p className="text-sm font-bold">Liquidity Pool Token 2 Balance : {lpBalanceOfToken2}</p>

                    </div>
                </div>
            ) : (
                <div>Please log in!</div>
            )}

        </div>
    )
}

export default Swap;