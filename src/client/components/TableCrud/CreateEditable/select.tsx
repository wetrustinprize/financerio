import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import type { ICreateEditableProps, ICreateEditableRef } from '.';

const SelectEditable = forwardRef<
  ICreateEditableRef<'select'>,
  ICreateEditableProps<'select'>
>(({ column, options, onValueChange }, ref) => {
  const [value, setValue] = useState<string | null>(options.default || null);

  useEffect(() => {
    if (options.default === undefined) return;
    setValue(options.default);
  }, [options.default]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setValue(options.default || null);
    },
    setValue: (value) => {
      setValue(value);
    },
  }));

  return (
    <Autocomplete
      selectedKey={value}
      key={column}
      validate={options.validate}
      onSelectionChange={(key) => {
        if (key === null || typeof key !== 'string') return;

        if (onValueChange) onValueChange(key);
        setValue(key);
      }}
      items={options.items}
    >
      {(item) => (
        <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
});

export default SelectEditable;
