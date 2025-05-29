import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "../useZero";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, type Selection } from "@heroui/table";
import { Button } from "@heroui/button";
import { MdDeleteOutline, MdOutlineSearch } from "react-icons/md";
import { Input } from "@heroui/input";
import { useState } from "react";
import CreateCategoryModal, { openCreateCategoryModal } from "../modals/CreateCategory";
import { addToast } from "@heroui/toast";

// TODO: Make it possible to edit categories
// TODO: Make it possible to sort by the table column

export default function Categories() {
    const [search, setSearch] = useState<string>("");
    const [selection, setSelection] = useState<Selection | undefined>(new Set());

    const z = useZero();
    let categoriesQuery = z.query.categories
        .limit(100)

    if (search !== "")
        categoriesQuery = categoriesQuery
            .where('name', 'ILIKE', `%${search}%`)

    const [categories] = useQuery(categoriesQuery);

    const bulkDelete = () => {
        if (selection === undefined) return;

        if (selection instanceof Set)
            z.mutateBatch(tx => selection.forEach(id => tx.categories.delete({ id: id as string })))
        else
            z.mutate.categories.delete({ id: "*" });

        addToast({ title: "Deleted categories", color: 'success' })
    };

    return (
        <section className="flex flex-col gap-2 flex-1">
            <CreateCategoryModal />
            <section className="p-2 flex justify-between">
                <h1 className="font-bold text-4xl">
                    Categories
                </h1>
                <Input value={search} onChange={e => setSearch(e.target.value)} startContent={<MdOutlineSearch className="fill-foreground-500" />} placeholder="Search" fullWidth={false} />
            </section>
            <section className="flex">
                <section className="flex-1 flex">
                    <Button color="primary" onPress={() => openCreateCategoryModal()}>Create category</Button>
                </section>
                <section className="flex-1 flex flex-row-reverse">
                    <Button color="danger" onPress={bulkDelete} isDisabled={selection instanceof Set && selection.size === 0} isIconOnly>
                        <MdDeleteOutline />
                    </Button>
                </section>
            </section>
            <Table onSelectionChange={setSelection} selectionMode="multiple" classNames={{ base: 'flex-1', wrapper: 'flex-1' }}>
                <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Type</TableColumn>
                    <TableColumn>Archived</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No categories"}>
                    {categories.map(category => (
                        <TableRow key={category.id}>
                            <TableCell>
                                {category.name}
                            </TableCell>
                            <TableCell>
                                {category.type}
                            </TableCell>
                            <TableCell>
                                {category.archived ? "Yes" : "No"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    );
}