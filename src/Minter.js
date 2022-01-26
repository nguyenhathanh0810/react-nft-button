import { useEffect, useState } from "react";
import {
	addWalletListener,
	connectWallet,
	getCurrentConnectedWallet,
	getSaleStatus,
	initContract,
	mintOnSale
} from "./utils/interact";
import { SALE_STATUSES } from "./utils/constants";

const MAX_TOKEN_PER_MINT = 5;

const Minter = (props) => {
	const [walletAddress, setWallet] = useState("")
	const [status, setStatus] = useState({ type: "", msg: "" });
	const [saleManager, setSaleManager] = useState({ saleStatus: 0 });
	const [tokensToMint, setTokensToMint] = useState(1);

	useEffect(async () => {
		// Init contract
		await initContract();
		const saleStatus = await getSaleStatus();
		setSaleManager({ saleStatus: saleStatus });

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

	// const onDisconnectWallet = async () => {
	// 	setWallet("");
	// 	setStatus({
	// 		type: "blue",
	// 		msg: "🗳 Wallet disconnected."
	// 	})
	// }

	const onMintAtSaleStage = async () => {
		const response = await mintOnSale(tokensToMint);
		/**
		 * TODO: if contract is missing
		 */
		setStatus(response.status);
	}

	return (
		<div className="nft-minter">
			<div className="button-group">
				{walletAddress.length ? (
					<>
						<span>
							{"Connected: "}
							{String(walletAddress).substring(0, 6)}
							{"..."}
							{String(walletAddress).substring(38)}
						</span>
						{/* <button id="walletUnplugButton"
							onClick={onDisconnectWallet}
						>
							Disconnect
						</button> */}
					</>
				) : (
					<button id="walletButton"
						onClick={onConnectWallet}
					>
						Connect Wallet
					</button>
				)}
			</div>
			<h1>NFT Minter {tokensToMint}</h1>
			<form>
				<input
					type="number"
					min={1} max={5}
					placeholder="You can mint up to 5 tokens"
					value={tokensToMint}
					onChange={val => setTokensToMint(val)}
				/>
				{SALE_STATUSES.ON == saleManager.status && (
					<button id="buttonMintOnSale"
						onClick={onMintAtSaleStage}
					>
						Mint NFT
					</button>
				)}
				{SALE_STATUSES.PRE == saleManager.status && (
					<button id="buttonMinOnPresale"
						onClick={() => {}}
					>
						Mint NFT
					</button>
				)}
				<div id="status"
					style={{ color: status.type }}
				>
					{status.msg}
				</div>
			</form>
		</div>
	);
}

export default Minter;