import { HardhatRuntimeEnvironment } from 'hardhat/types'

export default async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccount, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccount()
  console.log('hi!')
  console.log(hre)
}
