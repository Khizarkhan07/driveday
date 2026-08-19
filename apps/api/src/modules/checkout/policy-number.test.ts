import { describe, expect, it, vi } from "vitest";
import {
  createWithUniqueNumber,
  formatPolicyNumber,
  nextSequenceFrom,
  parsePolicySequence,
} from "./policy-number";

describe("formatPolicyNumber", () => {
  it("pads the sequence to six digits", () => {
    expect(formatPolicyNumber(1)).toBe("Policy-2023-000001");
    expect(formatPolicyNumber(369)).toBe("Policy-2023-000369");
  });

  it("does not truncate sequences beyond six digits", () => {
    expect(formatPolicyNumber(1234567)).toBe("Policy-2023-1234567");
  });
});

describe("parsePolicySequence", () => {
  it("reads the sequence back out", () => {
    expect(parsePolicySequence("Policy-2023-000369")).toBe(369);
  });

  it("reads sequences from other year prefixes", () => {
    expect(parsePolicySequence("Policy-2026-000008")).toBe(8);
  });

  it("returns 0 for anything unparseable", () => {
    expect(parsePolicySequence("nonsense")).toBe(0);
    expect(parsePolicySequence("")).toBe(0);
  });

  it("round-trips with formatPolicyNumber", () => {
    expect(parsePolicySequence(formatPolicyNumber(42))).toBe(42);
  });
});

describe("nextSequenceFrom", () => {
  /**
   * The regression this whole module exists for: numbering was derived from
   * policy.count(), so deleting rows made it reissue numbers that already
   * existed, and policy.create() threw a unique violation.
   */
  it("continues past the highest number even when rows have been deleted", () => {
    // 358 rows remaining but 368 already issued — the live production state.
    expect(nextSequenceFrom(368)).toBe(369);
  });

  it("starts at 1 on an empty table", () => {
    expect(nextSequenceFrom(0)).toBe(1);
    expect(nextSequenceFrom(null)).toBe(1);
  });
});

describe("createWithUniqueNumber", () => {
  const uniqueViolation = Object.assign(new Error("Unique constraint failed"), {
    code: "P2002",
    meta: { target: ["policyNumber"] },
  });

  it("creates with the first number when there is no clash", async () => {
    const create = vi.fn().mockResolvedValue({ policyNumber: "Policy-2023-000369" });
    const result = await createWithUniqueNumber(async () => 369, create);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith("Policy-2023-000369");
    expect(result).toEqual({ policyNumber: "Policy-2023-000369" });
  });

  it("retries with the next number when two issuances race", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(uniqueViolation)
      .mockResolvedValue({ policyNumber: "Policy-2023-000370" });
    const result = await createWithUniqueNumber(async () => 369, create);
    expect(create).toHaveBeenNthCalledWith(1, "Policy-2023-000369");
    expect(create).toHaveBeenNthCalledWith(2, "Policy-2023-000370");
    expect(result).toEqual({ policyNumber: "Policy-2023-000370" });
  });

  it("keeps retrying through several collisions", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(uniqueViolation)
      .mockRejectedValueOnce(uniqueViolation)
      .mockRejectedValueOnce(uniqueViolation)
      .mockResolvedValue({ ok: true });
    await createWithUniqueNumber(async () => 369, create);
    expect(create).toHaveBeenCalledTimes(4);
    expect(create).toHaveBeenLastCalledWith("Policy-2023-000372");
  });

  it("gives up after the attempt limit rather than looping forever", async () => {
    const create = vi.fn().mockRejectedValue(uniqueViolation);
    await expect(createWithUniqueNumber(async () => 369, create, 3)).rejects.toThrow(
      /could not allocate a unique policy number/i
    );
    expect(create).toHaveBeenCalledTimes(3);
  });

  it("rethrows errors that are not policy-number collisions", async () => {
    const other = Object.assign(new Error("db down"), { code: "P1001" });
    const create = vi.fn().mockRejectedValue(other);
    await expect(createWithUniqueNumber(async () => 369, create)).rejects.toThrow("db down");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rethrows unique violations on other columns", async () => {
    const otherColumn = Object.assign(new Error("Unique constraint failed"), {
      code: "P2002",
      meta: { target: ["quoteId"] },
    });
    const create = vi.fn().mockRejectedValue(otherColumn);
    await expect(createWithUniqueNumber(async () => 369, create)).rejects.toThrow();
    expect(create).toHaveBeenCalledTimes(1);
  });
});
