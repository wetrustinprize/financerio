import { boolean, createSchema, definePermissions, enumeration, number, relationships, string, table, type ExpressionBuilder } from "@rocicorp/zero";
import type { TransactionType } from "./types/transactionType";

const walletsTable = table('wallets')
    .columns({
        id: string(),
        name: string(),
        initialBudget: number(),
        createdAt: number(),
    })
    .primaryKey("id")

const transactionsTable = table("transactions")
    .columns({
        id: string(),
        createdAt: number(),
        description: string().optional(),
        amount: number().optional(),
        type: enumeration<TransactionType>().optional(),
        transactedAt: number().optional(),
        relatedWalletId: string().optional(),
        relatedCategoryId: string().optional(),
        toWalletId: string().optional(),
    })
    .primaryKey("id");

const categoriesTable = table('categories')
    .columns({
        id: string(),
        archived: boolean(),
        createdAt: number(),
        name: string().optional(),
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

type AuthData = {
    sub: string | null;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
    const allowIfLoggedInFn = (
        authData: AuthData,
        { cmpLit }: ExpressionBuilder<Schema, keyof Schema["tables"]>
    ) => cmpLit(authData.sub, "IS NOT", null);

    const allowIfLogged = {
        row: {
            insert: [allowIfLoggedInFn],
            update: {
                preMutation: [allowIfLoggedInFn],
                postMutation: [allowIfLoggedInFn],
            },
            delete: [allowIfLoggedInFn],
            select: [allowIfLoggedInFn],
        }
    }

    return {
        wallets: allowIfLogged,
        categories: allowIfLogged,
    };
});

export type Schema = typeof schema;