import type { Schema } from "@/generic/schema";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, type Selection } from "@heroui/table";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { useState, type ReactElement } from "react";
import { MdDeleteOutline, MdEdit, MdNoteAdd, MdOutlineSearch } from "react-icons/md";
import { Form } from "@heroui/form";
import {Kbd} from "@heroui/kbd";
import { v4 } from "uuid";

type EditableTypes = 'text' | 'checkbox';
type EditableValidation<T> = (value: T) => true | string | undefined;
type EditableOptionsMap = {
    'text': {
        type: 'text',
        validate?: EditableValidation<string>,
    };
    'checkbox': {
        type: 'checkbox',
        validate?: EditableValidation<boolean>,
        format: (value: boolean) => ReactElement | string,
    },
};
type EditableOptions = EditableOptionsMap[EditableTypes];

type Columns<Table extends keyof Schema['tables']> = keyof Schema['tables'][Table]['columns'] & string;

type ShowColumns<Table extends keyof Schema['tables']> = {
    [Key in Columns<Table>]?: {
        /** The label to show in the header */
        label: string,

        /** Table width */
        width?: `${number}%`,

        /** How to display this column value? */
        format?: (value: any) => ReactElement | string,
        
        /** How this column will display if value is NULL? */
        emptyFormat?: () => ReactElement | string,

        /** How this column is editable? */
        editable?: EditableOptions,
    };
};

interface ITableProps<Table extends keyof Schema['tables']> {
    /** The table title */
    title: ReactElement | string,

    /** The table to make the mutation and queries */
    table: Table,

    /** The columns to show */
    columns: ShowColumns<Table>,

    /** From where to filter a search */
    searchFrom?: Columns<Table>;
};

export function createTableProps<Table extends keyof Schema['tables']>(
  props: ITableProps<Table>
): ITableProps<Table> {
  return props;
}

// TODO: Make it possible to edit
// TODO: Make it possible to sort by the table column
// TODO: Make it possible to merge
// TODO: Make it virtualized
// TODO: Make it possible to reset the create form

const CreateEditable: React.FC<{ column: Columns<any>, options: EditableOptions }> = ({ options, column}) => {
    switch(options.type) {
        case 'text':
            return (
                <Input name={column} validate={options.validate}/>
            );
        case 'checkbox':
            return (
                <Checkbox name={column} validate={options.validate}/>
            );
        default:
            // @ts-expect-error
            throw new Error(`Unknown editable type: ${options.type}`);
    }
};

const CreateEntry: React.FC<{columns: ShowColumns<any>, handleSubmit: (data: object) => void}> = ({ columns, handleSubmit }) => {
    return (
        <Form className="block bg-primary-500 p-[2px] rounded-[calc(theme(borderRadius.xl)+2px)]" onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data: Record<string, any> = Object.fromEntries(formData);

            (Object.entries(columns) as unknown as [string, NonNullable<ShowColumns<any>[any]>][]).forEach(([key, column]) => {
                if(column.editable === undefined) return;

                switch(column.editable.type) {
                    case 'checkbox':
                        if(!(key in data)) {
                            data[key] = false;
                        } else {
                            data[key] = true;
                        }
                }
            });

            handleSubmit(data);
        }}>
            <div className="flex p-2 gap-2 rounded-xl bg-primary-50">
                {(Object.entries(columns) as unknown as [string, NonNullable<ShowColumns<any>[any]>][]).map(([key, column]) => (
                    <div key={key} className={`flex-1 flex flex-col gap-1`} style={{ flexBasis: column.width ?? 'auto' }}>
                        <label className="block text-foreground-500 text-tiny font-semibold">{column.label}</label>
                        <section className="flex-1 flex items-center">
                            {column.editable ? (
                                <CreateEditable column={key} options={column.editable} />
                            ) : (
                                <p className="text-foreground-300">{column.emptyFormat ? column.emptyFormat() : '---'}</p>
                            )}
                        </section>
                    </div>
                ))}
            </div>
            <section className="p-1 flex gap-2">
                <Button type="submit" className="font-semibold" color="primary"><Kbd keys={'enter'}/> Create</Button>
            </section>
        </Form>
    );
};

