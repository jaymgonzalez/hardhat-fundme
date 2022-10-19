import { network } from 'hardhat'
import { HardhatRuntimeEnvironment, NetworkConfig } from 'hardhat/types'
import { developmentChains, networkConfig } from '../helper-hardhat.config'
import verify from '../utils/verify'

const deployFundMe = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = get('MockV3Aggregator')
    ethUsdPriceFeedAddress = (await ethUsdAggregator).address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId!].ethUsdPriceFeed
  }

  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
  }
  log('-------------------------------------------------')
}

export default deployFundMe
deployFundMe.tags = ['all', 'mocks']
