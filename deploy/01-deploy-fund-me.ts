import { network } from 'hardhat'
import { HardhatRuntimeEnvironment, NetworkConfig } from 'hardhat/types'
import { networkConfig, type networkConfigItem } from '../helper-hardhat.config'


export default async function(hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccount, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccount()
  const chainId = network.config.chainId
  // const ethUsdPriceFeedAddress: string = networkConfig[network.name].ethUsdPriceFeed!

  // console.log(ethUsdPriceFeedAddress);
  

  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [],
    log: true
  })
}
