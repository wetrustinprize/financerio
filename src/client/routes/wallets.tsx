import { useParams } from "react-router";
import { useZero } from "../useZero";
import { useQuery } from "@rocicorp/zero/react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, type Selection } from "@heroui/table";
import { Input } from "@heroui/input";
import { useState } from "react";
import { MdDeleteOutline, MdOutlineSearch } from "react-icons/md";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

export default function Wallets() {
    const [search, setSearch] = useState<string>("");
    const [selection, setSelection] = useState<Selection | undefined>(new Set());

    const params = useParams();
    const selectedWalletId = params.walletId || "all";

    const z = useZero();
    let transactionsQuery = z.query.transactions
        .limit(100)
        .related('relatedCategory')
        .related('relatedWallet')
        .related('toWallet');

    if (search !== "")
        transactionsQuery = transactionsQuery
            .where('description', 'ILIKE', `%${search}%`)

    const walletsQuery = z.query.wallets
        .limit(1)
        .where('id', '=', selectedWalletId)

    if (selectedWalletId !== "all")
        transactionsQuery = transactionsQuery.where('relatedWalletId', '=', selectedWalletId);

    const [transactions] = useQuery(transactionsQuery);
    const [wallet] = useQuery(walletsQuery);

    const bulkDelete = () => {
        if (selection === undefined) return;

        if (selection instanceof Set)
            z.mutateBatch(tx => selection.forEach(id => tx.wallets.delete({ id: id as string })))
        else
            z.mutate.categories.delete({ id: "*" });

        addToast({ title: "Deleted categories", color: 'success' })
    };

    return (
        <section className="flex flex-col gap-2 flex-1">
            <section className="p-2 flex justify-between">
                <h1 className="font-bold text-4xl">{wallet.length > 0 ? wallet[0].name : "All wallets"}</h1>
                <Input isClearable onClear={() => setSearch("")} value={search} onChange={e => setSearch(e.target.value)} startContent={<MdOutlineSearch className="fill-foreground-500" />} placeholder="Search" fullWidth={false} />
            </section>
            <section className="flex">
                <section className="flex-1 flex">
                    <Button color="primary" onPress={() => console.log("TODO")}>Create transaction</Button>
                </section>
                <section className="flex-1 flex flex-row-reverse">
                    <Button color="danger" onPress={bulkDelete} isDisabled={selection instanceof Set && selection.size === 0} isIconOnly>
                        <MdDeleteOutline />
                    </Button>
                </section>
            </section>
            <Table onSelectionChange={setSelection} selectionMode='multiple' classNames={{ base: 'flex-1', wrapper: 'flex-1' }}>
                <TableHeader>
                    <TableColumn width="16%">Date</TableColumn>
                    <TableColumn width="16%">Wallet</TableColumn>
                    <TableColumn width="16%">Category</TableColumn>
                    <TableColumn width="16%">Description</TableColumn>
                    <TableColumn width="16%">Type</TableColumn>
                    <TableColumn width="16%">Amount</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No transactions"}>
                    {transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {new Date(transaction.transactedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {transaction.relatedWallet?.name}
                            </TableCell>
                            <TableCell>
                                {transaction.relatedCategory?.name}
                            </TableCell>
                            <TableCell>
                                {transaction.description}
                            </TableCell>
                            <TableCell>
                                {transaction.type}
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