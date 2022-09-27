import { network } from 'hardhat'
import { HardhatRuntimeEnvironment, NetworkConfig } from 'hardhat/types'
import { networkConfig, type networkConfigItem } from '../helper-hardhat.config'

export default async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const ethUsdPriceFeedAddress = networkConfig[chainId!].ethUsdPriceFeed

  console.log(ethUsdPriceFeedAddress)

  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
  })
}
