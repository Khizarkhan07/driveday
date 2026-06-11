import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { DemoDocumentLayout } from "./DemoDocumentLayout";
import { DayDriveLogo } from "./DayDriveLogo";
import { SignatureBlock } from "./SignatureBlock";

const s = StyleSheet.create({
  root: { marginTop: -22 },

  // Emergency notices above certificate box
  noticeRow: { marginBottom: 2 },
  noticeBold: { fontSize: 8, fontWeight: 700, textAlign: "center" },
  noticeItalic: { fontSize: 7.5, textAlign: "center", color: "#374151", marginBottom: 7 },

  // Outer border of the entire certificate
  certBox: { borderWidth: 1.5, borderColor: "#111" },

  // ── Header row: brand | title + description ──
  hdrRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111", minHeight: 58 },
  hdrBrand: { width: 140, borderRightWidth: 1, borderRightColor: "#111", padding: 8, justifyContent: "center", alignItems: "center" },
  hdrLogo: { width: 130, height: 45 },
  hdrTitle: { flex: 1, padding: 8 },
  hdrTitleText: { fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  hdrDesc: { fontSize: 7.5, lineHeight: 1.5 },
  hdrSite: { fontSize: 7.5, marginTop: 3, color: "#374151" },

  // ── CERTIFICATE No. row ──
  certNoRow: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111",
    padding: 4, paddingLeft: 5, alignItems: "center",
  },
  certNoLabel: { fontSize: 8, marginRight: 8 },
  certNoBox: { borderWidth: 1, borderColor: "#888", paddingHorizontal: 8, paddingVertical: 1 },
  certNoVal: { fontSize: 8.5, fontWeight: 700 },

  // ── Generic numbered field row ──
  fieldRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111" },
  numCell: { width: 16, borderRightWidth: 1, borderRightColor: "#111", padding: 3, paddingTop: 4 },
  numText: { fontSize: 7.5, fontWeight: 700 },
  labelCell: { width: 130, borderRightWidth: 1, borderRightColor: "#111", padding: 4 },
  labelText: { fontSize: 8, fontWeight: 700 },
  valueCell: { flex: 1, padding: 4 },

  // ── Value box (border around the dynamic value) ──
  valBox: { borderWidth: 1, borderColor: "#999", paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" },
  valText: { fontSize: 8.5, fontWeight: 700 },
  valSubText: { fontSize: 7.5, color: "#374151", marginTop: 1 },

  // ── Vehicle subtext row (bold, full width) ──
  subRow: { borderBottomWidth: 1, borderBottomColor: "#111", padding: 4 },
  subText: { fontSize: 7.5, fontWeight: 700, lineHeight: 1.4 },

  // ── Dual row: fields 3 & 4 side by side ──
  dualRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111" },
  dualLeft: { flex: 1, flexDirection: "row", borderRightWidth: 1, borderRightColor: "#111" },
  dualRight: { flex: 1, flexDirection: "row" },
  dualContent: { flex: 1, padding: 4 },
  dualLabel: { fontSize: 8, fontWeight: 700, marginBottom: 3 },

  // ── Field 5: persons entitled (large content) ──
  personsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111" },
  personsContent: { flex: 1, padding: 4 },
  personsVal: { fontSize: 9, fontWeight: 700, marginBottom: 6 },
  personsNote: { fontSize: 7.5, fontWeight: 700, lineHeight: 1.4 },

  // ── Field 6: limitations ──
  limitRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111" },
  limitContent: { flex: 1, padding: 4 },
  limitText: { fontSize: 7.5, lineHeight: 1.5, marginBottom: 4 },

  // ── Certification statement ──
  certifyRow: { padding: 5, paddingBottom: 3 },
  certifyText: { fontSize: 7.5, lineHeight: 1.6 },

  // ── For and on behalf ──
  onBehalfRow: { borderTopWidth: 1, borderTopColor: "#111", padding: 5, paddingBottom: 3 },
  onBehalfText: { fontSize: 8 },
  onBehalfName: { fontSize: 8.5, fontWeight: 700, marginTop: 1 },

  // ── Signature / agent area ──
  agentRow: { padding: 5, paddingTop: 4 },
  sigSpace: { width: 90, height: 18, borderBottomWidth: 1, borderBottomColor: "#555", marginBottom: 3 },
  agentName: { fontSize: 8.5, fontWeight: 700 },
  agentRole: { fontSize: 8 },
  agentAddr: { fontSize: 7.5, color: "#444" },

  // ── Note ──
  noteRow: { borderTopWidth: 1, borderTopColor: "#111", padding: 5 },
  noteLabel: { fontSize: 8, fontWeight: 700, marginBottom: 2 },
  noteText: { fontSize: 7.5, lineHeight: 1.5 },

  // ── Page footer ──
  footerText: { fontSize: 6.5, color: "#374151", lineHeight: 1.5, marginTop: 6 },
});

export interface CertificateDocumentProps {
  policyNumber: string;
  policyholderName: string;
  vehicleRegistration: string;
  vehicleDescription: string;
  startDate: string;
  endDate: string;
}

export function CertificateDocument({
  policyNumber,
  policyholderName,
  vehicleRegistration,
  vehicleDescription,
  startDate,
  endDate,
}: CertificateDocumentProps) {
  return (
    <DemoDocumentLayout title="">
      <View style={s.root}>

        {/* ── Emergency notices ── */}
        <View style={s.noticeRow}>
          <Text style={s.noticeBold}>
            All accidents and losses must be reported immediately to our Contact Centre (UK) on 0330 678 5659.
          </Text>
        </View>
        <View style={s.noticeRow}>
          <Text style={s.noticeBold}>IF YOU HAVE A WINDSCREEN CLAIM TELEPHONE 0330 678 5591.</Text>
        </View>
        <Text style={s.noticeItalic}>
          Don't make life easier for thieves, always remove the keys from your vehicle and lock it when you leave it, even temporarily.
          Not to do so may invalidate your cover so lock it or lose it!!!
        </Text>

        {/* ── Main certificate bordered box ── */}
        <View style={s.certBox}>

          {/* Header: Day Drive brand | Certificate title + description */}
          <View style={s.hdrRow}>
            <View style={s.hdrBrand}>
              <DayDriveLogo height={44} />
            </View>
            <View style={s.hdrTitle}>
              <Text style={s.hdrTitleText}>CERTIFICATE OF MOTOR INSURANCE</Text>
              <Text style={s.hdrDesc}>
                This certificate of motor insurance serves as evidence that you have the necessary coverage
                to comply with the law. This document is issued by us and confirms that you have a valid
                insurance policy for your vehicle.
              </Text>
              <Text style={s.hdrSite}>daydrive.co.uk</Text>
            </View>
          </View>

          {/* CERTIFICATE No. */}
          <View style={s.certNoRow}>
            <Text style={s.certNoLabel}>CERTIFICATE No.</Text>
            <View style={s.certNoBox}>
              <Text style={s.certNoVal}>{policyNumber}</Text>
            </View>
          </View>

          {/* Field 1: Registration mark of vehicle */}
          <View style={s.fieldRow}>
            <View style={s.numCell}><Text style={s.numText}>1.</Text></View>
            <View style={s.labelCell}><Text style={s.labelText}>Registration mark of vehicle</Text></View>
            <View style={s.valueCell}>
              <View style={s.valBox}>
                <Text style={s.valText}>{vehicleRegistration}</Text>
              </View>
              {vehicleDescription ? (
                <Text style={s.valSubText}>{vehicleDescription}</Text>
              ) : null}
            </View>
          </View>

          {/* Vehicle subtext */}
          <View style={s.subRow}>
            <Text style={s.subText}>
              Any motor car supplied to the Insured under an agreement between Us and a contracted recommended
              repairer, whilst the vehicle is being repaired as a result of damage covered by this policy, or any
              motor car supplied to the Insured under an agreement between Us and a contracted hire car provider
            </Text>
          </View>

          {/* Field 2: Insured */}
          <View style={s.fieldRow}>
            <View style={s.numCell}><Text style={s.numText}>2.</Text></View>
            <View style={s.labelCell}><Text style={s.labelText}>Insured</Text></View>
            <View style={s.valueCell}>
              <View style={s.valBox}>
                <Text style={s.valText}>{policyholderName}</Text>
              </View>
            </View>
          </View>

          {/* Fields 3 & 4: Period from | Expiry — side by side */}
          <View style={s.dualRow}>
            <View style={s.dualLeft}>
              <View style={s.numCell}><Text style={s.numText}>3.</Text></View>
              <View style={s.dualContent}>
                <Text style={s.dualLabel}>Period from</Text>
                <View style={s.valBox}>
                  <Text style={s.valText}>{startDate}</Text>
                </View>
              </View>
            </View>
            <View style={s.dualRight}>
              <View style={s.numCell}><Text style={s.numText}>4.</Text></View>
              <View style={s.dualContent}>
                <Text style={s.dualLabel}>Expiry</Text>
                <View style={s.valBox}>
                  <Text style={s.valText}>{endDate}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Field 5: Person or classes of persons entitled to drive */}
          <View style={s.personsRow}>
            <View style={s.numCell}><Text style={s.numText}>5.</Text></View>
            <View style={s.labelCell}><Text style={s.labelText}>Person or classes of persons entitled to drive</Text></View>
            <View style={s.personsContent}>
              <Text style={s.personsVal}>The Insured only</Text>
              <Text style={s.personsNote}>
                Provided that the person driving holds a licence to drive the vehicle or has held and is not
                disqualified from holding or obtaining such a licence.
              </Text>
            </View>
          </View>

          {/* Field 6: Limitations as to use */}
          <View style={s.limitRow}>
            <View style={s.numCell}><Text style={s.numText}>6.</Text></View>
            <View style={s.labelCell}><Text style={s.labelText}>Limitations as to use</Text></View>
            <View style={s.limitContent}>
              <Text style={s.limitText}>
                Use for Social Domestic and Pleasure Purposes and by the Insured in person in connection with
                his/her business or profession, excluding commercial travelling or the carriage of goods or samples
                in connection with any trade or business, use for hiring, the letting on hire, the carriage of
                passengers or goods for hire or reward, racing, pacemaking, use on any track, test circuit or off
                road activity, use in any contest, reliability or speed trial, or use in connection with the Motor Trade.
              </Text>
              <Text style={s.limitText}>
                Excluding use to secure the release of any motor vehicle which has been confiscated, seized or
                impounded by, or on behalf of, any Government or public authority.
              </Text>
            </View>
          </View>

          {/* Certification statement */}
          <View style={s.certifyRow}>
            <Text style={s.certifyText}>
              I hereby certify that the policy to which this certificate relates satisfies the requirements of the
              relevant law applicable in Great Britain, Northern Ireland, the Isle of Man, the Island of Guernsey,
              the Island of Jersey and the Island of Alderney.
            </Text>
          </View>

          {/* For and on behalf */}
          <View style={s.onBehalfRow}>
            <Text style={s.onBehalfText}>For and on behalf of</Text>
            <Text style={s.onBehalfName}>HIGHWAY INSURANCE COMPANY LTD.</Text>
            <Text style={s.onBehalfText}>Authorised Insurers</Text>
          </View>

          {/* Signature / agent area */}
          <View style={s.agentRow}>
            <SignatureBlock />
            <Text style={s.agentRole}>Authorised Broker</Text>
            <Text style={s.agentAddr}>37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA</Text>
          </View>

          {/* Note */}
          <View style={s.noteRow}>
            <Text style={s.noteLabel}>Note</Text>
            <Text style={s.noteText}>
              For full details of the insurance cover reference should be made to the policy documents.{"\n"}
              Nothing contained in this certificate affects your right as a Third Party to make a claim
            </Text>
          </View>

        </View>
        {/* ── End certificate box ── */}

        {/* Page footer legal text */}
        <Text style={s.footerText}>
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
