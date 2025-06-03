import TableCrud, { createTableProps } from '../components/TableCrud';

const CategoriesPage: React.FC = () => {
  return (
    <TableCrud
      {...createTableProps({
        title: 'Categories',
        table: 'categories',
        searchFrom: 'name',
        columns: {
          createdAt: {
            label: 'Created at',
            width: '20%',
            format: (value: number) => new Date(value).toLocaleDateString(),
            emptyFormat: () => '--/--/----',
          },
          name: {
            label: 'Name',
            width: '60%',
            editable: {
              type: 'text',
              validate: (string) => {
                if (string === '') {
                  return 'Name cannot be empty';
                }

                return true;
              },
            },
          },
          archived: {
            label: 'Archived',
            width: '20%',
            format: (value: boolean) => (value ? 'Yes' : 'No'),
            editable: {
              type: 'checkbox',
              format: (value: boolean) => (value ? 'Yes' : 'No'),
            },
          },
        },
      })}
    />
  );
};

export default CategoriesPage;
