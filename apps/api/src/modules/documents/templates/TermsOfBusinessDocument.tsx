import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { DemoDocumentLayout } from "./DemoDocumentLayout";
import { DayDriveLogo } from "./DayDriveLogo";

const s = StyleSheet.create({
  h1: { fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 12, color: "#1f2937" },
  h2: { fontSize: 11, fontWeight: 700, marginBottom: 4, marginTop: 10, color: "#1f2937" },
  p: { fontSize: 9, marginBottom: 5, lineHeight: 1.5, color: "#374151" },
  bullet: { fontSize: 9, marginBottom: 3, marginLeft: 12, lineHeight: 1.5, color: "#374151" },
  rule: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 8 },
  table: { marginVertical: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#9ca3af", paddingVertical: 4 },
  col1: { flex: 2, fontSize: 9, color: "#374151", paddingRight: 8 },
  col2: { flex: 1, fontSize: 9, color: "#374151" },
  colHeader: { fontWeight: 700 },
  footer: { fontSize: 8, color: "#6b7280", marginTop: 16 },
  updated: { fontSize: 8, color: "#6b7280", marginTop: 4 },
});

const H1 = ({ children }: { children: React.ReactNode }) => <Text style={s.h1}>{children}</Text>;
const H2 = ({ children }: { children: React.ReactNode }) => <Text style={s.h2}>{children}</Text>;
const P = ({ children }: { children: React.ReactNode }) => <Text style={s.p}>{children}</Text>;
const Bullet = ({ children }: { children: React.ReactNode }) => <Text style={s.bullet}>• {children}</Text>;
const Rule = () => <View style={s.rule} />;

