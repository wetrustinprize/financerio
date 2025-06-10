import { useParams } from 'react-router';
import { useZero } from '../useZero';
import TableCrud, { createTableProps } from '../components/TableCrud';
import { useQuery } from '@rocicorp/zero/react';

export default function Wallets() {
  const params = useParams();
  const selectedWalletId = params.walletId || 'all';

  const z = useZero();

  const allWallets = z.query.wallets;

  const [wallets] = useQuery(allWallets);
  const showingWallet = wallets.find(
    (wallet) => wallet.id === selectedWalletId,
  );

  return (
    <TableCrud
      {...createTableProps({
        title: showingWallet ? showingWallet.name : 'All wallets',
        table: 'transactions',
        searchFrom: 'description',
        beforeQuery: (query) => {
          if (selectedWalletId === 'all') return;

          query.where('relatedWalletId', '=', selectedWalletId);
        },
        columns: {
          ...(!showingWallet
            ? {
              relatedWalletId: {
                label: 'Wallet',
                format: (value: string) => {
                  const wallet = wallets.find(
                    (wallet) => wallet.id === value,
                  );

                  return wallet?.name ?? 'Unknown';
                },
                emptyFormat: () => 'No wallet',
                editable: {
                  type: 'select',
                  items: wallets.map((wallet) => ({
                    label: wallet.name,
                    value: wallet.id,
                  })),
                },
              },
            }
            : {}),
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
