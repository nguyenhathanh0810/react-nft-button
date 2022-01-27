# NFT BUTTON
## Requirements
- NodeJS >= v14.18.3
- ReactJS: v17.0.2

## Dependencies
- `react-scripts`: 4.0.3
- `dotenv`: latest version
- `@alch/alchemy-web3`: 1.0.1

## How to use

1. Clone this directory to your local repo
2. Copy/paste the following files and folders to your project root directory:
    - `components/*`
    - `utils/*`
    - `Minter.js`
3. Access to the [Alchemy Website](https://www.alchemy.com), sign-up if you haven't had an account, then create an application as instructed.
4. After the app is created successfully with the proper settings to your need, you will able to get an ALCHEMY_KEY which will be use to manage the contract later on.
5. In the page/component you want to use the Minter:
    ```
    import Minter from "./components/Minter";

    return (

        ...

        <Minter />

        ...
        
    )

    ```
6. Before you start the application, make sure to put the ALCHEMY_KEY, and contract address to `.env` as:
    ```
    REACT_APP_ALCHEMY_KEY=<Your-Alchemy-Key>
    REACT_APP_CONTRACT_ADDRESS=<Your-Contract-Address>
    ```
