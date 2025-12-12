// const { expect } = require("chai")
// const { ethers } = require("hardhat")

// describe("Payments", function () {
//     let acc1
//     let acc2
//     let payments

//     beforeEach(async function(){
//         [acc1, acc2] = await ethers.getSigners()
//         const Payments = await ethers.getContractFactory("Payments", acc1)
//         payments = await Payments.deploy()
//         await payments.waitForDeployment()
//     })

// it("should be deployed", async function() {
//     expect(await payments.target).to.be.properAddress
//     // console.log('success!')
// })

// it("should have 0 ether by default", async function() {
//     const balance = await payments.currentBalance()
//     console.log(balance)
//     expect(balance).to.eq(0)
// })

// it ("should be possible to send fuds", async function() {
//     const sum = 100
//     const msg = "hello from hardhat"
//     const tx = await payments.connect(acc2).pay(msg, {value: 100})


//     await expect(() => tx)
//         .to.changeEtherBalances([acc2, payments], [-sum, sum])

//     await tx.wait()

//     const newPayment = await payments.getPayment(acc2.address, 0)
//     expect(newPayment.message).to.eq(msg)
//     expect(newPayment.amount).to.eq(sum)
//     expect(newPayment.from).to.eq(acc2.address)
//     // console.log(newPayment)
// })

// })