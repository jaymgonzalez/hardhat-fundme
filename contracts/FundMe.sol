// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './PriceConverter.sol';

error FundMe__NotOwner();

/// @author Jay M Gonzalez
/// @title A crowfunding contract
/// @notice This contract is a demo to a sample funding contract
/// @dev This implements price feeds as out library
contract FundMe {
  using PriceConverter for uint256;

  uint256 public constant MINIMUM_USD = 50 * 1e18;

  address[] public s_funders;
  mapping(address => uint256) public s_addressToAmmountFunded;

  address public immutable i_owner;

  AggregatorV3Interface public s_priceFeed;

  modifier onlyOwner() {
    if (msg.sender != i_owner) {
      revert FundMe__NotOwner();
    }
    _;
  }

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }

  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      'Send me more honey b***!'
    );
    s_funders.push(msg.sender);
    s_addressToAmmountFunded[msg.sender] += msg.value;
  }

  function withdraw() public onlyOwner {
    for (uint256 i = 0; i < s_funders.length; i++) {
      address funder = s_funders[i];
      s_addressToAmmountFunded[funder] = 0;
    }

    s_funders = new address[](0);

    payable(msg.sender).transfer(address(this).balance);

    bool sendSuccess = payable(msg.sender).send(address(this).balance);
    require(sendSuccess, 'Send failed! :( ');

    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }('');
    require(callSuccess, 'Send failed! :( ');
  }

  function chaperWithdraw() public onlyOwner {
    address[] memory funders = s_funders;

    for (
      uint256 fundersIndex = 0;
      fundersIndex < funders.length;
      fundersIndex++
    ) {
      address funder = funders[fundersIndex];
      s_addressToAmmountFunded[funder] = 0;
    }

    s_funders = new address[](0);

    (bool sendSuccess, ) = i_owner.call{value: address(this).balance}('');
    require(sendSuccess, 'Send failed! :( ');
  }
}

// 4.50.25
