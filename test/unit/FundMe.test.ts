import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { network, deployments, ethers } from 'hardhat'
import { developmentChains } from '../../helper-hardhat.config'
import { FundMe, MockV3Aggregator } from '../../typechain-types'

describe('FundMe', function () {
  let fundMe: FundMe
  let mockV3Aggregator: MockV3Aggregator
  let deployer: SignerWithAddress
  beforeEach(async () => {
    if (!developmentChains.includes(network.name)) {
      throw 'You need to be on a development chain to run tests'
    }
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    await deployments.fixture(['all'])
    fundMe = await ethers.getContract('FundMe')
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator')
  })

  describe('constructor', function () {
    it('sets the aggregator addresses correctly', async () => {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe('fund', function () {
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith('Send me more honey b***!')
    })

    it('It adds the sender address to the accounts array', async () => {})
  })
})