export function TermsOfBusinessDocument() {
  return (
    <DemoDocumentLayout title="">
      <View style={{ marginTop: -20, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 8, marginBottom: 10 }}>
        <DayDriveLogo height={45} />
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: 700, color: "#081B3A" }}>Day Drive — Terms of Business</Text>
          <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>Please read these Terms of Business carefully</Text>
        </View>
      </View>
      <P>
        Day Drive is a trading name of Day Drive Ltd, registered in England and Wales (company number 05044963),
        authorised and regulated by the Financial Conduct Authority (FCA reference number 751221).
        Our registered address is: 37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA.
      </P>
      <P>
        We arrange short term motor insurance policies on behalf of insurers. These Terms of Business ("Terms")
        set out the basis on which we will provide services to you. Please read them carefully.
      </P>

      <Rule />

      <H1>1. Accepting These Terms</H1>
      <P>
        By proceeding with a quotation or purchasing a policy through Day Drive, you confirm that you have
        read, understood, and agree to be bound by these Terms of Business. If you do not accept these Terms,
        you should not proceed with any purchase.
      </P>
      <P>
        These Terms are effective from the date you first use our services and remain in force until terminated
        in accordance with the cancellation provisions set out below.
      </P>

      <H1>2. Our Status</H1>
      <P>
        Day Drive is an insurance intermediary. We act as an agent of the insurer when arranging your policy.
        We are authorised and regulated by the Financial Conduct Authority. You can check our details on the
        FCA Register at www.fca.org.uk/register or by contacting the FCA on 0800 111 6768.
      </P>
      <P>
        We do not provide personal recommendations or advice. The information we provide is for general
        informational purposes only and you should consider whether any product is suitable for your needs.
      </P>

      <H1>3. How We Work</H1>
      <P>
        Day Drive operates as an online insurance intermediary, presenting products from a panel of insurers.
        We search our panel to find a policy that meets the criteria you have provided. We present quotations
        on a non-advised basis — it is your responsibility to ensure the policy you choose meets your needs.
      </P>
      <P>We work with insurers and other intermediaries to place your business. Key steps in our service:</P>
      <Bullet>We collect information from you to obtain quotations</Bullet>
      <Bullet>We present the most suitable quotation(s) from our panel</Bullet>
      <Bullet>We facilitate payment and issue your policy documents</Bullet>
      <Bullet>We assist with mid-term adjustments and cancellations where applicable</Bullet>

      <H1>4. Information We Need From You</H1>
      <P>
        You must provide accurate and complete information when obtaining a quotation or purchasing a policy.
        Providing false or misleading information may result in your policy being invalid or a claim being declined.
      </P>
      <P>
        You have a duty of fair presentation under the Insurance Act 2015. This means you must disclose all
        material facts that a prudent insurer would want to know. If you are unsure whether information is
        material, you should disclose it.
      </P>
      <P>
        You must tell us immediately if any information you have provided changes before or during the policy
        period. Failure to do so may affect the validity of your cover.
      </P>

      <H1>5. Quotations</H1>
      <P>
        All quotations are provided subject to the information you supply being accurate and complete. Quotations
        are valid only for the period stated. Acceptance of a quotation and completion of payment constitutes a
        binding contract of insurance, subject to the insurer's policy terms and conditions.
      </P>
      <P>
        Premiums are calculated based on the risk information provided and are subject to Insurance Premium Tax
        (IPT) at the prevailing rate. The total premium payable, including all fees and taxes, will be displayed
        clearly before you confirm your purchase.
      </P>

      <H1>6. Payment Terms</H1>
      <P>
        Payment for all policies must be made in full at inception. We accept payment by debit card and credit
        card. No cover will commence until payment has been received and confirmed.
      </P>
      <P>
        All payments are processed securely by our payment provider. Day Drive does not store your card details.
        We will provide you with a receipt confirming your payment.
      </P>

      <H1>7. Protecting Your Money</H1>
      <P>
        Premiums collected by Day Drive are held in a client money account that is separate from our own funds.
        Your money is protected and held on trust until it is passed to the insurer or returned to you.
      </P>
      <P>
        In the event of our insolvency, money held in our client account would be protected and returned to you
        or passed to the insurer as appropriate.
      </P>

      <H1>8. Financial Services Compensation Scheme (FSCS)</H1>
      <P>
        Day Drive is covered by the Financial Services Compensation Scheme (FSCS). You may be entitled to
        compensation from the FSCS if we cannot meet our obligations. This depends on the type of business and
        the circumstances of the claim.
      </P>
      <P>
        Insurance advising and arranging is covered for 90% of the claim, without any upper limit. For further
        information about the FSCS, including eligibility, visit www.fscs.org.uk or call 0800 678 1100.
      </P>

      <H1>9. Insurer Solvency</H1>
      <P>
        We cannot guarantee the solvency of any insurer with whom we place business. If an insurer becomes
        insolvent, you may have recourse to the FSCS as described above. We recommend you satisfy yourself
        as to the financial standing of any insurer before entering into a contract of insurance.
      </P>

      <H1>10. Remuneration</H1>
      <P>
        Day Drive receives remuneration for arranging insurance policies. This may take the form of a
        commission paid by the insurer, a policy fee charged to you, or both. Details of any fees we charge
        are disclosed before you complete your purchase.
      </P>
      <P>
        You may ask us at any time to disclose the basis and amount of any remuneration we receive in
        connection with your policy.
      </P>

      <H1>11. Cancellation and Charges</H1>
      <P>
        You have a statutory right to cancel your policy within 14 days of receipt of your policy documents
        (the "cooling-off period"). If you cancel within the cooling-off period, you will receive a full refund
        of the premium paid, less any time on risk (pro-rata) and the Day Drive cancellation fee set out below.
      </P>
      <P>
        After the cooling-off period, cancellation terms are subject to the insurer's policy conditions. Short
        term motor policies typically have limited or no return of premium after the cooling-off period.
      </P>
      <P>
        Day Drive charges fees for certain transactions. These are set out in the Table of Charges below.
      </P>

      <H2>Table of Charges</H2>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.col1, s.colHeader]}>Transaction</Text>
          <Text style={[s.col2, s.colHeader]}>Fee</Text>
        </View>
        <View style={s.tableRow}>
          <Text style={s.col1}>Mid-Term Adjustment (MTA)</Text>
          <Text style={s.col2}>£25.00</Text>
        </View>
        <View style={s.tableRow}>
          <Text style={s.col1}>Cancellation</Text>
          <Text style={s.col2}>£25.00</Text>
        </View>
        <View style={s.tableRow}>
          <Text style={s.col1}>Duplicate documents</Text>
          <Text style={s.col2}>£25.00</Text>
        </View>
      </View>
      <P>All fees are inclusive of IPT where applicable. Fees are non-refundable once a transaction is completed.</P>

      <H1>12. Claims Handling</H1>
      <P>
        Day Drive does not handle claims on behalf of insurers. In the event of a claim, you must contact your
        insurer directly using the claims contact details provided in your policy documents.
      </P>
      <P>
        You should report any incident that may give rise to a claim as soon as reasonably practicable, whether
        or not you intend to make a claim. Failure to notify promptly may prejudice your claim.
      </P>
      <P>
        We are happy to assist you in locating the correct claims contact details. Please contact us at
        support@daydrive.co.uk or call 0333 4330001.
      </P>

      <H1>13. Complaints</H1>
      <P>
        We are committed to providing the highest level of service. If you are dissatisfied with any aspect
        of our service, please contact us in the first instance:
      </P>
      <Bullet>Email: complaints@daydrive.co.uk</Bullet>
      <Bullet>Post: Complaints, Day Drive, 37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA</Bullet>
      <Bullet>Telephone: 0333 4330001</Bullet>
      <P>
        We will acknowledge your complaint within 5 business days and aim to resolve it within 8 weeks. If we
        are unable to resolve your complaint to your satisfaction, you may refer it to the Financial Ombudsman
        Service (FOS):
      </P>
      <Bullet>Website: www.financial-ombudsman.org.uk</Bullet>
      <Bullet>Telephone: 0800 023 4567</Bullet>
      <Bullet>Post: Financial Ombudsman Service, Exchange Tower, London E14 9SR</Bullet>
      <P>
        The FOS is a free and independent service for resolving disputes between consumers and financial
        services firms. You must refer a complaint to the FOS within 6 months of our final response.
      </P>

      <H1>14. CUE and MID Registers</H1>
      <P>
        Insurers share claims and policy information through industry databases including the Claims and
        Underwriting Exchange (CUE) and the Motor Insurance Database (MID). By arranging a policy through
        Day Drive, your policy details will be registered on the MID and claims information may be shared
        via CUE. This is a legal requirement for motor insurance.
      </P>
      <P>
        The MID is used by the Police and other authorities to verify that vehicles on the road are insured.
        Your vehicle details will be added to the MID once your policy is issued.
      </P>

      <H1>15. Credit Searches</H1>
      <P>
        In some circumstances, we or our panel insurers may conduct a soft credit search as part of the
        quotation process. This will not affect your credit rating and will not be visible to other lenders.
        We will always inform you before conducting any search that could affect your credit file.
      </P>

      <H1>16. Financial Crime</H1>
      <P>
        Day Drive is required by law to take steps to prevent financial crime, including fraud and money
        laundering. We may ask you for additional information to verify your identity. We are required to
        report any suspicious activity to the relevant authorities, and in doing so we may be prohibited from
        informing you that such a report has been made.
      </P>
      <P>
        Insurance fraud is illegal and has serious consequences. Any attempt to obtain insurance by deception
        will be reported to the police and industry fraud databases.
      </P>

      <H1>17. Confidentiality and Data Protection</H1>
      <P>
        Day Drive is registered as a data controller with the Information Commissioner's Office (ICO).
        We collect and process personal data in accordance with the UK General Data Protection Regulation
        (UK GDPR) and the Data Protection Act 2018.
      </P>
      <P>
        Your personal data will be used to arrange and administer your insurance policy, process claims,
        comply with legal obligations, and for fraud prevention purposes. We may share your data with
        insurers, reinsurers, and other third parties as necessary for these purposes.
      </P>
      <P>
        We will not sell your personal data to third parties for marketing purposes without your explicit
        consent. For full details of how we use your data, please refer to our Privacy Policy available at
        www.daydrive.co.uk/privacy.
      </P>
      <P>
        You have the right to access, correct, or request deletion of your personal data. To exercise your
        rights, contact us at privacy@daydrive.co.uk.
      </P>

      <H1>18. Consent</H1>
      <P>
        By using our services, you consent to us processing your personal data as described in these Terms
        and our Privacy Policy. You also consent to us sharing your data with insurers and other third parties
        as necessary to arrange and administer your policy.
      </P>
      <P>
        You may withdraw consent at any time by contacting us at privacy@daydrive.co.uk. Note that withdrawing
        consent may affect our ability to provide services to you.
      </P>

      <H1>19. Intellectual Property and Trademarks</H1>
      <P>
        "Day Drive" and related logos and trademarks are the property of Day Drive Ltd. Nothing in these Terms
        grants you any right to use our trademarks, trade names, or logos without our prior written consent.
      </P>

      <H1>20. Governing Law</H1>
      <P>
        These Terms of Business are governed by and construed in accordance with the laws of England and Wales.
        Any disputes arising out of or in connection with these Terms shall be subject to the exclusive
        jurisdiction of the courts of England and Wales, except where you are entitled to bring proceedings
        in another jurisdiction.
      </P>
      <P>
        If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions
        shall continue in full force and effect.
      </P>

      <Rule />

      <Text style={s.footer}>
        Day Drive — 37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA.
        Day Drive is a trading name of Day Drive Ltd, registered in England and Wales (company number 05044963).
        Authorised and regulated by the Financial Conduct Authority (FCA reference 751221).
        www.daydrive.co.uk
      </Text>
      <Text style={s.updated}>Last updated: 19 May 2023</Text>
    </DemoDocumentLayout>
  );
}
