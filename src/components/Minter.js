import { useEffect, useState } from "react";
import {
	addWalletListener,
	connectWallet,
	getCurrentConnectedWallet,
	getMaxMint,
	getRemainingSupply,
	getSaleStage,
	getSaleStatus,
	initContract,
	mintOnPreSale,
	mintOnSale
} from "../utils/interact";
import { SALE_SECTION, SALE_STATUS, SUPPLY_CAP } from "../utils/constants";

import "./styles/Minter.css";

const MAX_MINT_PER_WALLET = 10;
const INITIAL_SALE_STATUS = -1;
const OFF_STAGE = -1;

const Minter = (props) => {
	const [walletAddress, setWallet] = useState("")
	const [status, setStatus] = useState({ type: "", msg: "" });
	const [saleStage, setSaleStage] = useState(OFF_STAGE);
	const [saleStatus, setSaleStatus] = useState(INITIAL_SALE_STATUS);
	const [saleTotalSupply, setSaleTotalSupply] = useState(0);
	const [maxMint, setMaxMint] = useState(MAX_MINT_PER_WALLET);
	const [isMintingDisabled, setMintingDisability] = useState(false);
	const [tokensToMint, setTokensToMint] = useState("");

	useEffect(async () => {
		await initContract();

		const _saleStage = await getSaleStage();
		setSaleStage(_saleStage); 

		const _saleStatus = await getSaleStatus();
		setSaleStatus(_saleStatus);

		const _maxMint = await getMaxMint();
		setMaxMint(parseInt(_maxMint));

		// Get tokens remain available
		const getTokensRemainAvailable = async () => {
			const remainingSupply = await getRemainingSupply();
			const stage = SALE_SECTION[_saleStage].index;
			const stageSupply = SUPPLY_CAP[stage];
			let supply = stageSupply - (SUPPLY_CAP.stage3 - remainingSupply);
			if (supply < 0) {
				supply = 0;
			}
			setSaleTotalSupply(supply);
			if (!isMintingDisabled && !supply) {
				setMintingDisability(true);
			}
			return getTokensRemainAvailable;
		};
		setInterval(await getTokensRemainAvailable(), 5000);

		const retrievetLiveOnSaleParams = async () => {
			const _saleStage = await getSaleStage();
			setSaleStage(_saleStage); 

			const _saleStatus = await getSaleStatus();
			setSaleStatus(_saleStatus);

			const _maxMint = await getMaxMint();
			setMaxMint(parseInt(_maxMint));
		}
		setInterval(retrievetLiveOnSaleParams, 5000);

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
			clearInterval(retrievetLiveOnSaleParams);
		}
	}, []);

	const onConnectWallet = async () => {
		const response = await connectWallet();
		setWallet(response.address);
		setStatus(response.status);
	}

	const onMintAtSaleStage = async (e) => {
		e.preventDefault();
		if (isMintingDisabled || !validate(tokensToMint)) {
			return;
		}
		setStatus({
			type: "magenta",
			msg: "Minting started..."
		});
		const response = await mintOnSale(tokensToMint);
		setStatus(response.status);
	}

	const onMintAtPreSaleStage = async (e) => {
		e.preventDefault();
		if (isMintingDisabled || !validate(tokensToMint)) {
			return;
		}
		setStatus({
			type: "magenta",
			msg: "Minting started..."
		});
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
		if (!(0 < value && value <= maxMint)) {
			setStatus({
				type: "crimson",
				msg: `❗️You can only mint between 1 to ${maxMint} tokens at a time`
			});
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
			<h1 className="headline">🌄 NFT Minter</h1>
			<h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<span className="pulse"></span>
				Tokens remain available:&nbsp;
				<span>{ saleTotalSupply || 0 }</span></h4>
			<form>
				<div className="form-group">
					<div className="input-group">
						<span className="input-addon">Number of tokens</span>
						<input
							id="numberOfMints"
							type="number"
							min={1} max={maxMint}
							placeholder={`up to ${maxMint} per wallet`}
							value={tokensToMint}
							onChange={handleTokensToMintChange}
						/>
					</div>
				</div>
				<div className="form-group">
					{SALE_STATUS.ON == saleStatus && (
						<button id="buttonMintOnSale"
							className={"minter-button button-mint"
								+ `${isMintingDisabled ? ' disabled' : ''}`
							}
							onClick={onMintAtSaleStage}
						>
							{isMintingDisabled ? 'NO TOKENS AVAILABLE' : 'MINT'}
						</button>
					)}
					{SALE_STATUS.PRE == saleStatus && (
						<button id="buttonMinOnPreSale"
							className={"minter-button button-mint"
								+ `${isMintingDisabled ? ' disabled' : ''}`
							}
							onClick={onMintAtPreSaleStage}
						>
							{isMintingDisabled ? 'NO TOKENS AVAILABLE' : 'MINT'}
						</button>
					)}
					{SALE_STATUS.OFF == saleStatus && (
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