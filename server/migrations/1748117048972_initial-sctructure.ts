import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createType("transactionType", ["essential", "non-essential", "income"])

    pgm.createTable("categories", {
        id: 'id',
        name: { type: 'TEXT', notNull: true },
        type: { type: '"transactionType"', notNull: true },
        archived: { type: 'boolean', default: false },
    });

    pgm.createTable("wallets", {
        id: 'id',
        name: { type: 'TEXT', notNull: true },
        initialBudget: {type: 'FLOAT', default: 0 },
    });

    pgm.createTable("transactions", {
        id: 'id',
        description: { type: 'TEXT'},
        amount: {type: 'float', notNull: true},
        createdAt: {type: 'timestamp', notNull: true, default: pgm.func("current_timestamp")},

        relatedWalletId: {
            type: "INTEGER",
            notNull: true,
            references: '"wallets"',
            onDelete: "CASCADE",
        },

        relatedCategoryId: {
            type: "INTEGER",
            notNull: false,
            references: '"categories"',
            onDelete: "SET NULL",
        },

        toWalletId: {
            type: "INTEGER",
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