const TableCrud = <Table extends keyof Schema['tables']>({ title, searchFrom, columns, table }: ITableProps<Table>) => {
    const z = useZero();
    let query = z.query[table];

    const [search, setSearch] = useState<string>("");
    const [selection, setSelection] = useState<Selection | undefined>(new Set());
    const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');

    if(search !== "" && searchFrom !== undefined) {
        query = query.where(searchFrom, 'ILIKE', `%${search}%`);
    }

    const [entries] = useQuery(query) as unknown as [ {[key: string]: any}[] ];

    const deleteEntry = () => {
        if(selection === undefined) return;
        if(selection instanceof Set && selection.size === 0) return;

        if(selection instanceof Set)
            z.mutateBatch(tx => selection.forEach(id => tx[table].delete({id: id as string})));
        else
            z.mutate[table].delete({ id: selection as string });
    };

    const createEntry = (data: object) => {
        z.mutate[table].insert({
            id: v4(),
            createdAt: new Date(),
            ...data,
        });
    };

    return (
        <section className="flex flex-col gap-2 flex-1">
            <section className="p-2 flex justify-between">
                {title instanceof Function ? title : (
                    <h1 className="font-bold text-4xl">
                        {title}
                    </h1>
                )}
                {searchFrom !== undefined && <Input isClearable onClear={() => setSearch("")} value={search} onChange={e => setSearch(e.target.value)} startContent={<MdOutlineSearch className="fill-foreground-500" />} placeholder="Search" fullWidth={false} />}
            </section>
            <section className="flex">
                <section className="flex-1 flex gap-1">
                    {[
                        (
                            <Button 
                                color="primary" 
                                variant={mode === 'add' ? 'solid' : 'ghost'}
                                onPress={() => setMode(mode !== 'add' ? 'add' : 'view')} 
                                isIconOnly
                            >
                                <MdNoteAdd />
                            </Button>
                        ),
                        (
                            <section className="flex gap-1">
                                <Button 
                                    color="secondary" 
                                    variant={mode === 'edit' ? 'solid' : 'ghost'}
                                    onPress={() => setMode(mode !== 'edit' ? 'edit' : 'view')} 
                                    isIconOnly
                                >
                                    <MdEdit />
                                </Button>
                                <section className={`flex gap-1 transition-all pointer-events-${mode === 'edit' ? 'auto' : 'none'} opacity-${mode === 'edit' ? '1' : '0'} translate-x-[${mode === 'edit' ? '0%' : '-100%'}]`}>
                                    <Button 
                                        color="danger" 
                                        isDisabled={mode !== 'edit' || (selection instanceof Set ? selection.size === 0 : selection === undefined)}
                                        variant="solid"
                                        onPress={deleteEntry}
                                        isIconOnly
                                    >
                                        <MdDeleteOutline />
                                    </Button>
                                </section>
                            </section>
                        )
                    ].map((element, index) => (
                        <>
                            {element}
                            {index < 1 && <Divider orientation="vertical" />}
                        </>
                    ))}
                </section>
            </section>
            <section className="flex-1 flex flex-col p-4 rounded-xl shadow-small gap-2">
                    {mode === 'add' && <CreateEntry handleSubmit={createEntry} columns={columns}/>}
                <Table onSelectionChange={setSelection} selectionMode={mode === 'edit' ? 'multiple' : 'none'} classNames={{ base: 'flex-1', wrapper: 'flex-1 shadow-none p-0' }}>
                    <TableHeader>
                        {Object.entries(columns).map(([key, column]) => (
                            <TableColumn key={key} width={column.width}>
                                {column.label}
                            </TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody emptyContent={"No categories"}>
                        {entries.map(entry => (
                            <TableRow key={entry.id}>
                                {(Object.entries(columns) as unknown as [string, NonNullable<ShowColumns<Table>[Columns<Table>]>][]).map(([key, column]) => (
                                    <TableCell>
                                        {column.format ? column.format(entry[key] as never) : entry[key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </section>
    );
};

export default TableCrud;