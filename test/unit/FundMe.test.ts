import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { network, deployments, ethers } from 'hardhat'
import { developmentChains } from '../../helper-hardhat.config'
import { FundMe, MockV3Aggregator } from '../../typechain-types'

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', function () {
      let fundMe: FundMe
      let mockV3Aggregator: MockV3Aggregator
      let deployer: SignerWithAddress

      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(['all'])
        fundMe = await ethers.getContract('FundMe')
        mockV3Aggregator = await ethers.getContract('MockV3Aggregator')
      })

      describe('constructor', function () {
        it('Sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe('fund', function () {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            'FundMe__NotEnoughFunds'
          )
        })
        it('Updates the amount funded data structure', async () => {
          await fundMe.fund({ value: ethers.utils.parseEther('1') })
          const response = await fundMe.getAddressToAmountFunded(
            deployer.address
          )
          assert.equal(
            response.toString(),
            ethers.utils.parseEther('1').toString()
          )
        })
        it('It adds the sender address to funders array', async () => {
          await fundMe.fund({ value: ethers.utils.parseEther('1') })
          const funder = await fundMe.getFunder(0)
          assert.equal(funder, deployer.address)
        })
      })

      describe('withdraw', function () {
        beforeEach(async () => {
          await fundMe.fund({ value: ethers.utils.parseEther('1') })
        })
        it('Withdraw ETH from a single funder', async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          assert.equal(endingFundMeBalance.toString(), '0')
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          )
        })
        it('Withdraw cheaper single funder', async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          const transactionResponse = await fundMe.chaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          assert.equal(endingFundMeBalance.toString(), '0')
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          )
        })
        it('Only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]

          const attackerConnnectedContract = fundMe.connect(attacker)
          await expect(
            attackerConnnectedContract.withdraw()
          ).to.be.revertedWith('FundMe__NotOwner')
        })
        it('Withdraw ETH from multiple funder', async () => {
          const accounts = await ethers.getSigners()

          await fundMe
            .connect(accounts[1])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[2])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[3])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[4])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[5])
            .fund({ value: ethers.utils.parseEther('1') })

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          const transactionResponse = await fundMe.chaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          assert.equal(endingFundMeBalance.toString(), '0')
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          )

          await expect(fundMe.getFunder(0)).to.be.reverted

          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[1].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[2].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[3].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[4].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[5].address)
            ).toString(),
            '0'
          )
        })
        it('Testing cheaperWithdraw...', async () => {
          const accounts = await ethers.getSigners()

          await fundMe
            .connect(accounts[1])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[2])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[3])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[4])
            .fund({ value: ethers.utils.parseEther('1') })
          await fundMe
            .connect(accounts[5])
            .fund({ value: ethers.utils.parseEther('1') })

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          assert.equal(endingFundMeBalance.toString(), '0')
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          )

          await expect(fundMe.getFunder(0)).to.be.reverted

          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[1].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[2].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[3].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[4].address)
            ).toString(),
            '0'
          )
          assert.equal(
            (
              await fundMe.getAddressToAmountFunded(accounts[5].address)
            ).toString(),
            '0'
          )
        })
      })
    })
