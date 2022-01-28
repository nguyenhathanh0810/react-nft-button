import { useEffect, useState } from "react";
import {
	addWalletListener,
	connectWallet,
	getCurrentConnectedWallet,
	getSaleStatus,
	getTotalSupply,
	initContract,
	mintOnPreSale,
	mintOnSale
} from "../utils/interact";
import { SALE_STATUSES } from "../utils/constants";

import "./styles/Minter.css";

const MAX_TOKEN_PER_MINT = 5;

const Minter = (props) => {
	const [walletAddress, setWallet] = useState("")
	const [status, setStatus] = useState({ type: "", msg: "" });
	const [saleStatus, setSaleStatus] = useState(SALE_STATUSES.OFF);
	const [saleTotalSupply, setSaleTotalSupply] = useState(0);
	const [tokensToMint, setTokensToMint] = useState("");

	useEffect(async () => {
		// Init contract
		await initContract();
		const saleStatus = await getSaleStatus();
		setSaleStatus(saleStatus);

		// Get tokens remain available
		const getTokensRemainAvailable = async () => {
			const totalSupply = await getTotalSupply();
			setSaleTotalSupply(totalSupply);
			console.log("Hello");
			return getTokensRemainAvailable;
		};
		setInterval(await getTokensRemainAvailable(), 5000);

		// Init wallet on load
		const { address, status } = await getCurrentConnectedWallet();
		setWallet(address);
		setStatus(status);
		addWalletListener({
			addressChangeHandler: setWallet,
			statusChangeHandler: setStatus
		})

		return () => {
			clearInterval(getTokensRemainAvailable);
		}
	}, []);

	const onConnectWallet = async () => {
		const response = await connectWallet();
		setWallet(response.address);
		setStatus(response.status);
	}

	const onMintAtSaleStage = async (e) => {
		e.preventDefault();
		if (!validate(tokensToMint)) {
			return;
		}
		const response = await mintOnSale(tokensToMint);
		/**
		 * TODO: if contract is missing
		 */
		setStatus(response.status);
	}

	const onMintAtPreSaleStage = async (e) => {
		e.preventDefault();
		if (!validate(tokensToMint)) {
			return;
		}
		const response = await mintOnPreSale(tokensToMint);
		setStatus(response.status);
	}

	const handleTokensToMintChange = (e) => {
		const value = e.target.value;
		if (validate(value)) {
			setTokensToMint(value);
		}
	}

	const validate = (value) => {
		if (!(0 < value && value <= MAX_TOKEN_PER_MINT)) {
			setStatus({
				type: "crimson",
				msg: `❗️You can only mint between 1 to ${MAX_TOKEN_PER_MINT} tokens at a time`
			});
			setTimeout(() => setStatus({ type: "", msg: "" }), 5000);
			return false;
		}
		if (!walletAddress) {
			setStatus({
				type: "darkred",
				msg: "🦊 Connect to the Metamask to start minting"
			});
			return false;
		}

		return true;
	}

	return (
		<div className="nft-minter">
			<div className="button-group">
				{walletAddress.length ? (
					<>
						<span id="walletConnected">
							{"Connected: "}
							{String(walletAddress).substring(0, 6)}
							{"..."}
							{String(walletAddress).substring(38)}
						</span>
					</>
				) : (
					<button id="walletButton"
						className="button-wallet minter-button"
						onClick={onConnectWallet}
					>
						CONNECT WALLET
					</button>
				)}
			</div>
			<h1 className="headline">🌌 NFT Minter</h1>
			<h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<span className="pulse"></span>
				TOKENS REMAIN AVAILABLE:&nbsp;
				<span>{ saleTotalSupply || 0 }</span></h4>
			<form>
				<div className="form-group">
					<div className="input-group">
						<span className="input-addon">Number of tokens</span>
						<input
							id="numberOfMints"
							type="number"
							min={1} max={5}
							placeholder="up to 5"
							value={tokensToMint}
							onChange={handleTokensToMintChange}
						/>
					</div>
				</div>
				<div className="form-group">
					{SALE_STATUSES.ON == saleStatus && (
						<button id="buttonMintOnSale"
							className="minter-button button-mint"
							onClick={onMintAtSaleStage}
						>
							MINT
						</button>
					)}
					{SALE_STATUSES.PRE == saleStatus && (
						<button id="buttonMinOnPreSale"
							className="minter-button button-mint"
							onClick={onMintAtPreSaleStage}
						>
							MINT
						</button>
					)}
					{SALE_STATUSES.OFF == saleStatus && (
						<button id="disabledButton"
							disabled
							onClick={e => e.preventDefault()}
							className="minter-button button-mint"
							style={{ cursor: "no-drop" }}
						>
							THE SALE IS OFF
						</button>
					)}
				</div>
				<div className="form-group">
					<div id="status"
						style={{ color: status.type }}
					>
						{status.msg}
					</div>
				</div>
			</form>
		</div>
	);
}

export default Minter;