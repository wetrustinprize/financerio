import { createSchema, definePermissions, enumeration, number, relationships, string, table } from "@rocicorp/zero";
import type { TransactionType } from "./types/transactionType";

const walletsTable = table('wallets')
    .columns({
        id: string(),
        name: string(),
        initialBudget: number(),
    })
    .primaryKey("id")

const transactionsTable = table("transactions")
    .columns({
        id: string(),
        description: string().optional(),
        amount: number(),
        relatedWalletId: string(),
        relatedCategoryId: string(),
        // createdAt: ??? FIXME: Find out how to add date to Zero schema
        toWalletId: string(),
    })
    .primaryKey("id");

const categoriesTable = table('categories')
    .columns({
        id: string(),
        name: string(),
        type: enumeration<TransactionType>(),
    })
    .primaryKey("id");

const walletsRelationships = relationships(walletsTable, ({ many }) => ({
    transactions: many({
        sourceField: ['id'],
        destField: ['relatedWalletId'],
        destSchema: transactionsTable,
    })
}))

const categoriesRelationships = relationships(categoriesTable, ({ many }) => ({
    transactions: many({
        sourceField: ['id'],
        destField: ['relatedCategoryId'],
        destSchema: transactionsTable,
    })
}))

export const transactionsRelationships = relationships(transactionsTable, ({ many, one }) => ({
    relatedWallet: one({
        destField: ['id'],
        sourceField: ['relatedWalletId'],
        destSchema: walletsTable,
    }),
    relatedCategory: one({
        destField: ['id'],
        sourceField: ['relatedCategoryId'],
        destSchema: categoriesTable,
    }),
    toWallet: one({
        destField: ['id'],
        sourceField: ['toWalletId'],
        destSchema: walletsTable,
    }),
}));

export const schema = createSchema({
    tables: [categoriesTable, walletsTable, transactionsTable],
    relationships: [categoriesRelationships, walletsRelationships, transactionsRelationships]
});

export const permissions = definePermissions<unknown, Schema>(schema, () => ({}));

export type Schema = typeof schema;