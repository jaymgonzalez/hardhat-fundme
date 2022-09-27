// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './PriceConverter.sol';

error NotOwner();

// 901207
// 881660
contract FundMe {
  using PriceConverter for uint256;

  uint256 public constant MINIMUM_USD = 50 * 1e18;
  // 21393
  // 23471

  address[] public funders;
  mapping(address => uint256) public addressToAmmountFunded;

  address public immutable i_owner;

  AggregatorV3Interface public priceFeed;

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  // 21508
  // 23600
  function fund() public payable {
    require(
      msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
      'Send me more honey b***!'
    );
    funders.push(msg.sender);
    addressToAmmountFunded[msg.sender] += msg.value;
  }

  function withdraw() public onlyOwner {
    for (uint256 i = 0; i < funders.length; i++) {
      address funder = funders[i];
      addressToAmmountFunded[funder] = 0;
    }

    funders = new address[](0);

    payable(msg.sender).transfer(address(this).balance);

    bool sendSuccess = payable(msg.sender).send(address(this).balance);
    require(sendSuccess, 'Send failed! :( ');

    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }('');
    require(callSuccess, 'Send failed! :( ');
  }

  modifier onlyOwner() {
    if (msg.sender != i_owner) {
      revert NotOwner();
    }
    _;
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }
}

// 4.50.25
