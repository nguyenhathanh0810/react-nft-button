import { useEffect, useState } from "react";
import {
	addWalletListener,
	connectWallet,
	getCurrentConnectedWallet,
	getSaleStatus,
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
	const [saleManager, setSaleManager] = useState({ status: SALE_STATUSES.ON });
	const [tokensToMint, setTokensToMint] = useState("");

	useEffect(async () => {
		// Init contract
		await initContract();
		const saleStatus = await getSaleStatus();
		setSaleManager({ status: saleStatus });

		// Init wallet on load
		const { address, status } = await getCurrentConnectedWallet();
		setWallet(address);
		setStatus(status);
		addWalletListener({
			addressChangeHandler: setWallet,
			statusChangeHandler: setStatus
		})
	}, []);

	const onConnectWallet = async () => {
		const response = await connectWallet();
		setWallet(response.address);
		setStatus(response.status);
	}

	const onMintAtSaleStage = async (e) => {
		e.preventDefault();
		if (!validateInput(tokensToMint)) {
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
		if (!validateInput(tokensToMint)) {
			return;
		}
		const response = await mintOnPreSale(tokensToMint);
		/**
		 * TODO: if contract is missing
		 */
		setStatus(response.status);
	}

	const handleTokensToMintChange = (e) => {
		const value = e.target.value;
		if (validateInput(value)) {
			setTokensToMint(value);
		}
	}

	const validateInput = (value) => {
		if (0 < value && value <= MAX_TOKEN_PER_MINT) {
			return true;
		}
		setStatus({
			type: "crimson",
			msg: `❗️You can only mint between 1 to ${MAX_TOKEN_PER_MINT} tokens at a time`
		});
		setTimeout(() => setStatus({ type: "", msg: "" }), 5000);
		return false;
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
					{SALE_STATUSES.ON == saleManager.status && (
						<button id="buttonMintOnSale"
							className="minter-button button-mint"
							onClick={onMintAtSaleStage}
						>
							MINT
						</button>
					)}
					{SALE_STATUSES.PRE == saleManager.status && (
						<button id="buttonMinOnPreSale"
							className="minter-button button-mint"
							onClick={onMintAtPreSaleStage}
						>
							MINT
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