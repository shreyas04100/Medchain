async function main() {
  const MedicalVault = await ethers.getContractFactory('MedicalVault');
  const vault = await MedicalVault.deploy();
  await vault.waitForDeployment();
  console.log('MedicalVault deployed to:', await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
