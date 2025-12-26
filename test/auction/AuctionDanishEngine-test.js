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

        await auct.setStartingPriceLimits(
        ethers.parseEther("0.00001"),
        ethers.parseEther("10")
    )

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

        describe("buy", function () {
            it("allows to buy", async function () {
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
                ).to.be.revertedWithCustomError(auct, 'AuctionStopped');
            })
        })
    })

     /* ---------------------------------------------------------- */
    describe("cancelAuction", function () {

        beforeEach(async function () {
            await auct.connect(seller).createAuction(
                ethers.parseEther("0.01"),
                1,
                "item",
                100
            )
        })

        it("allows seller to cancel auction", async function () {
            await expect(
                auct.connect(seller).cancelAuction(0)
            ).to.emit(auct, "AuctionCancelled").withArgs(0)

            const auction = await auct.auctions(0)
            expect(auction.stopped).to.eq(true)
        })

        it("reverts if not seller", async function () {
            await expect(
                auct.connect(buyer).cancelAuction(0)
            ).to.be.revertedWithCustomError(auct, "NotSeller")
        })

        it("reverts if already stopped", async function () {
            await auct.connect(seller).cancelAuction(0)

            await expect(
                auct.connect(seller).cancelAuction(0)
            ).to.be.revertedWithCustomError(auct, "AuctionStopped")
        })
    })

    describe("withdrawFees", function () {

        beforeEach(async function () {
            await auct.connect(seller).createAuction(
                ethers.parseEther("1"),
                0,
                "item",
                100
            )

            await auct.connect(buyer).buy(0, {
                value: ethers.parseEther("1")
            })
        })

        it("allows owner to withdraw fees", async function () {
            const fee = ethers.parseEther("0.1")

            await expect(() =>
                auct.withdrawFees()
            ).to.changeEtherBalance(owner, fee)
        })

        it("reverts if no fees", async function () {
            await auct.withdrawFees()

            await expect(
                auct.withdrawFees()
            ).to.be.revertedWithCustomError(auct, "NoFeesToWithdraw")
        })

        it("reverts if not owner", async function () {
            await expect(
                auct.connect(buyer).withdrawFees()
            ).to.be.reverted
        })
    })

    describe("pause / unpause", function () {

        it("blocks buy when paused", async function () {
            await auct.connect(seller).createAuction(
                ethers.parseEther("0.01"),
                1,
                "item",
                100
            )

            await auct.pause()

            await expect(
                auct.connect(buyer).buy(0, { value: ethers.parseEther("0.01") })
            ).to.be.reverted
        })

        it("allows actions after unpause", async function () {
            await auct.pause()
            await auct.unpause()

            await expect(
                auct.connect(seller).createAuction(
                    ethers.parseEther("0.01"),
                    1,
                    "item",
                    100
                )
            ).to.not.be.reverted
        })
    })

    describe("getPriceFor", function () {

        it("returns decreasing price over time", async function () {
            await auct.connect(seller).createAuction(
                ethers.parseEther("1"),
                ethers.parseEther("0.01"),
                "item",
                100
            )

            const price1 = await auct.getPriceFor(0)
            await delay(10)
            const price2 = await auct.getPriceFor(0)

            expect(price2).to.be.lt(price1)
        })
    })


})
