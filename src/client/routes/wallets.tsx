import { useParams } from 'react-router';
import { useZero } from '../useZero';
import TableCrud, { createTableProps } from '../components/TableCrud';
import { useQuery } from '@rocicorp/zero/react';
import { TransactionTypeEnum } from '@/generic/types/transactionType';

// TODO: Make impossible to transfer to select wallet

export default function Wallets() {
  const params = useParams();
  const selectedWalletId = params.walletId || 'all';

  const z = useZero();

  const allWallets = z.query.wallets;
  const allCategories = z.query.categories;

  const [wallets] = useQuery(allWallets);
  const showingWallet = wallets.find(
    (wallet) => wallet.id === selectedWalletId,
  );

  const [categories] = useQuery(allCategories);

  return (
    <TableCrud
      {...createTableProps({
        title: showingWallet ? showingWallet.name : 'All wallets',
        table: 'transactions',
        searchFrom: 'description',
        defaultValues:
          selectedWalletId === 'all'
            ? undefined
            : {
                relatedWalletId: selectedWalletId,
              },
        beforeQuery: (query) => {
          if (selectedWalletId === 'all') return query;

          return query.where(({ or, cmp }) =>
            or(
              cmp('relatedWalletId', '=', selectedWalletId),
              cmp('toWalletId', '=', selectedWalletId),
            ),
          );
        },
        columns: {
          transactedAt: {
            label: 'Transacted at',
            format: (v: number) => new Date(v).toLocaleDateString(),
            editable: {
              type: 'date',
            },
          },
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
          toWalletId: {
            label: 'To',
            format: (value: string) => {
              const wallet = wallets.find((wallet) => wallet.id === value);

              if (wallet?.id === selectedWalletId) return 'Received';

              return wallet?.name ?? 'Unknown';
            },
            editable: {
              type: 'select',
              isDisabled: (value) => value === selectedWalletId,
              items: wallets.map((wallet) => ({
                label: wallet.name,
                value: wallet.id,
              })),
            },
          },
          relatedCategoryId: {
            label: 'Category',
            format: (value: string) => {
              const category = categories.find(
                (category) => category.id === value,
              );

              return category?.name ?? 'Unknown';
            },
            editable: {
              type: 'select',
              items: categories.map((category) => ({
                label: category.name || 'No name',
                value: category.id,
              })),
            },
          },
          description: {
            label: 'Description',
            editable: {
              type: 'text',
            },
          },
          type: {
            label: 'Type',
            editable: {
              type: 'select',
              items: Object.values(TransactionTypeEnum.Values).map((value) => ({
                label: value,
                value,
              })),
            },
          },
        },
      })}
    />
  );
}
