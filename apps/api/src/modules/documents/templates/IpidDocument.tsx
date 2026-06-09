import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { DemoDocumentLayout } from "./DemoDocumentLayout";
import { DayDriveLogo } from "./DayDriveLogo";

const s = StyleSheet.create({
  root: { marginTop: -22 },

  // ── Logo + title header ──────────────────────────────────
  hdr: { marginBottom: 6 },
  logo: { width: 140, height: 48 },
  docTitle: { fontSize: 9, fontWeight: 700, marginTop: 3, color: "#111" },

  // ── Section heading ──────────────────────────────────────
  sectionHead: { fontSize: 8.5, fontWeight: 700, marginBottom: 3, marginTop: 6 },

  // ── Important notice ─────────────────────────────────────
  noticeText: { fontSize: 7.5, lineHeight: 1.5, marginBottom: 6 },

  // ── Details tables ───────────────────────────────────────
  table: { marginBottom: 6 },
  tableRule: { borderBottomWidth: 1, borderBottomColor: "#111", marginBottom: 4, marginTop: 2 },
  tableRow: { flexDirection: "row", marginBottom: 3 },
  tdLabel: { width: 100, fontSize: 8, fontWeight: 700 },
  tdValue: { flex: 1, fontSize: 8 },

  // ── Two-column layout ─────────────────────────────────────
  cols: { flexDirection: "row" },
  colLeft: { flex: 1, paddingRight: 14, borderRightWidth: 1, borderRightColor: "#ddd" },
  colRight: { flex: 1, paddingLeft: 14 },

  // ── Declaration section ───────────────────────────────────
  declHead: { fontSize: 8.5, fontWeight: 700, marginBottom: 4, marginTop: 6 },
  declIntro: { fontSize: 7.5, lineHeight: 1.5, marginBottom: 6 },
  declNumHead: { fontSize: 8, fontWeight: 700, marginBottom: 3, marginTop: 4 },
  declItem: { flexDirection: "row", marginBottom: 3, paddingLeft: 2 },
  declLetter: { width: 16, fontSize: 7.5 },
  declText: { flex: 1, fontSize: 7.5, lineHeight: 1.45 },
  declTopNum: { flexDirection: "row", marginBottom: 4 },
  declTopNumLabel: { width: 16, fontSize: 8, fontWeight: 700 },
  declTopNumText: { flex: 1, fontSize: 8, fontWeight: 700 },

  // ── Footer ───────────────────────────────────────────────
  footerSite: { fontSize: 9, fontWeight: 700, color: "#081B3A", marginTop: 10, marginBottom: 2 },
  footerLegal: { fontSize: 6.5, color: "#374151", lineHeight: 1.5 },
  footerTag: { fontSize: 10, fontStyle: "italic", color: "#374151", textAlign: "right", marginTop: 4 },
});

export interface IpidDocumentProps {
  policyNumber: string;
  policyholderName: string;
  userEmail: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  dateOfBirth: string;
  yearsHeldLicence: number;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  startDate: string;
  startTime: string;
  durationDays: number;
}

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.tableRow}>
      <Text style={s.tdLabel}>{label}</Text>
      <Text style={s.tdValue}>{value}</Text>
    </View>
  );
}

function DeclItem({ letter, children }: { letter: string; children: string }) {
  return (
    <View style={s.declItem}>
      <Text style={s.declLetter}>{letter}.</Text>
      <Text style={s.declText}>{children}</Text>
    </View>
  );
}

