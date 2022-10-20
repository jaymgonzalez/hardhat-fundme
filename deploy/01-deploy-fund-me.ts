import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { developmentChains, networkConfig } from '../helper-hardhat.config'
import verify from '../utils/verify'

const deployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  let ethUsdPriceFeedAddress: string
  if (chainId == 31337) {
    const ethUsdAggregator = await get('MockV3Aggregator')
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
  }

  log('----------------------------------------------------')
  log('Deploying FundMe and waiting for confirmations...')

  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
  })

  log(`FundMe deployed at ${fundMe.address}`)

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress])
  }
  log('-------------------------------------------------')
}

export default deployFundMe
deployFundMe.tags = ['all', 'mocks']
