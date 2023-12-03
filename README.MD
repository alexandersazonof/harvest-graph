# Harvest sub graph 

## Documentation

### Logic for Storage -StorageListener.ts
- **SetControllerCall** - Create contreoller

### Logic for Controller - ControllerListener.ts
- **SharePriceChangeLog** - Create sharePrice, APY autocompound, Vault History
- **AddVaultAndStrategyCall** - Create vault and strategy

### Logic for Vault - VaultListener.ts
- **Transfer** - Create TVL for all vaults, create user balance history only not FARM contract(0xa0246c9032bc3a600820415ae600c6388619a14d , 0x1571ed0bed4d987fe2b498ddbae7dfa19519f651 , 0x25550cccbd68533fa04bfd3e3ac4d09f9e00fc50)

### Logic for PotPool - PotPoolListener.ts
- **RewardAdded** - Create rewards and APY rewards

### Logic for NoMintPool - NoMintPoolListener.ts
- **RewardAdded** - Create rewards and APY rewards

### Logic for Autostake - AutoStakeListener.ts
- **Staked** - Create user balance history and TVL
- **Withdrawn** - Create user balance history and TVL


### We don't save APY more 1000%

### User balance history:
- **Pool Balance** = pool balance / (10 ^ decimals)
- **User Balance** = vault balance / (10 ^ decimals)
- **Value** = pool balance + vault balance


## Setup

- Install dependencies `yarn install` 
- Deploy on local machine `graph create --node http://localhost:8020/ harvest-graph`
- Run tests `graph test`


## Queries

For query use this urls:
<https://api.thegraph.com/subgraphs/id/{id}>
#### ID you can take from dashboard

- **Ethereum** - https://thegraph.com/hosted-service/subgraph/harvestfi/harvest-finance
- **Polygon** - https://thegraph.com/hosted-service/subgraph/harvestfi/harvest-finance-polygon
- **Arbitrum** - https://thegraph.com/hosted-service/subgraph/harvestfi/harvest-finance-arbitrum


### Get all vaults
    {
        vaults {
            id
            name
            pool {
                id
            }
            strategy {
                id
            }
            underlying {
                id
                name
                symbol
            }
            decimal
            createAtBlock
            timestamp
        }
    }

### Get last tvl by vault address
- Example for **FARM_USDC**: 0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe
- Please, use all addresses in **lowercase**

###
    {
        tvls(
            where: {vault: "0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe"}
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            value
            totalSupply
            sharePriceDivDecimal
            createAtBlock
        }
    }


- `value` - TVL in usd
- `sharePriceDivDecimal` - `sharePrice` / (10 ** `decimal`)

### Get last apy by vault address

    {
        apyRewards(
            first: 1,
            where: {vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"}
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }

        apyAutoCompounds(
            first: 1,
            where: {vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"}
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }
    }

### Get first 100 last apy by vault address, in timestamp from 11/09/2022 @ 1:15pm to 11/09/2022 @ 1:15pm


    {
        apyRewards(
            first: 100,
            where: {
                timestamp_gte: "1648059270",
                timestamp_lte: "1667999735",
                vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"
            }
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }

        apyAutoCompounds(
            first: 100,
            where: {
                timestamp_gte: "1648059270",
                timestamp_lte: "1667999735",
                vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"
            }
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }
    }
