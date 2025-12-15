const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("AuctionDanishEngine", function () {
    let owner
    let seller
    let buyer
    let auct 

    this.beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners()

        const AuctionDanishEngine = await ethers.getContractFactory("AuctionDanishEngine", owner)
        auct = await AuctionDanishEngine.deploy()
        await auct.waitForDeployment()
    })

    it("sets owner", async function () {
        const currentOwner = await auct.owner()
        console.log(currentOwner)
        expect(currentOwner).to.eq(owner.address)
    })

    async function getTimestamp(bn) {
        return (
            await ethers.provider.getBlock(bn)
        ).timestamp
    }

    describe("createAction", function () {
        it("create auction correctly", async function () {
            const duration = 60
            const tx = await auct.createAuction(
                ethers.parseEther("0.0001"),
                3,
                "fake item",
                duration
            )

            const cAuction = await auct.auctions(0)
            expect(cAuction.item).to.eq("fake item")
            const ts = await getTimestamp(tx.blockNumber)
            expect(cAuction.endsAt).to.eq(ts + duration)
            console.log(cAuction)
        })

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
        }

        describe("buy", function() {
            it("allows to buy", async function() {
                await auct.connect(seller).createAuction(
                ethers.parseEther("0.0001"),
                3,
                "fake item",
                60
                )

                this.timeout(5000) // 5s
                await delay(1000)

                const buyTx = await auct.connect(buyer).
                buy(0, {value: ethers.parseEther("0.0001")})
                
                const cAuction = await auct.auctions(0)
                const finalPrice = cAuction.finalPrice

                const fee = (finalPrice * 10n) / 100n;
                const sellerGets = finalPrice - fee;
                
                await expect(() => buyTx).
                to.changeEtherBalance(
                    seller, sellerGets
                )

                await expect(buyTx)
                    .to.emit(auct, 'AuctionEnded')
                    .withArgs(0, finalPrice, buyer.address);

                await expect(
                   auct.connect(buyer).
                    buy(0, {value: ethers.parseEther("0.0001")}) 
                ).to.be.revertedWith('stopped!');
            })
        })
    })
})
