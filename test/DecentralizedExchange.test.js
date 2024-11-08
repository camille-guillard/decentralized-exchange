const { expect } = require("chai");
const { ethers } = require("hardhat");

let token1Contract, token2Contract, token1Address, token2Address, dexContract, 
    poolContract, liquidityTokenContract, owner, addr1, addr2, addr3;

beforeEach(async function() {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken");
    token1Contract = await TestToken.connect(owner).deploy("token1", "T1");
    await token1Contract.waitForDeployment();
    token1Address = await token1Contract.getAddress();

    token2Contract = await TestToken.connect(owner).deploy("token2", "T2");
    await token2Contract.waitForDeployment();
    token2Address = await token2Contract.getAddress();

    const DecentralizedExchange = await ethers.getContractFactory("DecentralizedExchange");
    dexContract = await DecentralizedExchange.connect(owner).deploy();
    await token2Contract.waitForDeployment();

    await dexContract.createPairs(token1Address, token2Address, "TEST1", "TEST2");
    poolContract = await ethers.getContractAt("Pool", await dexContract.getPair(token1Contract, token2Contract));
    liquidityTokenContract = await ethers.getContractAt("LiquidityToken", await poolContract.liquidityToken());
});


describe("DecentralizedExchange - Initialization", function () {

    it("should init DecentralizedExchange contract", async function () {
        expect(token1Address).to.be.not.null;
        expect(token2Address).to.be.not.null;
        expect(await token1Contract.balanceOf(owner.address)).to.equal(10000000);
        expect(await token2Contract.balanceOf(owner.address)).to.equal(10000000);
        expect(poolContract).to.be.not.null;
        expect(liquidityTokenContract).to.be.not.null;
        expect(await liquidityTokenContract.name()).to.equal("Liquidity-TEST1-TEST2");
        expect(await liquidityTokenContract.symbol()).to.equal("LP-TEST1-TEST2");
    });

    it("should failed when a second pair of the same tokens is created", async function () {
        await expect(dexContract.createPairs(token1Address, token2Address, "TEST1", "TEST2")).to.be.revertedWithCustomError(dexContract, "PairAlreadyCreated");
    });

    it("should failed when a reserve pair is created", async function () {
        await expect(dexContract.createPairs(token2Address, token1Address, "TEST2", "TEST1")).to.be.revertedWithCustomError(dexContract, "PairAlreadyCreated");
    });

    it("should failed when a pair with the same tokens is created", async function () {
        await expect(dexContract.createPairs(token1Address, token1Address, "TEST1", "TEST1")).to.be.revertedWithCustomError(dexContract, "IdenticalAddressesAreNotAllowed");
    });
  
});

describe("DecentralizedExchange - Liquidity Pool", function () {

    it("should add liquidity to the pair token1/token2 pair", async function () {
        await token1Contract.approve(poolContract.getAddress(), 2000);
        await token2Contract.approve(poolContract.getAddress(), 1000);
        await poolContract.addLiquidity(2000, 1000);

        expect(await token1Contract.balanceOf(owner.address)).to.equal(9998000);
        expect(await token2Contract.balanceOf(owner.address)).to.equal(9999000);
        expect(await liquidityTokenContract.balanceOf(owner.address)).to.equal(1414);
        expect(await poolContract.reserve1()).to.equal(2000);
        expect(await poolContract.reserve2()).to.equal(1000);
        expect(await poolContract.constantK()).to.equal(2000000);

        await token1Contract.approve(poolContract.getAddress(), 100);
        await token2Contract.approve(poolContract.getAddress(), 100);
        await poolContract.addLiquidity(100, 100);

        expect(await token1Contract.balanceOf(owner.address)).to.equal(9997900);
        expect(await token2Contract.balanceOf(owner.address)).to.equal(9998900);
        expect(await liquidityTokenContract.balanceOf(owner.address)).to.equal(1484);
        expect(await poolContract.reserve1()).to.equal(2100);
        expect(await poolContract.reserve2()).to.equal(1100);
        expect(await poolContract.constantK()).to.equal(2310000);
    });

    it("should remove 100 liquidity tokens from the token1/token2 pair", async function () {
        await token1Contract.approve(poolContract.getAddress(), 2000);
        await token2Contract.approve(poolContract.getAddress(), 1000);
        await poolContract.addLiquidity(2000, 1000);

        await poolContract.removeLiquidity(100);

        expect(await token1Contract.balanceOf(owner.address)).to.equal(9998141);
        expect(await token2Contract.balanceOf(owner.address)).to.equal(9999070);
        expect(await liquidityTokenContract.balanceOf(owner.address)).to.equal(1314);
        expect(await poolContract.reserve1()).to.equal(1859);
        expect(await poolContract.reserve2()).to.equal(930);
        expect(await poolContract.constantK()).to.equal(1728870);
    });
  
});


describe("DecentralizedExchange - Liquidity Pool", function () {

    beforeEach(async function() {
        await token1Contract.approve(poolContract.getAddress(), 5000);
        await token2Contract.approve(poolContract.getAddress(), 5000);
        await poolContract.addLiquidity(5000, 5000);
    });

    it("should swap token1 to token2", async function () {
        await token1Contract.approve(poolContract.getAddress(), 1000);
        const expectedAmount = await poolContract.estimateOutputAmount(1000, token1Contract.getAddress());

        expect(await token1Contract.balanceOf(owner.address)).to.equal(9995000);
        expect(await token2Contract.balanceOf(owner.address)).to.equal(9995000);
        expect(await poolContract.reserve1()).to.equal(5000);
        expect(await poolContract.reserve2()).to.equal(5000);
        expect(await poolContract.constantK()).to.equal(25000000);

        await poolContract.swapTokens(token1Contract.getAddress(), token2Contract.getAddress(), 1000, expectedAmount);

        expect(await token1Contract.balanceOf(owner.address)).to.equal(9994000);
        expect(await token2Contract.balanceOf(owner.address)).to.equal(9995000n + expectedAmount);
        expect(await poolContract.reserve1()).to.equal(6000);
        expect(await poolContract.reserve2()).to.equal(5000n - expectedAmount);
        expect(await poolContract.constantK()).to.equal(6000n * (5000n - expectedAmount));
    });

    it("should failed if the user does not have enought token to swap", async function () {
        await token1Contract.approve(poolContract.getAddress(), 1000);
        const expectedAmount = await poolContract.estimateOutputAmount(1000, token1Contract.getAddress());
        
        await expect(poolContract.swapTokens(token1Contract.getAddress(), token2Contract.getAddress(), 10000000000000, expectedAmount)).to.be.revertedWithCustomError(poolContract, "InsufficientBalanceOfFromToken");
    });

    it("should failed if the pool does not have enought token to swap", async function () {
        await token1Contract.approve(poolContract.getAddress(), 6000);
        await expect(poolContract.swapTokens(token1Contract.getAddress(), token2Contract.getAddress(), 6000, 6000)).to.be.revertedWithCustomError(poolContract, "InsufficientBalanceOfToToken");
    });

    it("should failed if the user ask more token than expected", async function () {
        await token1Contract.approve(poolContract.getAddress(), 10);
        await expect(poolContract.swapTokens(token1Contract.getAddress(), token2Contract.getAddress(), 10, 5000)).to.be.revertedWithCustomError(poolContract, "ConstantformulaInconsistent");
    });

});
