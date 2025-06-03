import type { Schema } from '@/generic/schema';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { Input } from '@heroui/input';
import { Checkbox } from '@heroui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type Selection,
} from '@heroui/table';
import { useQuery, useZero } from '@rocicorp/zero/react';
import React, {
  createRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import {
  MdDeleteOutline,
  MdEdit,
  MdNoteAdd,
  MdOutlineSearch,
} from 'react-icons/md';
import { Form } from '@heroui/form';
import { Kbd } from '@heroui/kbd';
import { v4 } from 'uuid';
import { BiSelectMultiple } from 'react-icons/bi';

type EditableTypes = 'text' | 'checkbox';
type EditableValidation<T> = (value: T) => true | string | undefined;
type EditableOptionsMap = {
  text: {
    type: 'text';
    validate?: EditableValidation<string>;
    default?: string;
  };
  checkbox: {
    type: 'checkbox';
    default?: boolean;
    validate?: EditableValidation<boolean>;
    format: (value: boolean) => ReactElement | string;
  };
};
type EditableOptions = EditableOptionsMap[EditableTypes];

type Columns<Table extends keyof Schema['tables']> =
  keyof Schema['tables'][Table]['columns'] & string;

type ShowColumns<Table extends keyof Schema['tables']> = {
  [Key in Columns<Table>]?: {
    /** The label to show in the header */
    label: string;

    /** Table width */
    width?: `${number}%`;

    /** How to display this column value? */
    format?: (value: any) => ReactElement | string;

    /** How this column will display if value is NULL? */
    emptyFormat?: () => ReactElement | string;

    /** How this column is editable? */
    editable?: EditableOptions;
  };
};

interface ITableProps<Table extends keyof Schema['tables']> {
  /** The table title */
  title: ReactElement | string;

  /** The table to make the mutation and queries */
  table: Table;

  /** The columns to show */
  columns: ShowColumns<Table>;

  /** From where to filter a search */
  searchFrom?: Columns<Table>;
}

export function createTableProps<Table extends keyof Schema['tables']>(
  props: ITableProps<Table>,
): ITableProps<Table> {
  return props;
}

// TODO: Make it possible to sort by the table column
// TODO: Make it virtualized
// TODO: Make it possible to reset the create form
// TODO: Check if debounce would help in updateEntry

type CreateEditableRef = { reset: () => void };
const CreateEditable = React.forwardRef<
  CreateEditableRef,
  {
    column: Columns<any>;
    options: EditableOptions;
    onValueChange?: (value: any) => void;
  }
>(({ options, column, onValueChange }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultValue = useRef<any>(undefined);

  useImperativeHandle(ref, () => {
    return {
      reset: () => {
        if (inputRef.current === null) return;

        const hasDefault =
          'default' in options && options.default !== undefined;
        inputRef.current.value = hasDefault
          ? options.default
          : defaultValue.current;
      },
    };
  }, []);

  useEffect(() => {
    if (inputRef.current === null) return;
    if (options.default === undefined) return;

    //@ts-expect-error The default should always be the correct value
    inputRef.current.value = options.default;
  }, [inputRef.current, options]);

  switch (options.type) {
    case 'text':
      defaultValue.current = '';
      return (
        <Input
          ref={inputRef}
          name={column}
          validate={options.validate}
          onValueChange={onValueChange}
        />
      );
    case 'checkbox':
      defaultValue.current = false;
      return (
        <Checkbox
          ref={inputRef}
          name={column}
          validate={options.validate}
          onValueChange={onValueChange}
        >
          {options.format(false)}
        </Checkbox>
      );
    default:
      // @ts-expect-error Should print out the type, even if its never
      throw new Error(`Unknown editable type: ${options.type}`);
  }
});

const CreateEntry: React.FC<{
  columns: ShowColumns<any>;
  handleSubmit: (data: object) => void;
}> = ({ columns, handleSubmit }) => {
  const refs = useRef<React.RefObject<CreateEditableRef | null>[]>(
    Object.keys(columns).map(() => createRef()),
  );

  const reset = () => {
    refs.current.forEach((ref) => {
      if (ref === null) return;
      ref.current?.reset();
    });
  };

  return (
    <Form
      className="block bg-primary-500 p-[2px] rounded-[calc(theme(borderRadius.xl)+2px)]"
      onReset={(e) => {
        e.preventDefault();
        reset();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = Object.fromEntries(formData);

        (
          Object.entries(columns) as unknown as [
            string,
            NonNullable<ShowColumns<any>[any]>,
          ][]
        ).forEach(([key, column]) => {
          if (column.editable === undefined) return;

          switch (column.editable.type) {
            case 'checkbox':
              if (!(key in data)) {
                data[key] = false;
              } else {
                data[key] = true;
              }
          }
        });

        handleSubmit(data);
      }}
    >
      <div className="flex p-2 gap-2 rounded-xl bg-primary-50">
        {(
          Object.entries(columns) as unknown as [
            string,
            NonNullable<ShowColumns<any>[any]>,
          ][]
        ).map(([key, column], index) => (
          <div
            key={key}
            className={`flex-1 flex flex-col gap-1`}
            style={{ flexBasis: column.width ?? 'auto' }}
          >
            <label className="block text-foreground-500 text-tiny font-semibold">
              {column.label}
            </label>
            <section className="flex-1 flex items-center">
              {column.editable ? (
                <CreateEditable
                  ref={refs.current[index]}
                  column={key}
                  options={column.editable}
                />
              ) : (
                <p className="text-foreground-300">
                  {column.emptyFormat ? column.emptyFormat() : '---'}
                </p>
              )}
            </section>
          </div>
        ))}
      </div>
      <section className="p-1 flex gap-2">
        <Button type="submit" className="font-semibold" color="primary">
          <Kbd keys={'enter'} /> Create
        </Button>
        <Button type="reset" className="font-semibold" color="primary">
          <Kbd keys={'ctrl'}>R</Kbd> Reset
        </Button>
      </section>
    </Form>
  );
};

const TableCrud = <Table extends keyof Schema['tables']>({
  title,
  searchFrom,
  columns,
  table,
}: ITableProps<Table>) => {
  const z = useZero();
  let query = z.query[table];

  const [search, setSearch] = useState<string>('');
  const [selection, setSelection] = useState<Selection | undefined>(new Set());
  const [mode, setMode] = useState<'view' | 'add' | 'edit' | 'selection'>(
    'view',
  );

  if (search !== '' && searchFrom !== undefined) {
    query = query.where(searchFrom, 'ILIKE', `%${search}%`);
  }

  const [entries] = useQuery(query) as unknown as [{ [key: string]: any }[]];

  const deleteEntry = () => {
    if (selection === undefined) return;
    if (selection instanceof Set && selection.size === 0) return;

    if (selection instanceof Set)
      z.mutateBatch((tx) =>
        selection.forEach((id) => tx[table].delete({ id: id as string })),
      );
    else z.mutate[table].delete({ id: selection as string });
  };

  const createEntry = (data: object) => {
    z.mutate[table].insert({
      id: v4(),
      createdAt: new Date(),
      ...data,
    });
  };

  const updateEntry = (id: string, column: string, value: any) => {
    console.log({ id, column, value });

    // z.mutate[table].update({
    //   ...changes,
    //   id,
    // });
  };

  return (
    <section className="flex flex-col gap-2 flex-1">
      <section className="p-2 flex justify-between">
        {title instanceof Function ? (
          title
        ) : (
          <h1 className="font-bold text-4xl">{title}</h1>
        )}
        {searchFrom !== undefined && (
          <Input
            isClearable
            onClear={() => setSearch('')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<MdOutlineSearch className="fill-foreground-500" />}
            placeholder="Search"
            fullWidth={false}
          />
        )}
      </section>
      <section className="flex">
        <section className="flex-1 flex gap-1">
          <Button
            color="primary"
            variant={mode === 'add' ? 'solid' : 'ghost'}
            onPress={() => setMode(mode !== 'add' ? 'add' : 'view')}
            isIconOnly
          >
            <MdNoteAdd />
          </Button>
          <Button
            color="secondary"
            variant={mode === 'edit' ? 'solid' : 'ghost'}
            onPress={() => setMode(mode !== 'edit' ? 'edit' : 'view')}
            isIconOnly
          >
            <MdEdit />
          </Button>
          <Divider orientation="vertical" />
          <section className="flex gap-1">
            <Button
              color="danger"
              variant={mode === 'selection' ? 'solid' : 'ghost'}
              onPress={() =>
                setMode(mode !== 'selection' ? 'selection' : 'view')
              }
              isIconOnly
            >
              <BiSelectMultiple />
            </Button>
            <section
              className={`flex gap-1 transition-all pointer-events-${mode === 'selection' ? 'auto' : 'none'} opacity-${mode === 'selection' ? '1' : '0'}`}
            >
              <Button
                color="danger"
                isDisabled={
                  mode !== 'selection' ||
                  (selection instanceof Set
                    ? selection.size === 0
                    : selection === undefined)
                }
                variant="solid"
                onPress={deleteEntry}
                isIconOnly
              >
                <MdDeleteOutline />
              </Button>
            </section>
          </section>
        </section>
      </section>
      <section className="flex-1 flex flex-col p-4 rounded-xl shadow-small gap-2">
        {mode === 'add' && (
          <CreateEntry handleSubmit={createEntry} columns={columns} />
        )}
        <Table
          onSelectionChange={setSelection}
          selectionMode={mode === 'selection' ? 'multiple' : 'none'}
          classNames={{ base: 'flex-1', wrapper: 'flex-1 shadow-none p-0' }}
        >
          <TableHeader>
            {Object.entries(columns).map(([key, column]) => (
              <TableColumn key={key} width={column.width}>
                {column.label}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody emptyContent={'No categories'}>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                {(
                  Object.entries(columns) as unknown as [
                    string,
                    NonNullable<ShowColumns<Table>[Columns<Table>]>,
                  ][]
                ).map(([key, column]) => (
                  <TableCell>
                    {mode === 'edit' && column.editable ? (
                      <CreateEditable
                        column={key}
                        options={{ ...column.editable, default: entry[key] }}
                        onValueChange={(v) => updateEntry(entry.id, key, v)}
                      />
                    ) : column.format ? (
                      column.format(entry[key] as never)
                    ) : (
                      entry[key]
                    )}
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
