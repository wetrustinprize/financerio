import { useParams } from "react-router";
import { useZero } from "../useZero";
import { useQuery } from "@rocicorp/zero/react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";

export default function Wallets() {
    const params = useParams();
    const selectedWalletId = params.walletId || "all";

    const z = useZero();
    let transactionsQuery = z.query.transactions
        .limit(100)
        .related('relatedCategory')
        .related('relatedWallet')
        .related('toWallet');

    const walletsQuery = z.query.wallets
        .limit(1)
        .where('id', '=', selectedWalletId)

    if (selectedWalletId !== "all")
        transactionsQuery = transactionsQuery.where('relatedWalletId', '=', selectedWalletId);

    const [transactions] = useQuery(transactionsQuery);
    const [wallet] = useQuery(walletsQuery);

    return (
        <section className="flex flex-col gap-2 flex-1">
            <section className="p-2">
                <h1 className="font-bold text-4xl">{wallet.length > 0 ? wallet[0].name : "All wallets"}</h1>
            </section>
            <Table selectionMode='multiple' classNames={{ base: 'flex-1', wrapper: 'flex-1' }}>
                <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Wallet</TableColumn>
                    <TableColumn>Category</TableColumn>
                    <TableColumn>Amount</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No transactions"}>
                    {transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                00-00-00
                            </TableCell>
                            <TableCell>
                                {transaction.relatedWallet?.name}
                            </TableCell>
                            <TableCell>
                                {transaction.relatedCategory?.name}
                            </TableCell>
                            <TableCell>
                                {transaction.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    );
}