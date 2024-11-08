import { useState } from "react"

const CreateModal = ({isOpen, onClose, onConfirm}) => {
    const [token1Address, setToken1Address] = useState("");
    const [token2Address, setToken2Address] = useState("");
    const [token1Name, setToken1Name] = useState("");
    const [token2Name, setToken2Name] = useState("");

    return (
        <div className={`${isOpen ? "visible" : "invisible"} fixed inset-0`}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-6 rounded-md shadow-md">
                    <h2 className="text-xl font-bold mb-4">
                        Create Liquidity Pool
                    </h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">
                            Token 1 Address:{" "}
                        </label>
                        <input
                            className="mt-1 p-2 border boder-grey-300 rounded-md w-full"
                            value={token1Address}
                            type="text"
                            onChange={(e) => {
                                setToken1Address(e.target.value)
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">
                            Token 2 Address:{" "}
                        </label>
                        <input
                            className="mt-1 p-2 border boder-grey-300 rounded-md w-full"
                            value={token2Address}
                            type="text"
                            onChange={(e) => {
                                setToken2Address(e.target.value)
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">
                            Token 1 Name:{" "}
                        </label>
                        <input
                            className="mt-1 p-2 border boder-grey-300 rounded-md w-full"
                            value={token1Name}
                            type="text"
                            onChange={(e) => {
                                setToken1Name(e.target.value)
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">
                            Token 2 Name:{" "}
                        </label>
                        <input
                            className="mt-1 p-2 border boder-grey-300 rounded-md w-full"
                            value={token2Name}
                            type="text"
                            onChange={(e) => {
                                setToken2Name(e.target.value)
                            }}
                        />
                    </div>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mr-2"
                    onClick={()=>{
                        onConfirm(token1Address, token2Address, token1Name, token2Name)
                    }}>
                        Confirm
                    </button>
                    <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                    onClick={()=>{
                        onClose()
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateModal