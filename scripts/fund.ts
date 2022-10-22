import { ethers } from 'hardhat'

async function main() {
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  const fundMe = await ethers.getContract('FundMe', deployer.address)
  console.log('FundMe contract...')
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther('0.1'),
  })
  await transactionResponse.wait(1)
  console.log('Funded!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
