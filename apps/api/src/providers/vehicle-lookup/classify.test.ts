import { describe, expect, it } from "vitest";
import { classifyVehicleType } from "@motorcover/shared-types";

/**
 * The typeApproval/wheelplan pairs below are real responses captured from the
 * CheckCarDetails API, so these lock in behaviour against actual DVLA data
 * rather than an assumed shape.
 */
describe("classifyVehicleType", () => {
  describe("from typeApproval (real API samples)", () => {
    it.each([
      ["M1", "2 AXLE RIGID BODY", "car"], // LR21ZTF Hyundai i20
      ["M1", "2 AXLE RIGID BODY", "car"], // GX15OMW Nissan Qashqai
      ["N1", "2 AXLE RIGID BODY", "van"], // WR21XCJ Ford Transit Custom
      ["N3", "3 AXLE RIGID BODY", "hgv"], // YD66TXP Volvo FM
      ["L3", "2 WHEEL", "motorcycle"], // RK64UBL Yamaha MT
      ["L3", "2 WHEEL", "motorcycle"], // KN18ZRE Suzuki DL1000
    ])("maps %s to %s", (approval, wheelplan, expected) => {
      expect(classifyVehicleType(approval, wheelplan)).toBe(expected);
    });

    it("treats N2 as an HGV alongside N3", () => {
      expect(classifyVehicleType("N2", "2 AXLE RIGID BODY")).toBe("hgv");
    });

    it("maps buses and coaches to other", () => {
      expect(classifyVehicleType("M2", "2 AXLE RIGID BODY")).toBe("other");
      expect(classifyVehicleType("M3", "3 AXLE RIGID BODY")).toBe("other");
    });

    it("maps trailers and tractors to other", () => {
      expect(classifyVehicleType("O2", null)).toBe("other");
      expect(classifyVehicleType("T1", null)).toBe("other");
    });

    it("accepts the L*e spelling used by newer approvals", () => {
      expect(classifyVehicleType("L3e", "2 WHEEL")).toBe("motorcycle");
      expect(classifyVehicleType("L1e", null)).toBe("motorcycle");
    });

    it("is case and whitespace insensitive", () => {
      expect(classifyVehicleType(" n1 ", null)).toBe("van");
      expect(classifyVehicleType("m1", null)).toBe("car");
    });
  });

  describe("falling back to wheelplan", () => {
    it("identifies a pre-1996 motorcycle with no type approval", () => {
      // SVS608, a 1961 Triumph — real response, typeApproval is null.
      expect(classifyVehicleType(null, "2 WHEEL")).toBe("motorcycle");
    });

    it("treats a trike as a motorcycle", () => {
      expect(classifyVehicleType(undefined, "3 WHEEL")).toBe("motorcycle");
    });

    it("treats 3+ axles as an HGV", () => {
      expect(classifyVehicleType(null, "3 AXLE RIGID BODY")).toBe("hgv");
      expect(classifyVehicleType(null, "4 AXLE RIGID BODY")).toBe("hgv");
    });

    it("treats articulated vehicles as HGVs", () => {
      expect(classifyVehicleType(null, "ARTICULATED")).toBe("hgv");
    });

    it("defaults a 2-axle rigid body to car when the category is unknown", () => {
      expect(classifyVehicleType(null, "2 AXLE RIGID BODY")).toBe("car");
    });
  });

  describe("degrading safely", () => {
    it("defaults to car when nothing is known", () => {
      expect(classifyVehicleType(null, null)).toBe("car");
      expect(classifyVehicleType(undefined, undefined)).toBe("car");
      expect(classifyVehicleType("", "")).toBe("car");
    });

    it("does not throw on an unrecognised category", () => {
      expect(classifyVehicleType("ZZ9", null)).toBe("car");
    });
  });
});
