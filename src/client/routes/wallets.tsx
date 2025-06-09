import { useParams } from 'react-router';
import { useZero } from '../useZero';
import TableCrud, { createTableProps } from '../components/TableCrud';
import { useQuery } from '@rocicorp/zero/react';

export default function Wallets() {
  const params = useParams();
  const selectedWalletId = params.walletId || 'all';

  const z = useZero();

  const walletsQuery = z.query.wallets
    .limit(1)
    .where('id', '=', selectedWalletId);

  const [wallets] = useQuery(walletsQuery);

  return (
    <TableCrud
      {...createTableProps({
        title: wallets.length === 0 ? 'All wallets' : wallets[0].name,
        table: 'transactions',
        searchFrom: 'description',
        beforeQuery: (query) => {
          if (selectedWalletId === 'all') return;

          query.where('relatedWalletId', '=', selectedWalletId);
        },
        columns: {
          transactedAt: {
            label: 'Transacted at',
            format: (v: number) => new Date(v).toLocaleDateString(),
            editable: {
              type: 'date',
            },
          },
          description: {
            label: 'Description',
            editable: {
              type: 'text',
              validate: (v) => {
                if (v === '') return "Can't be empty";
                return true;
              },
            },
          },
        },
      })}
    />
  );
}
