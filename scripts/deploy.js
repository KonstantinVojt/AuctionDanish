const hre = require('hardhat')
const ethers = hre.ethers

async function main() {
    const [signer] = await ethers.getSigners()

    const Erc = await ethers.getContractFactory('MShop', signer)
    const erc = await Erc.deploy()
    const ercAddress = await erc.getAddress()
    await erc.waitForDeployment()
    console.log(ercAddress)
    console.log(await erc.token())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });