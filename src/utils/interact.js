import { SALE_STATUSES } from './constants';

require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
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
					type: "darkgreen",
					msg: "👏 Connected successfully. Your wallet is ready to mint."
				},
				address: addressArray[0]
			}
		} catch (err) {
			return {
				status: {
					type: "crimson",
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
						type: "darkgreen",
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
					address: ""
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
				type: "darkgreen",
				msg: "Switched to using " + accounts[0]
			});
		}
	});
}

export async function getSaleStatus() {
	return SALE_STATUSES.ON;
	return await window.contract.methods.status().call();
	// const params = {
	// 	to: contractAddress,
	// 	from: window.ethereum.selectedAddress,
	// 	'data': window.contract.methods
	// 		.status()
	// 		.encodeABI()
	// }
	// return await window.ethereum.request({
	// 	method: "eth_sendTransaction",
	// 	params: [params]
	// });
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
	const price = await window.contract.methods.price().call();
	const BN = web3.utils.BN;
	const params = {
		value: (new BN(price)).mul(new BN(tokenCount)),
		to: contractAddress,
		from: window.ethereum.selectedAddress,
		'data': window.contract.methods
			.mintTokenOnSale(tokenCount)
			.encodeABI()
	}
	try {
		const gasEstimate = await window.ethereum.request({
			method: "eth_estimateGas",
			params: [params]
		});
		params['gas'] = new BN(gasEstimate);
		const txHash = await window.ethereum.request({
			method: "eth_sendTransaction",
			params: [params]
		});
		return {
			success: true,
			status: {
				type: "darkgreen",
				msg: `DONE 🎉 Check you transaction at ${txHash}`
			}
		}
	} catch (err) {
		return {
			success: false,
      status: {
				type: "crimson",
				msg: "😥 Something went wrong: " + err.message,
			}
		}
	}
}

export async function mintOnPreSale(tokenCount) {
	$logger.error("⁉️ Contract is missing");
	return { success: false, status: { msg: "⁉️ Contract is missing"} };
	if (!SALE_STATUSES.PRE !== getSaleStatus()) {
		return {
			success: false,
      status: {
				type: "darkred",
				msg: "It's not time for Pre Sale",
			}
		};
	}
	const price = await window.contract.methods.price().call();
	const BN = web3.utils.BN;
	const params = {
		value: (new BN(price)).mul(new BN(tokenCount)),
		to: contractAddress,
		from: window.ethereum.selectedAddress,
		'data': window.contract.methods
			.mintTokenOnPreSale(tokenCount)
			.encodeABI()
	}
	try {
		const gasEstimate = await window.ethereum.request({
			method: "eth_estimateGas",
			params: [params]
		});
		params['gas'] = new BN(gasEstimate);
		const txHash = await window.ethereum.request({
			method: "eth_sendTransaction",
			params: [params]
		});
		return {
			success: true,
			status: {
				type: "darkgreen",
				msg: `DONE 🎉 Check you transaction at ${txHash}`
			}
		}
	} catch (err) {
		return {
			success: false,
      status: {
				type: "crimson",
				msg: err.message,
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