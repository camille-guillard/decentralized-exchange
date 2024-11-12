// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./LiquidityToken.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Pool {
    using Math for uint;

    address public token1;
    address public token2;
    uint256 public reserve1;
    uint256 public reserve2;
    // x*y = k
    uint256 public constantK;
    LiquidityToken public liquidityToken;

    error TransferringToken1Failed();
    error TransferringToken2Failed();
    error NotEnoughLiquidityToken();
    error NotTokensOfThePool();
    error AmountMustBeGreaterThan0();
    error ConstantformulaInconsistent();
    error InsufficientBalanceOfFromToken();
    error InsufficientBalanceOfToToken();
    error FromTokenIsNotATokenOfThePool();

    event Swap(
        address indexed sender,
        uint256 amountIn,
        uint256 amountOut,
        address tokenFrom,
        address tokenTo
    );

    constructor(address _token1, address _token2, string memory _liquidityTokenName, string memory _liquiditySymbol) {
        token1 = _token1;
        token2 = _token2;
        liquidityToken = new LiquidityToken(_liquidityTokenName, _liquiditySymbol);
    }

    function addLiquidity(uint256 amountToken1, uint256 amountToken2) external {
        // Calculating the number of liquidity to send to liquidity provider
        uint256 liquidity;
        uint256 totalSupplyLiquidityToken = liquidityToken.totalSupply();
        if(totalSupplyLiquidityToken == 0) {
            liquidity = (amountToken1 * amountToken2).sqrt();
        } else {
            liquidity = (amountToken1 * totalSupplyLiquidityToken / reserve1).min(amountToken2 * totalSupplyLiquidityToken / reserve2);
        }

        // Minting this amount to the liquidity provider
        liquidityToken.mint(msg.sender, liquidity);

        //Transferring token1 ans token2 into the liquidity pool
        require(IERC20(token1).transferFrom(msg.sender, address(this), amountToken1), TransferringToken1Failed());
        require(IERC20(token2).transferFrom(msg.sender, address(this), amountToken2), TransferringToken2Failed());

        // Updating the reserves
        reserve1 += amountToken1;
        reserve2 += amountToken2;
        updateConstantFormula();
    }

    function removeLiquidity(uint amountOfLiquidity) external {
        uint256 totalSupplyLiquidityToken = liquidityToken.totalSupply();

        // Checking
        uint256 balanceOfSender = liquidityToken.balanceOf(msg.sender);
        require(amountOfLiquidity <= balanceOfSender, NotEnoughLiquidityToken());

        // Burning liquidity token
        liquidityToken.burn(msg.sender, amountOfLiquidity);

        // Transferring token1 and token2 to the sender
        uint256 amountToken1 = (reserve1 * amountOfLiquidity) / totalSupplyLiquidityToken;
        uint256 amountToken2 = (reserve2 * amountOfLiquidity) / totalSupplyLiquidityToken;
        require(IERC20(token1).transfer(msg.sender, amountToken1), TransferringToken1Failed());
        require(IERC20(token2).transfer(msg.sender, amountToken2), TransferringToken2Failed());

        // Updating the reserves
        reserve1 -= amountToken1;
        reserve2 -= amountToken2;
        updateConstantFormula();
    }

    function swapTokens(address fromToken, address toToken, uint256 amountIn, uint256 amountOut) external {
        // Checking
        require(amountIn > 0 && amountOut > 0, AmountMustBeGreaterThan0());
        require((fromToken == token1 && toToken == token2) || (fromToken == token2 && toToken == token1), NotTokensOfThePool());
        IERC20 fromTokenContract = IERC20(fromToken);
        IERC20 toTokenContract = IERC20(toToken);
        require(fromTokenContract.balanceOf(msg.sender) >= amountIn, InsufficientBalanceOfFromToken());
        require(toTokenContract.balanceOf(address(this)) >= amountOut, InsufficientBalanceOfToToken());

        // Calculating expected amount
        uint256 expectedAmount;
        if(fromToken == token1) {
            expectedAmount = reserve2 - constantK / (reserve1 + amountIn);
        } else {
            expectedAmount = reserve1 - constantK / (reserve2 + amountIn);
        }
        require(amountOut <= expectedAmount, ConstantformulaInconsistent());

        //Performing the swap
        require(fromTokenContract.transferFrom(msg.sender, address(this), amountIn), InsufficientBalanceOfFromToken());
        require(toTokenContract.transfer(msg.sender, expectedAmount), InsufficientBalanceOfToToken());

        //Updating the reserves
        if(fromToken == token1) {
            reserve1 += amountIn;
            reserve2 -= expectedAmount;
        } else {
            reserve2 += amountIn;
            reserve1 -= expectedAmount;
        }
        updateConstantFormula();

        emit Swap(msg.sender, amountIn, expectedAmount, fromToken, toToken);
    }

    function updateConstantFormula() internal {
        constantK = reserve1 * reserve2;
        require(constantK > 0, ConstantformulaInconsistent());
    }

    function estimateOutputAmount(uint256 amountIn, address fromToken) public view returns (uint256 expectedAmount) {
        require(amountIn > 0, AmountMustBeGreaterThan0());
        require((fromToken == token1) || (fromToken == token2), FromTokenIsNotATokenOfThePool());

        if(fromToken == token1) {
            expectedAmount = reserve2 - constantK / (reserve1 + amountIn);
        } else {
            expectedAmount = reserve1 - constantK / (reserve2 + amountIn);
        }
    }
}