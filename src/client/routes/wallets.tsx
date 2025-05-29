import { useParams } from "react-router";

export default function Wallets() {
    const params = useParams();
    const selectedWalletId = params.walletId || "all";

    return (<div>Wallet: {selectedWalletId}</div>);
}