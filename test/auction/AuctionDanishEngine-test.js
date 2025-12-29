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

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
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


        it("reverts if starting price too low for discount rate", async function () {
            await expect(
                auct.connect(seller).createAuction(
                    ethers.parseEther("1"), // startingPrice
                    ethers.parseEther("0.02"), // discountRate
                    "item",
                    100 // duration
                )
            ).to.be.revertedWithCustomError(auct, "IncorrectStartingPrice");
        });

        it("reverts if starting price below minimum", async function () {
            await expect(
                auct.connect(seller).createAuction(
                    ethers.parseEther("0.000001"), // меньше min
                    0,
                    "item",
                    100
                )
            ).to.be.revertedWithCustomError(auct, "StartingPriceOutOfRange");
        });

        it("reverts if starting price above maximum", async function () {
            await expect(
                auct.connect(seller).createAuction(
                    ethers.parseEther("1000"), // больше max
                    0,
                    "item",
                    100
                )
            ).to.be.revertedWithCustomError(auct, "StartingPriceOutOfRange");
        });

        it("uses default duration when duration is zero", async function () {
            const tx = await auct.connect(seller).createAuction(
                ethers.parseEther("0.01"),
                0,
                "item",
                0 // ← ВАЖНО
            );
        
            const ts = (await ethers.provider.getBlock(tx.blockNumber)).timestamp;
            const auction = await auct.auctions(0);
        
            expect(auction.endsAt).to.eq(ts + 2 * 24 * 60 * 60);
        });

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

            it("reverts if auction already ended", async function () {
                await auct.connect(seller).createAuction(
                    ethers.parseEther("0.01"),
                    0,
                    "item",
                    1 // 1 second duration
                );
            
                // перематываем время
                await ethers.provider.send("evm_increaseTime", [2]);
                await ethers.provider.send("evm_mine");
            
                await expect(
                    auct.connect(buyer).buy(0, {
                        value: ethers.parseEther("0.01")
                    })
                ).to.be.revertedWithCustomError(auct, "AuctionAlreadyEnded");
            });

            it("reverts if not enough funds sent", async function () {
                await auct.connect(seller).createAuction(
                    ethers.parseEther("1"),
                    0,
                    "item",
                    100
                );
            
                await expect(
                    auct.connect(buyer).buy(0, {
                        value: ethers.parseEther("0.5")
                    })
                ).to.be.revertedWithCustomError(auct, "NotEnoughFunds");
            });

            it("refunds excess ETH to buyer", async function () {
                await auct.connect(seller).createAuction(
                    ethers.parseEther("1"),
                    0,
                    "item",
                    100
                );
            
                await expect(() =>
                    auct.connect(buyer).buy(0, {
                        value: ethers.parseEther("2")
                    })
                ).to.changeEtherBalance(
                    buyer,
                    ethers.parseEther("-1")
                );
            });
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

        it("reverts if auction already ended", async function () {
            const tx = await auct.connect(seller).createAuction(
                ethers.parseEther("0.01"),
                0,
                "item",
                10 // 10 секунд
            );
        
            const auction = await auct.auctions(0);
            console.log("endsAt:", auction.endsAt.toString());
        
            // устанавливаем следующий блок прямо после окончания аукциона
            await ethers.provider.send("evm_setNextBlockTimestamp", [Number(auction.endsAt) + 1]);
            await ethers.provider.send("evm_mine");
        
            await expect(
                auct.connect(seller).cancelAuction(0)
            ).to.be.revertedWithCustomError(auct, "AuctionAlreadyEnded");
        });



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

        it("reverts if transfer fails (success == false)", async function () {
            // Деплой mock-контракта, который всегда revert при получении ETH
            const RevertingReceiver = await ethers.getContractFactory("RevertingReceiver");
            const receiver = await RevertingReceiver.deploy();
            await receiver.waitForDeployment();
        
            // НЕ вызываем buy снова! Используем комиссию из beforeEach
        
            // Передаём ownership контракту, который не принимает ETH
            await auct.transferOwnership(receiver.target);
        
            // Проверяем, что withdrawFees revert из-за failure
            await expect(
                receiver.withdraw(auct.target)
            ).to.be.reverted; // revert из-за require(success)
        });
    })

    describe("setStartingPriceLimits", function () {

        it("reverts if not owner", async function () {
            await expect(
                auct.connect(buyer).setStartingPriceLimits(
                    ethers.parseEther("0.1"),
                    ethers.parseEther("1")
                )
            ).to.be.reverted;
        });

        it("reverts if min > max", async function () {
            await expect(
                auct.setStartingPriceLimits(
                    ethers.parseEther("1"),
                    ethers.parseEther("0.1")
                )
            ).to.be.revertedWithCustomError(auct, "InvalidPriceLimits")
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

        it("reverts createAuction when paused", async function () {
            await auct.pause();

            await expect(
                auct.connect(seller).createAuction(
                    ethers.parseEther("0.01"),
                    1,
                    "item",
                    100
                )
            ).to.be.reverted;
        });

        it("owner can pause", async function () {
            await expect(
                auct.pause()
            ).to.not.be.reverted;
        });
    
        it("owner can unpause", async function () {
            await auct.pause();
        
            await expect(
                auct.unpause()
            ).to.not.be.reverted;
        });

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

        it("reverts pause if not owner", async function () {
            await expect(
                auct.connect(buyer).pause()
            ).to.be.reverted;
        });

        it("reverts unpause if not owner", async function () {
            await expect(
                auct.connect(buyer).unpause()
            ).to.be.reverted;
        });
    })

    describe("getPriceFor", function () {

        it("returns decreasing price over time", async function () {
            await auct.connect(seller).createAuction(
                ethers.parseEther("1"),
                ethers.parseEther("0.01"),
                "item",
                100
            )
            1000000000000000000
            1000000000000000000
            const price1 = await auct.getPriceFor(0)
            await ethers.provider.send("evm_increaseTime", [50]);
            await ethers.provider.send("evm_mine", []);
            const price2 = await auct.getPriceFor(0)

            expect(price2).to.be.lt(price1)
        })
    })


})
