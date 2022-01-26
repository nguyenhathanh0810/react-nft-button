import { SALE_STATUSES } from './constants';

// require('dotenv').config();
// const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
// const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const alchemyKey = "https://eth-ropsten.alchemyapi.io/v2/nOmjNUVxHR1CpK_1rDRC2-Nf3xgeOqVK";
const contractAddress = "0x";
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(alchemyKey);
const ABI = require('../erc1155-sm-abi.json');

export async function initContract() {
	return;
	if (!window.contract) {
		window.contract = new web3.eth.Contract(ABI, contractAddress);
	}
}

export const connectWallet = async () => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({
				method: "eth_requestAccounts",
			});
			return {
				status: {
					type: "green",
					msg: "👏 Connected successfully. Your wallet is ready to mint."
				},
				address: addressArray[0]
			}
		} catch (err) {
			return {
				status: {
					type: "red",
					msg: "😥 " + err.message
				},
				address: ""
			}
		}
	} else {
		return {
			status: {
				type: "firebrick",
				msg: (
					<span>
						<p>
							{" "}
							🦊{" You must "}
							<a target="_blank" href={`https://metamask.io/download.html`}>
								install Metamask
							</a>
							{", a virtual Ethereum wallet, in yourbrowser."}
						</p>
					</span>
				)
			},
			address: ""
		}
	}
}

export const getCurrentConnectedWallet = async () => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({
				method: "eth_accounts"
			});
			if (addressArray.length > 0) {
				return {
					status: {
						type: "green",
						msg: "👏 Connected successfully. Your wallet is ready to mint."
					},
					address: addressArray[0]
				}
			} else {
				return {
					status: {
						type: "darkred",
						msg: "🦊 Connect to the Metamask to start minting"
					},
					address: addressArray[0]
				}
			}
		} catch (err) {
			
		}
	} else {
		return {
			status: {
				type: "",
				msg: ""
			},
			address: ""
		}
	}
}

export const addWalletListener = (props) => {
	const { addressChangeHandler, statusChangeHandler } = props;
	if (typeof addressChangeHandler !== "function" || typeof statusChangeHandler !== "function") {
		return;
	}
	if (!window.ethereum) {
		return;
	}
	window.ethereum.on("accountsChanged", (accounts) => {
		if (accounts.length > 0) {
			addressChangeHandler(accounts[0]);
			statusChangeHandler({
				type: "green",
				msg: "🌀 Account switched."
			})
		}
	})
}

export async function getSaleStatus() {
	return SALE_STATUSES.ON;
	const params = {
		to: contractAddress,
		from: window.ethereum.selectedAddress,
		'data': window.contract.methods
			.status()
			.encodeABI()
	}
	return await window.ethereum.request({
		method: "eth_sendTransaction",
		params: [params]
	});
}

export async function mintOnSale(tokenCount) {
	$logger.error("⁉️ Contract is missing");
	return { success: false, status: { msg: "⁉️ Contract is missing"} };
	if (SALE_STATUSES.ON != getSaleStatus()) {
		return {
			success: false,
      status: {
				type: "darkred",
				msg: "The sale is off. Let's get back later 👐",
			}
		};
	}
	const params = {
		to: contractAddress,
		from: window.ethereum.selectedAddress,
		'data': window.contract.methods
			.mintTokenOnSale(tokenCount)
			.encodeABI()
	}
	try {
		const txHash = await window.ethereum.request({
			method: "eth_sendTransaction",
			params: [params]
		});
		return {
			success: true,
			status: {
				type: "green",
				msg: `${txHash}`
			}
		}
	} catch (err) {
		return {
			success: false,
      status: {
				type: "red",
				msg: "😥 Something went wrong: " + err.message,
			}
		}
	}
}

const $logger = (() => {
	return {
		error: (...msgs) => {
			if (document.designMode !== "on") {
				return;
			}
			console.error(...msgs);
		},
		info: (...msgs) => {
			if (document.designMode !== "on") {
				return;
			}
			console.log(...msgs);
		},
		warn: (...msgs) => {
			if (document.designMode !== "on") {
				return;
			}
			console.warn(...msgs);
		},
	};
})();