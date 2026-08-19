/**
 * Policy number allocation.
 *
 * Numbers were previously derived from `prisma.policy.count()`. That is only
 * safe while no row is ever deleted: deleting policies lowers the count while
 * the numbers they used remain taken, so the next issuance reuses an existing
 * number and `policy.create()` fails the unique constraint on `policyNumber`.
 * Because that throw happened before any logging, payments were left marked
 * SUCCEEDED with no policy and no trace of why.
 *
 * Numbering is therefore based on the highest sequence ever issued, not the
 * row count, and creation retries on collision so two issuances racing for the
 * same number resolve instead of failing.
 */

const YEAR_PREFIX = 2023;

export function formatPolicyNumber(sequence: number): string {
  return `Policy-${YEAR_PREFIX}-${String(sequence).padStart(6, "0")}`;
}

/** Reads the trailing sequence out of a policy number; 0 if unparseable. */
export function parsePolicySequence(policyNumber: string): number {
  const parsed = Number(policyNumber.split("-")[2]);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Next sequence after the highest ever issued. Deletions cannot lower it. */
export function nextSequenceFrom(highestIssued: number | null | undefined): number {
  return (highestIssued ?? 0) + 1;
}

/** A Prisma unique-constraint violation on the policyNumber column. */
function isPolicyNumberCollision(err: unknown): boolean {
  const e = err as { code?: string; meta?: { target?: unknown } };
  if (e?.code !== "P2002") return false;
  const target = e.meta?.target;
  return Array.isArray(target) ? target.includes("policyNumber") : target === "policyNumber";
}

/**
 * Creates a policy, retrying with the next sequence if the number was taken
 * between reading the maximum and inserting. Anything that is not a
 * policyNumber collision is rethrown untouched.
 */
export async function createWithUniqueNumber<T>(
  nextSequence: () => Promise<number>,
  create: (policyNumber: string) => Promise<T>,
  attempts = 5
): Promise<T> {
  const start = await nextSequence();

  for (let i = 0; i < attempts; i++) {
    try {
      return await create(formatPolicyNumber(start + i));
    } catch (err) {
      if (!isPolicyNumberCollision(err)) throw err;
    }
  }

  throw new Error(
    `Could not allocate a unique policy number after ${attempts} attempts (from ${formatPolicyNumber(start)})`
  );
}
