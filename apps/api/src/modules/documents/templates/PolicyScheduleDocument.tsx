import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { DemoDocumentLayout } from "./DemoDocumentLayout";
import { DayDriveLogo } from "./DayDriveLogo";

const s = StyleSheet.create({
  root: { marginTop: -22 },

  // ── Header ──────────────────────────────────────────────
  hdr: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#111",
    paddingBottom: 8,
    marginBottom: 12,
  },
  hdrLogo: { width: 160, height: 55 },
  hdrTitle: { flex: 1, alignItems: "flex-end" },
  hdrTitleMain: { fontSize: 20, fontWeight: 700, color: "#081B3A" },
  hdrTitleSub: { fontSize: 10, color: "#374151", letterSpacing: 2, marginTop: 1 },

  // ── Info grid: two columns ───────────────────────────────
  infoGrid: { flexDirection: "row", marginBottom: 8 },
  infoLeft: { flex: 1, paddingRight: 16 },
  infoRight: { width: 240 },

  infoRow: { flexDirection: "row", marginBottom: 6, alignItems: "flex-start" },
  infoLabel: { width: 90, fontSize: 8.5, color: "#374151" },
  infoValue: { flex: 1, fontSize: 8.5, fontWeight: 700, color: "#111" },
  infoValueMulti: { flex: 1, fontSize: 8.5, fontWeight: 700, color: "#111", lineHeight: 1.5 },

  premiumNote: { fontSize: 7.5, color: "#374151", marginTop: -4, marginLeft: 90, marginBottom: 6 },

  // ── Vehicle table ────────────────────────────────────────
  vehicleSection: { marginBottom: 4 },
  vehicleHdr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    paddingBottom: 3,
    marginBottom: 3,
  },
  vehicleRow: { flexDirection: "row", paddingBottom: 4 },
  vColVehicle: { flex: 3, fontSize: 8.5 },
  vColCC: { width: 45, fontSize: 8.5, textAlign: "center" },
  vColValue: { width: 55, fontSize: 8.5, textAlign: "center" },
  vColReg: { width: 65, fontSize: 8.5, textAlign: "center" },
  vColCover: { flex: 2, fontSize: 8.5 },
  vHdrText: { fontWeight: 700 },
  vValText: { fontWeight: 700 },

  // ── Endorsements operative line ──────────────────────────
  endorseLine: { fontSize: 8, color: "#374151", marginBottom: 4 },

  // ── Endorsements bordered box ────────────────────────────
  endBox: { borderWidth: 1, borderColor: "#bbb", padding: 8, marginBottom: 10 },

  excessIntro: { fontSize: 7.5, marginBottom: 4, lineHeight: 1.4 },
  excessHdr: { flexDirection: "row", marginBottom: 2 },
  excessRow: { flexDirection: "row", marginBottom: 6 },
  excessColName: { flex: 2, fontSize: 8 },
  excessColSec3: { flex: 1, fontSize: 8 },
  excessColSec2: { flex: 1, fontSize: 8 },
  excessHdrText: { fontWeight: 700 },

  endorseTitle: { fontSize: 9, fontWeight: 700, marginTop: 6, marginBottom: 3 },
  endorseText: { fontSize: 8, lineHeight: 1.5, marginBottom: 4 },

  // ── Footer ──────────────────────────────────────────────
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: "#bbb",
    flexDirection: "row",
    paddingTop: 5,
    marginTop: 6,
  },
  footerLeft: { flex: 1 },
  footerRight: { flex: 1 },
  footerLabel: { fontSize: 8 },
  footerValue: { fontSize: 8, fontWeight: 700 },
  footerLegal: { fontSize: 6.5, color: "#374151", lineHeight: 1.5, marginTop: 5 },
});

export interface PolicyScheduleDocumentProps {
  policyNumber: string;
  policyholderName: string;
  insuredAddress: string;
  vehicleRegistration: string;
  vehicleDescription: string;
  startDate: string;
  endDate: string;
  premium: string;
  dateOfIssue: string;
}

