-- Quote.coverType was added to schema.prisma without a matching migration, so
-- `prisma migrate deploy` produced a database the application could not use:
-- creating a quote failed with "The column `coverType` does not exist".
-- It surfaced when the Irish market's database was built from migrations for
-- the first time; the UK database already had the column from an earlier
-- `db push`, which is why nothing had noticed.
--
-- IF NOT EXISTS so this is safe to apply to a database that already has it.
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "coverType" TEXT NOT NULL DEFAULT 'PERSONAL';
