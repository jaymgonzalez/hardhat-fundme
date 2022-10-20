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
    it('updates the amount funded data structure', async () => {
      await fundMe.fund({ value: ethers.utils.parseEther('1') })
      const response = await fundMe.addressToAmmountFunded(deployer.address)
      assert.equal(response.toString(), ethers.utils.parseEther('1').toString())
    })

    it('It adds the sender address to funders array', async () => {
      await fundMe.fund({ value: ethers.utils.parseEther('1') })
      const funder = await fundMe.funders(0)
      assert.equal(funder, deployer.address)
    })
  })
})
