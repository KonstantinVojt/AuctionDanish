const hre = require("hardhat");

async function main() {
  const AuctionDanishEngine = await hre.ethers.getContractFactory(
    "AuctionDanishEngine"
  );

  const auction = await AuctionDanishEngine.deploy();

  await auction.waitForDeployment();

  console.log(
    "AuctionDanishEngine deployed to:",
    await auction.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
