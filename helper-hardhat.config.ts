export interface networkConfigItem {
  blockConfirmations?: number
  ethUsdPriceFeed?: string
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  goerli: {
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    blockConfirmations: 5,
  },
  polygon: {
    ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    blockConfirmations: 5,
  },
}

export const developmentChains = ['hardhat', 'localhost']