export function IpidDocument({
  policyholderName,
  userEmail,
  addressLine1,
  addressLine2,
  city,
  postcode,
  dateOfBirth,
  yearsHeldLicence,
  vehicleRegistration,
  vehicleMake,
  vehicleModel,
  startDate,
  startTime,
  durationDays,
}: IpidDocumentProps) {
  const address2 = [addressLine2, city, postcode].filter(Boolean).join(", ");

  return (
    <DemoDocumentLayout title="">
      <View style={s.root}>
        <View style={s.cols}>

          {/* ── LEFT COLUMN ── */}
          <View style={s.colLeft}>

            {/* Logo + doc title */}
            <View style={s.hdr}>
              <DayDriveLogo height={48} />
              <Text style={s.docTitle}>Statement of fact - Day Drive Short Term Motor</Text>
            </View>

            {/* Important notice */}
            <Text style={s.sectionHead}>Important - Please read carefully</Text>
            <Text style={s.noticeText}>
              This Statement of Fact is a record of information given by you which has been used
              to assess the risk and decide terms and conditions for your contract of insurance.
              You must check this document and tell us straight away if any of the information is
              incorrect or incomplete. Failure to do this may mean that your policy becomes invalid
              or does not operate in the event of a claim or that you may experience difficulty
              getting insurance or need to pay extra premium in the future. Any amendment to your
              information may change your terms or conditions or mean that we may no longer be
              able to offer cover.
            </Text>

            {/* Driver details */}
            <Text style={s.sectionHead}>Driver details - Main driver:</Text>
            <View style={s.table}>
              <TableRow label="Name:" value={policyholderName} />
              <TableRow label="Email Address:" value={userEmail} />
              <TableRow label="Phone:" value="—" />
              <TableRow label="Address 1:" value={addressLine1} />
              <TableRow label="Address 2:" value={address2} />
              <TableRow label="DOB:" value={dateOfBirth} />
              <TableRow label="Occupation:" value="—" />
              <TableRow label="Licence Type:" value="Full UK" />
              <TableRow label="Country of Issue:" value="UK" />
              <TableRow label="Length of Licence:" value={`${yearsHeldLicence} Years`} />
            </View>
            <View style={s.tableRule} />

            {/* Vehicle details */}
            <Text style={s.sectionHead}>Vehicle details:</Text>
            <View style={s.table}>
              <TableRow label="Registration:" value={vehicleRegistration} />
              <TableRow label="Make:" value={vehicleMake} />
              <TableRow label="Model:" value={vehicleModel} />
              <TableRow label="Cover:" value="Comprehensive" />
              <TableRow label="Reason for Cover:" value="Personal Use" />
              <TableRow label="Duration:" value={`${durationDays} Day${durationDays !== 1 ? "s" : ""}`} />
              <TableRow label="Start Date:" value={startDate} />
              <TableRow label="Start Time:" value={startTime} />
            </View>
            <View style={s.tableRule} />

            {/* Declaration heading */}
            <Text style={s.declHead}>Day Drive - Short Term Insurance Declaration</Text>
            <Text style={s.declIntro}>
              This is a copy of the declaration that you have agreed to as part of purchasing
              insurance from Day Drive. You have agreed that you meet the following Assumptions
              and Eligibility Criteria. Failure to meet the Assumptions and Eligibility Criteria
              could invalidate your insurance. You must make sure that you continue to fit this
              criteria at all times.
            </Text>

            {/* Section 1 */}
            <View style={s.declTopNum}>
              <Text style={s.declTopNumLabel}>1.</Text>
              <Text style={s.declTopNumText}>I declare that I and any named driver:</Text>
            </View>
            <DeclItem letter="a">Are aged between 17 and 75 years of age;</DeclItem>
            <DeclItem letter="b">Hold a Full United Kingdom driving licence, Full EU or Full EEA Driver's License, or a United Kingdom Provisional Drivers licence;</DeclItem>
            <DeclItem letter="c">That holds an EU Driving Licence must be a current UK resident, with a minimum length of residency of 12 consecutive months in the 1 year prior to inception;</DeclItem>
            <DeclItem letter="d">Are not aware of any pending prosecution or Police enquiry pending for any motoring offences;</DeclItem>
            <DeclItem letter="e">Have no more than 6 penalty points on their driving licence following motoring convictions;</DeclItem>
            <DeclItem letter="f">Have not had any of the following conviction codes DR, CD, DD, UT & DG or have any motoring conviction that has a driving ban in the last 5 years;</DeclItem>
            <DeclItem letter="g">Have had no more than 1 claim in the last 3 years, regardless of fault.</DeclItem>
            <DeclItem letter="h">Do not have any unspent criminal convictions (other than motoring offences that are acceptable on the scheme) or police cautions in the last 5 years;</DeclItem>
            <DeclItem letter="i">Have not had a motor insurance policy cancelled, voided, refused or had a premium increase;</DeclItem>

            {/* Footer */}
            <Text style={s.footerSite}>daydrive.co.uk</Text>
            <Text style={s.footerLegal}>
              Day Drive is a trading name of Day Drive Ltd registered in England and Wales.{"\n"}
              Company Registration Number 05044963. Data Protection Registration ZA456686.{"\n"}
              Authorised and regulated by the Financial Conduct Authority under reference 751221.
            </Text>

          </View>

          {/* ── RIGHT COLUMN ── */}
          <View style={s.colRight}>

            <DeclItem letter="j">Do not live in any of the following; Squat, Static Caravan, Caravan, Barge, House Boat or No fixed Abode/address.</DeclItem>
            <DeclItem letter="k">Have no additional employment or occupation outside of that disclosed for the purposes of obtaining this insurance.</DeclItem>
            <DeclItem letter="l">That holds a Full UK Driving Licence and is aged between 18 and 20 years of age is prohibited from carrying passengers in the insured vehicle.</DeclItem>

            {/* Section 2 */}
            <View style={[s.declTopNum, { marginTop: 6 }]}>
              <Text style={s.declTopNumLabel}>2.</Text>
              <Text style={s.declTopNumText}>I declare that the vehicle:</Text>
            </View>
            <DeclItem letter="a">Will only be used by the policy holder and named driver;</DeclItem>
            <DeclItem letter="b">Will only be used for social, domestic and pleasure purposes or in person by you in connection with your business;</DeclItem>
            <DeclItem letter="c">Will not be used for any purpose in connection with the motor trade or use for hire and reward, racing, pacemaking, speed testing, competition, rallies, trials or track days or use on the Nürburgring Nordschleife;</DeclItem>
            <DeclItem letter="d">Is not impounded by the police;</DeclItem>
            <DeclItem letter="e">Is 25 years old or less from the date of first registration;</DeclItem>
            <DeclItem letter="f">Will not be used to carry hazardous, corrosive or explosive goods;</DeclItem>
            <DeclItem letter="g">Has not been modified apart from modifications for disability purposes. (Please note, modifications, whether carried out by you or someone else, include any changes to standard specification, either cosmetic or performance enhancing such as (but not limited to) bodywork, suspension, engine, exhaust, spoilers, alloys and paintwork / wrap).</DeclItem>
            <DeclItem letter="h">Has no more than 7 seats.</DeclItem>
            <DeclItem letter="i">Is right-hand drive only.</DeclItem>
            <DeclItem letter="j">Has a valid MOT certificate.</DeclItem>
            <DeclItem letter="k">Has not been recorded as a Category A or B insurance total loss.</DeclItem>
            <DeclItem letter="l">Is not a Q plated vehicle.</DeclItem>
            <DeclItem letter="m">Is registered in Great Britain, Northern Ireland or the Isle of Man;</DeclItem>
            <DeclItem letter="n">Will be in the UK at the start of the policy and will not be exported from the UK during the duration of the policy;</DeclItem>
            <DeclItem letter="o">Has a current market value not exceeding £65,000. For drivers under 25 years of age this is limited to £50,000. The minimum vehicle value is £500.</DeclItem>

            {/* Items 3–8 */}
            <View style={[s.declTopNum, { marginTop: 6 }]}>
              <Text style={s.declTopNumLabel}>3.</Text>
              <Text style={s.declText}>I am aware that this temporary insurance policy cannot be used for Hire or Loan Vehicles (i.e. Vehicle Rentals, Vehicle Salvage or Recovery Agents, Credit Hire Vehicles or Companies and Accident Management Companies).</Text>
            </View>
            <View style={s.declTopNum}>
              <Text style={s.declTopNumLabel}>4.</Text>
              <Text style={s.declText}>I declare that the Certificate of Motor Insurance and any other document will not be used as evidence of insurance for the release of a vehicle impounded or confiscated by the Police or Local Authority.</Text>
            </View>
            <View style={s.declTopNum}>
              <Text style={s.declTopNumLabel}>5.</Text>
              <Text style={s.declText}>I am aware that this policy has a minimum excess in respect of Accidental Damage, Malicious Damage, Fire and Theft claims of £500.</Text>
            </View>
            <View style={s.declTopNum}>
              <Text style={s.declTopNumLabel}>6.</Text>
              <Text style={s.declText}>I am aware that the driving of other cars is not permitted under this policy.</Text>
            </View>
            <View style={s.declTopNum}>
              <Text style={s.declTopNumLabel}>7.</Text>
              <Text style={s.declText}>I am aware that no amendments, alterations or changes can be made to this policy or Certificate of Motor Insurance once issued.</Text>
            </View>
            <View style={s.declTopNum}>
              <Text style={s.declTopNumLabel}>8.</Text>
              <Text style={s.declText}>I have read and agree that the above conditions are met and that I have taken reasonable care not to make any misrepresentation of the information I have provided.</Text>
            </View>

            <Text style={s.footerTag}>Be on your way</Text>

          </View>
        </View>
      </View>
    </DemoDocumentLayout>
  );
}
