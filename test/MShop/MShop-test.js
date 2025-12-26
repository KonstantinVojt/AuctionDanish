// const { expect } = require("chai")
// const { ethers } = require("hardhat")
// const tokenJSON = require("../../artifacts/contracts/erc20/Erc.sol/MCSToken.json")

// describe("MShop", function () {
//     let owner
//     let buyer
//     let shop
//     let erc20


//     this.beforeEach(async function () {
//         [owner, buyer] = await ethers.getSigners()

//         const MShop = await ethers.getContractFactory("MShop", owner)
//         shop = await MShop.deploy()
//         await shop.waitForDeployment()

//         erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner)
//     })

//     it("should have an owner and a token", async function () {
//         const ownerAddress = await owner.getAddress()
//         expect(await shop.owner()).to.eq(ownerAddress)

//         expect(await shop.token()).to.be.properAddress
//     })

//     it("allows to buy", async function () {
//         const tokenAmount = 3

//         const shopAddress = await shop.getAddress()
//         const buyerAddress = await buyer.getAddress()

//         const txData = await buyer.sendTransaction({
//             value: tokenAmount,
//             to: shopAddress
//         })

//         expect(await erc20.balanceOf(buyerAddress)).to.eq(tokenAmount)
    
//         await expect(() => txData).
//             to.changeEtherBalance(shop, tokenAmount)

//         await expect(txData)
//             .to.emit(shop, "Bought")
//             .withArgs(tokenAmount, buyerAddress)
//     })

//     it("allows to sell", async function () {
        
//         const shopAddress = await shop.getAddress()
//         const buyerAddress = await buyer.getAddress()
        
//         const tx = await buyer.sendTransaction({
//             value: 3,
//             to: shopAddress
//         })

//         const sellAmount = 2

//         const approval = await erc20.connect(buyer).approve(shopAddress, sellAmount)
    
//         await approval.wait()

//         const sellTx = await shop.connect(buyer).sell(sellAmount)
    
//         expect(await erc20.balanceOf(buyerAddress)).to.eq(1)
    
//         await expect(() => sellTx).
//             to.changeEtherBalance(shop, -sellAmount)

//         await expect(sellTx)
//             .to.emit(shop, "Sold")
//             .withArgs(sellAmount, buyerAddress)
//     })

// })