export function PolicyScheduleDocument({
  policyNumber,
  policyholderName,
  insuredAddress,
  vehicleRegistration,
  vehicleDescription,
  startDate,
  endDate,
  premium,
  dateOfIssue,
}: PolicyScheduleDocumentProps) {
  return (
    <DemoDocumentLayout title="">
      <View style={s.root}>

        {/* ── Header ── */}
        <View style={s.hdr}>
          <DayDriveLogo height={52} />
          <View style={s.hdrTitle}>
            <Text style={s.hdrTitleMain}>DAY DRIVE INSURANCE</Text>
            <Text style={s.hdrTitleSub}>SCHEDULE</Text>
          </View>
        </View>

        {/* ── Info grid ── */}
        <View style={s.infoGrid}>

          {/* Left column */}
          <View style={s.infoLeft}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Policy No.</Text>
              <Text style={s.infoValue}>{policyNumber}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Insured</Text>
              <Text style={s.infoValue}>{policyholderName}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Insured's Address</Text>
              <Text style={s.infoValueMulti}>{insuredAddress}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Occupation</Text>
              <Text style={s.infoValue}>—</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Period from</Text>
              <Text style={s.infoValue}>{startDate}</Text>
            </View>
          </View>

          {/* Right column */}
          <View style={s.infoRight}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Date of issue</Text>
              <Text style={s.infoValue}>{dateOfIssue}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Reason for Schedule Issue</Text>
              <Text style={s.infoValue}>{"\n"}New Business</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Premium</Text>
              <Text style={s.infoValue}>{premium}</Text>
            </View>
            <Text style={s.premiumNote}>(Including Insurance Premium Tax)</Text>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Expiry</Text>
              <Text style={s.infoValue}>{endDate}</Text>
            </View>
          </View>
        </View>

        {/* ── Vehicle table ── */}
        <View style={s.vehicleSection}>
          <View style={s.vehicleHdr}>
            <Text style={[s.vColVehicle, s.vHdrText]}>Vehicle</Text>
            <Text style={[s.vColCC, s.vHdrText]}>CC</Text>
            <Text style={[s.vColValue, s.vHdrText]}>Value</Text>
            <Text style={[s.vColReg, s.vHdrText]}>Reg. No.</Text>
            <Text style={[s.vColCover, s.vHdrText]}>Cover</Text>
          </View>
          <View style={s.vehicleRow}>
            <Text style={[s.vColVehicle, s.vValText]}>{vehicleDescription}</Text>
            <Text style={[s.vColCC, s.vValText]}>—</Text>
            <Text style={[s.vColValue, s.vValText]}>—</Text>
            <Text style={[s.vColReg, s.vValText]}>{vehicleRegistration}</Text>
            <Text style={[s.vColCover, s.vValText]}>Comprehensive</Text>
          </View>
        </View>

        <Text style={s.endorseLine}>Endorsements operative in respect of Vehicle detailed</Text>

        {/* ── Endorsements box ── */}
        <View style={s.endBox}>
          <Text style={s.excessIntro}>
            The following drivers must pay the first amount shown if a claim is made under the following sections of the policy document:
          </Text>
          <View style={s.excessHdr}>
            <Text style={[s.excessColName, s.excessHdrText]}>Drivers Name</Text>
            <Text style={[s.excessColSec3, s.excessHdrText]}>Section 3 (Accidental Damage)</Text>
            <Text style={[s.excessColSec2, s.excessHdrText]}>Section 2 (Fire and Theft)</Text>
          </View>
          <View style={s.excessRow}>
            <Text style={s.excessColName}>{policyholderName}</Text>
            <Text style={s.excessColSec3}>£500</Text>
            <Text style={s.excessColSec2}>£500</Text>
          </View>

          <Text style={s.endorseTitle}>Endorsement B008 - PC Windscreen</Text>
          <Text style={s.endorseText}>
            If you use our approved repairers, Highway Glassline (0800 678 1010), there is no limit on the amount
            we will pay for windscreen damage under Section 4 of the document.
          </Text>
          <Text style={s.endorseText}>
            If you use any other supplier the most we pay is £100. You must pay the first £75 if you claim for
            Windscreen damage under this insurance.
          </Text>

          <Text style={s.endorseTitle}>Endorsement B014 - PC Comp Audio</Text>
          <Text style={s.endorseText}>
            The most we will pay for fitted Audio equipment under Section 2 and Section 3 of the policy document
            is £500 unless it is the manufacturer's standard fitted equipment.
          </Text>
        </View>

        {/* ── Bottom footer ── */}
        <View style={s.footerRow}>
          <View style={s.footerLeft}>
            <Text style={s.footerLabel}>Broker  <Text style={s.footerValue}>Day Drive</Text></Text>
            <Text style={s.footerLabel}>Broker Ref.  <Text style={s.footerValue}>{policyNumber}</Text></Text>
          </View>
          <View style={s.footerRight}>
            <Text style={s.footerLabel}>Broker No.  <Text style={s.footerValue}>Day Drive Ltd</Text></Text>
          </View>
        </View>

        <Text style={s.footerLegal}>
          Day Drive is a trading name of Day Drive Ltd, registered in England and Wales (company number 05044963).
          Authorised and regulated by the Financial Conduct Authority, FCA reference number 751221.
          Registered address: 37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA.
          Underwritten by Highway Insurance Company Limited, registered in England and Wales number 3730662.
          Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority
          and the Prudential Regulation Authority, register number 202972.
        </Text>

      </View>
    </DemoDocumentLayout>
  );
}
