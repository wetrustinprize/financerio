import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createType("transactionType", ["essential", "non-essential", "income"])

    pgm.createTable("categories", {
        id: {
            type: 'UUID',
            primaryKey: true,
            notNull: true,
            default: pgm.func("gen_random_uuid()")
        },
        name: {
            type: 'TEXT',
            notNull: false
        },
        archived: {
            type: 'boolean',
            notNull: true,
            default: false
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("current_timestamp")
        },
    });

    pgm.createTable("wallets", {
        id: {
            type: 'UUID',
            primaryKey: true,
            notNull: true,
            default: pgm.func("gen_random_uuid()")
        },
        name: {
            type: 'TEXT',
            notNull: true,
        },
        initialBudget: {
            type: 'FLOAT',
            default: 0
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("current_timestamp")
        },
    });

    pgm.createTable("transactions", {
        id: {
            type: 'UUID',
            primaryKey: true,
            notNull: true,
            default: pgm.func("gen_random_uuid()")
        },
        description: {
            type: 'TEXT',
            notNull: false,
        },
        amount: {
            type: 'float',
            notNull: false,
        },
        type: {
            type: '"transactionType"',
            notNull: false,
        },
        transactedAt: {
            type: 'timestamp',
            notNull: false,
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("current_timestamp")
        },

        relatedWalletId: {
            type: "UUID",
            notNull: false,
            references: '"wallets"',
            onDelete: "CASCADE",
        },

        relatedCategoryId: {
            type: "UUID",
            notNull: false,
            references: '"categories"',
            onDelete: "SET NULL",
        },

        toWalletId: {
            type: "UUID",
            notNull: false,
            references: '"wallets"',
            onDelete: "CASCADE",
        },
    });

    pgm.createIndex("transactions", "relatedWalletId");
    pgm.createIndex("transactions", "relatedCategoryId");
    pgm.createIndex("transactions", "toWalletId");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("transactions", "relatedWalletId");
    pgm.dropIndex("transactions", "relatedCategoryId");
    pgm.dropIndex("transactions", "toWalletId");

    pgm.dropTable("transactions");

    pgm.dropTable("wallets");
    pgm.dropTable("categories");

    pgm.dropType("transactionType");
}
