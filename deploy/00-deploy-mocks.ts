import { network } from 'hardhat'
import { HardhatRuntimeEnvironment, NetworkConfig } from 'hardhat/types'
import { networkConfig, type networkConfigItem } from '../helper-hardhat.config'
import { developmentChains } from '../helper-hardhat.config'

const DECIMALS = '18'
const INITIAL_PRICE = '2000000000000000000000' // 2000

const deployMocks = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  // const chainId: number = network?.config?.chainId!

  if (developmentChains.includes(network.name)) {
    log('Local network detected! Deploying mocks...')
    await deploy('MockV3Aggregator', {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    })
    log('Mocks deployed')
    log('---------------------------------------------------------')
  }
}

export default deployMocks
deployMocks.tags = ['all', 'mocks']
