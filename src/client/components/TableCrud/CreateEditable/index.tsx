import type { Columns, Tables } from '@/generic/types/schema';
import { Spinner } from '@heroui/spinner';
import type { Validation } from '@react-types/shared';
import React, {
  useEffect,
  useState,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type ReactElement,
  type RefAttributes,
} from 'react';

type EditableTypes = 'text' | 'checkbox' | 'date';
type EditableMustHaveOptions<T> = {
  [key in EditableTypes]: {
    type: key;
    validate?: Validation<T>['validate'];
    default?: T;
  };
};
type EditableOptionsMap = {
  text: EditableMustHaveOptions<string>['text'];
  checkbox: EditableMustHaveOptions<boolean>['checkbox'] & {
    format: (value: boolean) => ReactElement | string;
  };
  date: EditableMustHaveOptions<number>['date'];
};
export type EditableOptions = EditableOptionsMap[EditableTypes];

export interface ICreateEditableRef<
  Type extends EditableTypes = EditableTypes,
> {
  /** Resets to its initial value */
  reset: () => void;

  /** Sets its value */
  setValue: (value: NonNullable<EditableOptionsMap[Type]['default']>) => void;
}

export interface ICreateEditableProps<
  Type extends EditableTypes = EditableTypes,
> {
  /** The options of the editable */
  options: EditableOptionsMap[Type];

  /** The related column */
  column: Columns<keyof Tables>;

  /** Called when the input changes */
  onValueChange?: (
    value: NonNullable<EditableOptionsMap[Type]['default']>,
  ) => void;
}

export type CreateEditableComponent = ForwardRefExoticComponent<
  PropsWithoutRef<ICreateEditableProps> & RefAttributes<ICreateEditableRef>
>;

const CreateEditable = React.forwardRef<
  ICreateEditableRef,
  ICreateEditableProps
>(({ options, column, onValueChange }, ref) => {
  const [Component, setComponent] = useState<CreateEditableComponent | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    import(`./${options.type}.tsx`)
      .then((mod) => {
        if (active) setComponent(() => mod.default);
      })
      .catch(() => {
        if (active) setComponent(null);
      });

    return () => {
      active = false;
    };
  }, [options.type]);

  if (!Component) return <Spinner />;

  return (
    <Component
      column={column}
      options={options}
      onValueChange={onValueChange}
      ref={ref}
    />
  );
});

export default CreateEditable;
