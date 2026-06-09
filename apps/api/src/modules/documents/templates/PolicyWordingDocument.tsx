import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { DemoDocumentLayout } from "./DemoDocumentLayout";
import { DayDriveLogo } from "./DayDriveLogo";

const styles = StyleSheet.create({
  h1: { marginTop: 14, marginBottom: 4, fontSize: 13, fontWeight: 700, textTransform: "uppercase" },
  h2: { marginTop: 10, marginBottom: 3, fontSize: 11, fontWeight: 700 },
  p: { marginBottom: 5, lineHeight: 1.4, fontSize: 10 },
  bullet: { marginBottom: 3, lineHeight: 1.4, fontSize: 10, paddingLeft: 10 },
  contentsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  contentsLabel: { flex: 1, paddingRight: 8, fontSize: 10 },
  contentsPage: { width: 24, textAlign: "right", fontSize: 10 },
  rule: { borderBottomWidth: 0.5, borderBottomColor: "#9ca3af", marginVertical: 8 },
  bold: { fontWeight: 700 },
});

function ContentsRow({ title, page }: { title: string; page: string }) {
  return (
    <View style={styles.contentsRow}>
      <Text style={styles.contentsLabel}>{title}</Text>
      <Text style={styles.contentsPage}>{page}</Text>
    </View>
  );
}

function H1({ children }: { children: string }) {
  return <Text style={styles.h1}>{children}</Text>;
}

function H2({ children }: { children: string }) {
  return <Text style={styles.h2}>{children}</Text>;
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <Text style={styles.bullet}>{"• "}{children}</Text>;
}

function Rule() {
  return <View style={styles.rule} />;
}

export function PolicyWordingDocument() {
  return (
    <DemoDocumentLayout title="">
      <View style={{ marginTop: -20, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 8, marginBottom: 10 }}>
        <DayDriveLogo height={45} />
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: 700, color: "#081B3A" }}>Day Drive — Short Term Policy Wording</Text>
          <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>Underwritten by Highway Insurance Company Limited</Text>
        </View>
      </View>

      {/* WELCOME */}
      <H1>Welcome to Day Drive</H1>
      <P>
        Thank you for choosing Day Drive. We hope you&apos;ll be happy with the
        cover and service you get from us. This policy document tells you everything you need
        to know about your insurance, please keep it safe with your schedule and certificate
        of insurance. You can get a copy of the policy documents you have been provided in
        braille, large print or in an audio format by contacting us or your broker.
      </P>
      <H2>A little bit more about us…</H2>
      <P>
        Your policy is arranged by Day Drive and underwritten by Highway Insurance Company
        Limited. You can find out more about us at daydrive.co.uk.
      </P>

      <Rule />

      {/* CONTENTS */}
      <H1>Contents</H1>
      <ContentsRow title="Important Information — Privacy Policy" page="3" />
      <ContentsRow title="Important Information — How To Make A Complaint" page="4" />
      <ContentsRow title="Definition of Terms and Words — Definitions" page="6" />
      <ContentsRow title="Contract of Motor Insurance — Highway Short Term Policy" page="9" />
      <ContentsRow title="Cover" page="9" />
      <ContentsRow title="Use" page="10" />
      <ContentsRow title="Cancelling your Policy" page="10" />
      <ContentsRow title="Changes to your details" page="11" />
      <ContentsRow title="Section 1 — Liability to others: Third Party Cover" page="13" />
      <ContentsRow title="Section 2 — Fire and Theft" page="17" />
      <ContentsRow title="Section 3 — Accidental Damage" page="19" />
      <ContentsRow title="Section 4 — Windscreen and Windows" page="20" />
      <ContentsRow title="Section 5 — Personal Accident, Personal Belongings and Medical Expenses" page="22" />
      <ContentsRow title="Section 6 — Driving Abroad" page="24" />
      <ContentsRow title="Section 7 — Lock Replacement – Lost or Stolen Key Cover" page="25" />
      <ContentsRow title="Section 8 — Overnight Accommodation or Onward Transport" page="26" />
      <ContentsRow title="Section 9 — Electric Vehicles" page="27" />
      <ContentsRow title="Claims Information" page="28" />
      <ContentsRow title="General Exclusions" page="31" />
      <ContentsRow title="General Conditions" page="35" />

      <Rule />

      {/* IMPORTANT INFORMATION */}
      <H1>Important Information</H1>
      <P>
        Please read this policy, the schedule (including any endorsements) and the
        certificate of motor insurance very carefully. Together with the information you
        gave us in the proposal form or statement of fact, and the declarations that you
        have made, they form the contract of motor insurance. You should pay particular
        attention to the general exclusions, the general conditions and any
        endorsements which apply.
      </P>
      <P>
        The words that appear in bold throughout this policy are defined under Definitions
        and have the same meaning wherever they appear.
      </P>
      <P>
        Please tell your insurance adviser immediately if you have any questions, the
        cover does not meet your needs, or any part of your insurance documentation is
        incorrect.
      </P>

      <H2>Privacy Policy — A summary of our privacy notice</H2>
      <P>
        Highway Insurance Company Limited is the controller of personal information.
        We&apos;ll keep you informed about how we use personal information in the document
        &apos;Privacy Policy&apos;, which is available online at daydrive.co.uk/privacy-notice.
      </P>
      <P>You have a number of rights concerning personal information. You can ask for a person to review an automated decision, and in certain circumstances to:</P>
      <Bullet>Access the personal information we hold about you or anyone on the policy.</Bullet>
      <Bullet>Correct personal information you think is inaccurate or to update information you think is incomplete.</Bullet>
      <Bullet>Have personal information deleted in certain circumstances.</Bullet>
      <Bullet>Restrict us processing personal information, under certain circumstances.</Bullet>
      <Bullet>Receive personal information in a portable format. This only applies to information you have provided to us.</Bullet>
      <Bullet>Object to us processing personal information, under certain circumstances.</Bullet>
      <P>
        If you want to find out more or exercise these rights, contact Day Drive,
        37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA or email privacy@daydrive.co.uk.
        You can also contact our Data Protection Officer: Day Drive, 37th Floor, 1 Canada Square,
        Canary Wharf Estate, London E14 5AA, or via email at dpo@daydrive.co.uk.
      </P>

      <H2>How To Make A Complaint</H2>
      <P>
        If you have a complaint about your policy or the service you have received, please
        contact the broker, intermediary or agent that arranged it. If they are unable to
        resolve your complaint you may refer your complaint to the Financial Ombudsman
        Service within six months of receiving their final response letter.
      </P>
      <P>
        Should you be unhappy with the service provided please contact us by phone on
        0330 678 5556 (For Text Phone please dial 18001 first. Opening hours Mon–Fri 9am–5pm).
        If you prefer to write, please address your letter to Complaints, Day Drive,
        37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA.
        Email: complaints@daydrive.co.uk. When contacting us please ensure
        you quote your policy or claim number as appropriate.
      </P>
      <P>
        If we cannot resolve your complaint, you may refer your complaint to the Financial
        Ombudsman Service within six months of receiving our final response letter.
        The address is: Financial Ombudsman Service, Exchange Tower, London, E14 9SR.
        Telephone 0800 023 4567 or 0300 123 9 123 (from mobile or non BT lines).
        Email complaint.info@financial-ombudsman.org.uk. Website: financial-ombudsman.org.uk.
      </P>
      <P>Making a complaint will not affect your right to take legal action.</P>

      <H2>Financial Services Compensation Scheme</H2>
      <P>
        If we are unable to meet our liabilities to our policyholders, you may be able to
        claim compensation from the Financial Services Compensation Scheme (FSCS).
        Compulsory insurance such as third party motor insurance is covered for 100% of the claim.
        Non compulsory insurance, such as home insurance, is covered for 90% of the claim.
        Telephone 0207 741 4100 or e-mail enquiries@fscs.org.uk.
      </P>

      <Rule />

      {/* DEFINITIONS */}
      <H1>Definition of Terms and Words</H1>
      <P>
        The following words or phrases have the same meaning wherever they appear and
        are shown in bold throughout this policy.
      </P>
      <P><Text style={styles.bold}>Advanced Driver Assistance Systems (ADAS)</Text> — Electronic systems fitted to your vehicle that will assist the control of your vehicle.</P>
      <P><Text style={styles.bold}>Automated Vehicles</Text> — A vehicle lawfully allowed to drive itself in England, Scotland and Wales as defined by the Automated and Electric Vehicle Act 2018.</P>
      <P><Text style={styles.bold}>Certificate of Motor Insurance</Text> — Legal evidence of your insurance. It is one part of the contract of motor insurance. It shows the cars we are insuring, who may drive the insured vehicle (where &apos;any authorised driver&apos; is stated, refer to the schedule for restrictions), what it may be used for and the period of insurance.</P>
      <P><Text style={styles.bold}>Contract of Motor Insurance</Text> — The policy, the schedule (including endorsements), the certificate of motor insurance, the information you gave us in the statement of fact and declarations that you have made, all form the contract of motor insurance.</P>
      <P><Text style={styles.bold}>Endorsements</Text> — Something which alters your insurance cover. Your cover will be affected by any endorsement that is shown on the schedule. Such endorsements may add exclusions to the cover or require you to take action such as fitting approved security. If you do not comply with any endorsements, this contract of motor insurance may no longer be valid and we may refuse to deal with any claim.</P>
      <P><Text style={styles.bold}>Excess</Text> — The amount you have to pay towards each claim you make under this contract of motor insurance. There may be more than one excess, part of which may be voluntary. The amount of the excess is shown on the schedule.</P>
      <P><Text style={styles.bold}>Family or Household</Text> — Any member of the policyholder&apos;s family, or any other person, who is a permanent or temporary resident at the policyholder&apos;s address.</P>
      <P><Text style={styles.bold}>General Conditions</Text> — These describe your responsibilities, general information and the procedures that apply in certain situations, such as when there is a claim or the contract of motor insurance is cancelled.</P>
      <P><Text style={styles.bold}>General Exclusions</Text> — These describe the things that are not covered by the contract of motor insurance. They are in addition to the exclusions shown under the headings &apos;What is not covered&apos; in each of the Sections detailing the cover provided.</P>
      <P><Text style={styles.bold}>Geographical Limits</Text> — Great Britain, Northern Ireland, the Isle of Man and the Channel Islands. It also includes travelling by sea, air or rail between these places. Section 6 explains the cover that applies when driving abroad.</P>
      <P><Text style={styles.bold}>Highway Insurance Company Limited</Text> — The underwriter of this policy.</P>
      <P><Text style={styles.bold}>Insurance Adviser</Text> — The person or company you purchased this insurance from.</P>
      <P><Text style={styles.bold}>Insured vehicle</Text> — The car or van shown on the current schedule and certificate of motor insurance.</P>
      <P><Text style={styles.bold}>Market Value</Text> — The cost at the date of the accident or loss of replacing the insured vehicle, if possible, with one of a similar make, model, age, condition and mileage.</P>
      <P><Text style={styles.bold}>On Board Diagnostics (OBD)</Text> — A vehicle&apos;s self-diagnostic and reporting capability using the vehicle&apos;s on board computer.</P>
      <P><Text style={styles.bold}>Over The Air (OTA)</Text> — Software updates and settings installed wirelessly, such as functionality, performance and safety updates.</P>
      <P><Text style={styles.bold}>Period of Insurance</Text> — The length of time covered by this contract of motor insurance, as shown on the current schedule and certificate of motor insurance.</P>
      <P><Text style={styles.bold}>Personal Belongings</Text> — Certain property in the insured vehicle, which you wear or use in everyday life which belongs to you or anyone travelling in the insured vehicle. Section 5 of this policy sets out the cover and limits which apply.</P>
      <P><Text style={styles.bold}>Policy</Text> — This booklet, which sets out the details of cover and all the terms and conditions which apply. It is one part of the contract of motor insurance.</P>
      <P><Text style={styles.bold}>Proposal form or statement of fact</Text> — The documents filled in by you, or on your behalf, and all other information you gave and declarations made at the time the insurance was arranged and on which we have relied when agreeing to offer this contract of motor insurance.</P>
      <P><Text style={styles.bold}>Recommended Repairer</Text> — The national network of repairers we work with as part of a claim to repair your vehicle.</P>
      <P><Text style={styles.bold}>Schedule</Text> — Forms part of the contract of motor insurance and confirms details of you, the insured vehicle and the cover which applies.</P>
      <P><Text style={styles.bold}>Standard Accessories</Text> — Accessories made available for the vehicle by the manufacturer as optional extras and for which a receipt must be provided. Standard accessories do not include modifications to the insured car, signwriting or any other accessory fitted to it not provided by the vehicle manufacturer.</P>
      <P><Text style={styles.bold}>USB or Portal Updates</Text> — Updates to your vehicle&apos;s systems using a USB or any plug-in portal device.</P>
      <P><Text style={styles.bold}>We, our, us</Text> — Highway Insurance Company Limited.</P>
      <P><Text style={styles.bold}>You, Your</Text> — The person, company or trading name (including subsidiary companies) shown as the insured on the schedule and certificate of motor insurance.</P>

      <Rule />

      {/* CONTRACT OF MOTOR INSURANCE */}
      <H1>Contract of Motor Insurance — Short Term Policy</H1>
      <P>
        This policy, the schedule, the certificate of motor insurance, information you gave
        us in the statement of fact and declarations that you have made, form a legally
        binding contract of motor insurance between you and Highway Insurance Company Limited.
      </P>
      <P>
        This contract of motor insurance is a contract personal to you and you cannot
        transfer it to anyone else.
      </P>
      <P>
        We agree to insure you under the terms of this contract of motor insurance against
        any liability, loss or damage that occurs within the geographical limits during the
        period of insurance for which you have paid, or agree to pay, the premium.
      </P>
      <P>
        Unless we agree with you to apply the laws of another country, English Law will apply
        to this contract (unless you live in Guernsey or Jersey, where Guernsey or Jersey law
        will apply).
      </P>

      <H2>Your Cover</H2>
      <P>The current schedule shows what you are covered for. The different kinds of cover are:</P>
      <Bullet>Comprehensive — Sections 1, 2, 3, 4, 5, 6, 7, 8, 9</Bullet>

      <H2>Use</H2>
      <P>
        This contract of motor insurance only covers you if you use the insured vehicle in
        the way described in your certificate of motor insurance (under &apos;Limitations as to Use&apos;)
        and any endorsements.
      </P>

      <H2>Cancellation</H2>
      <P>
        You may cancel this contract of motor insurance at any time by telling us, or your
        insurance adviser, in writing or by email or telephone and cancellation can take
        effect immediately or from a later date, although it cannot be backdated to any
        earlier date. Due to the short period nature of this policy there will be no refund
        of premium.
      </P>
      <P>
        We, or our authorised agent, may cancel this contract of motor insurance by giving
        you seven days&apos; notice in writing to your last known address where there is a valid
        reason for doing so. Valid reasons may include, but are not limited to, if:
      </P>
      <Bullet>you do not pay your premium, premium deposit or any instalment payment on or before the due date;</Bullet>
      <Bullet>you or anyone else covered by this insurance has not met all the terms and conditions of this policy;</Bullet>
      <Bullet>a change in your circumstances means we can no longer provide cover;</Bullet>
      <Bullet>you do not provide us or your insurance adviser with any requested documents;</Bullet>
      <Bullet>we identify misrepresentation or any attempt to gain an advantage under this insurance to which you are not entitled;</Bullet>
      <Bullet>we identify your involvement in or association with insurance fraud and/or financial crime.</Bullet>
      <P>
        The insurance will end immediately the seven days&apos; notice runs out. If you have
        just taken out the policy with us and the premium is unpaid, we will cancel your
        insurance from the start date.
      </P>
      <P>
        We will refund the balance of your premium that applies to the remaining period
        of insurance unless fraud has been identified.
      </P>
      <P>If you or someone else has made a claim, we will cancel your cover but may not refund any premium.</P>

      <H2>Changes to your details</H2>
      <P>You must tell your insurance adviser as soon as possible if any of the details on your statement of fact change including:</P>
      <Bullet>Changes made to your vehicle which improve its value, appearance, performance or handling.</Bullet>
      <Bullet>Changing your vehicle.</Bullet>
      <Bullet>Changes in the way your vehicle is used.</Bullet>
      <Bullet>Change of address or where your vehicle is kept.</Bullet>
      <Bullet>Change of occupation, including part time work.</Bullet>
      <Bullet>Change in the main user of the car.</Bullet>
      <Bullet>Details of any motoring convictions, fixed penalty offences or licence endorsements for any person who may drive the car.</Bullet>
      <Bullet>Details of any criminal convictions for any person who may drive the car.</Bullet>
      <Bullet>Details of any accidents, thefts, loss or damage, regardless of blame or whether a claim was made or not, for any person who may drive the car.</Bullet>
      <P>
        If you do not tell your insurance adviser of a change we will be entitled to reject or reduce payment of your claim, or cancel the policy and/or treat it as though it never existed.
      </P>

      <Rule />

      {/* SECTION 1 */}
      <H1>Section 1 — Liability to Others: Third Party Cover</H1>

      <H2>What is covered</H2>
      <P>
        We will insure you against everything you legally have to pay to people who claim for
        damages, costs and expenses if they arise from a claim caused by an accident while you
        are driving, or in charge of the insured vehicle, if you kill or injure other people.
        We will also cover you for your legal liability for damage to their property (including
        any related indirect loss) up to £20,000,000 and for costs and expenses incurred up to
        £5,000,000. We will also insure you while the insured vehicle is towing a caravan,
        trailer or broken-down car, so long as the towing is allowed by law and the caravan,
        trailer or broken-down car is attached properly to the insured vehicle by towing
        equipment made for this purpose.
      </P>

      <H2>What is not covered</H2>
      <Bullet>Loss or damage to the insured vehicle, caravan, trailer or broken-down car.</Bullet>
      <Bullet>Any amount above £20,000,000 for damage to other people&apos;s property (including any related indirect loss) and any amount above £5,000,000 for costs and expenses incurred.</Bullet>
      <Bullet>Property belonging to (or in the care of) you or your passengers or in any caravan, trailer or broken-down car.</Bullet>
      <Bullet>Death or injury to the person driving or in charge of the insured vehicle or to any person being carried in or on, or getting into or out of, a caravan or trailer.</Bullet>
      <Bullet>Legal liability when you are towing any caravan, trailer or broken-down vehicle for profit.</Bullet>
      <Bullet>If your current certificate of motor insurance states that business use is allowed, liability for death or injury to any employee of the person insured, arising during the course of their employment, except where needed by law.</Bullet>
      <Bullet>Any liability, injury, loss or damage resulting from anything sold, transported or supplied by you or on your behalf.</Bullet>
      <Bullet>Loss or damage to any bridge, weighbridge, viaduct, road or other surface over which the vehicle is driven, or anything under the surface caused by the weight or vibration of the insured vehicle or its load.</Bullet>
      <Bullet>Loss, damage or liability caused by pollution or contamination as a result of any load seeping from the insured vehicle or any load spilling from, or shifting in, the insured vehicle.</Bullet>
      <Bullet>Liability for death, injury or damage when the insured vehicle is not on a public road and is in the process of being loaded or unloaded by any person other than the driver or attendant of the insured vehicle.</Bullet>

      <H2>Automated Vehicles</H2>
      <P>
        If your vehicle is automated, we will cover for any accidents, injuries, deaths or
        property caused by your automated vehicle, when it is lawfully driving itself on a
        road or other public place in England, Scotland or Wales.
      </P>
      <P>Automated Vehicles — What is not covered:</P>
      <Bullet>Any vehicle which has not been identified on the Secretary of State&apos;s list of motor vehicles that may drive themselves.</Bullet>
      <Bullet>Accidents outside of England, Scotland and Wales.</Bullet>
      <Bullet>Unlawful use of your automated vehicle.</Bullet>
      <Bullet>Any loss or injury caused if you fail to install any updates required by your vehicle manufacturer for your automated vehicle.</Bullet>
      <Bullet>Any claims for your vehicle under sections 2, 3 and 4.</Bullet>
      <Bullet>Property which is owned by the insured.</Bullet>

      <H2>Insuring others — What is covered</H2>
      <Bullet>Any person you allow to use the insured vehicle as long as your current certificate of motor insurance says they can and they are not excluded from driving by an endorsement shown in the schedule.</Bullet>
      <Bullet>Any person (other than the person driving) being carried in, or getting in or out of the insured vehicle or any person who causes an accident while they are travelling in, or getting in or out of, the insured vehicle.</Bullet>
      <Bullet>Your employer or business partner (but only if your current certificate of motor insurance states that business use is allowed).</Bullet>
      <Bullet>If anyone covered by this contract of motor insurance dies, we will cover their legal representative to deal with any claims made against that person&apos;s estate.</Bullet>

      <H2>Costs of Legal Representation — What is covered</H2>
      <P>Following a claim under this contract of motor insurance, we will pay the reasonable legal costs and expenses relating to:</P>
      <Bullet>Solicitors&apos; fees for representing anyone we insure at a coroner&apos;s inquest, fatal accident inquiry or court summary of jurisdiction; and</Bullet>
      <Bullet>The defence of anyone we insure against any legal proceedings for manslaughter or causing death by dangerous or reckless driving.</Bullet>

      <H2>Emergency Medical Treatment — What is covered</H2>
      <P>
        We will pay for the Emergency Treatment Fees, as required by the Road Traffic Acts,
        after an accident involving the insured vehicle. We must, by law, provide this cover.
        If this is the only payment we make, your No Claims Discount will not be affected.
      </P>

      <Rule />

      {/* SECTION 2 */}
      <H1>Section 2 — Fire and Theft</H1>

      <H2>What is covered</H2>
      <P>
        We will cover you for loss or damage to the insured vehicle that is caused by fire,
        lightning, explosion, theft or attempted theft. This includes standard accessories on
        it or kept in your private garage. We will also pay for loss or damage to the insured
        vehicle&apos;s fitted entertainment equipment up to the limit stated on the schedule.
      </P>

      <H2>What is not covered</H2>
      <Bullet>Any car which is not the insured vehicle and any loss or damage if you do not have cover under this section.</Bullet>
      <Bullet>Wear and tear, mechanical, electrical, electronic and computer failure (including failure caused by hacks, viruses, Cyber Incidents/Cyber Act or malware), breakdowns or breakages.</Bullet>
      <Bullet>Loss or damage caused by OTA, OBD, USB or Portal updates that are not supplied by your vehicle&apos;s manufacturer unless we have previously agreed to the update.</Bullet>
      <Bullet>Compensation for you not being able to use the insured vehicle, any delay where we have to get new parts or accessories or they are unavailable, or the value of the insured vehicle reducing for any reason.</Bullet>
      <Bullet>Any other indirect loss, such as travel expenses or loss of earnings.</Bullet>
      <Bullet>Loss or damage caused by failure to protect the insured vehicle, or if it has been left unlocked and/or with the keys, lock transmitter, entry card or other ignition control device left in, on or in the immediate proximity of the vehicle.</Bullet>
      <Bullet>Loss or damage from repossession of the insured vehicle and returning it to its rightful owner.</Bullet>
      <Bullet>Loss or damage from any agreement or proposed transaction for selling or hiring the insured vehicle or someone taking the insured vehicle by fraud, trickery or deception.</Bullet>
      <Bullet>Loss or damage arising from the insured vehicle being taken or driven by a person who is not an insured driver but is a member of the policyholder&apos;s family or household, or being taken or driven by an employee or ex-employee, unless you report the person to the police for taking your vehicle without your consent.</Bullet>
      <Bullet>Loss or damage caused deliberately by you or any person driving the insured vehicle with your permission.</Bullet>
      <Bullet>Any additional damage resulting from the insured vehicle being moved by you, or any person driving the insured vehicle with your permission, after an accident, fire or theft.</Bullet>
      <Bullet>Any amount above the limit stated on the schedule for fitted entertainment equipment.</Bullet>
      <Bullet>Personal belongings unless you have cover under Section 5.</Bullet>
      <Bullet>Keys, remote control or security devices (whether lost or stolen) unless you have cover under Section 7.</Bullet>
      <Bullet>Tapes, cassettes, compact and minidiscs, Citizens-Band radios, phones or phone equipment.</Bullet>
      <Bullet>Any loss or damage up to the amount of the excess that appears on your schedule.</Bullet>
      <Bullet>Any satellite navigation equipment or accessories, whether permanently fitted or not, that are not standard accessories.</Bullet>

      <Rule />

      {/* SECTION 3 */}
      <H1>Section 3 — Accidental Damage</H1>

      <H2>What is covered</H2>
      <P>
        We will cover you for loss or damage to the insured vehicle. This includes standard
        accessories on it or kept in your private garage. We will also pay for loss or damage
        to the insured vehicle&apos;s fitted entertainment equipment up to the limit stated on
        the schedule.
      </P>

      <H2>What is not covered</H2>
      <P>Any loss or damage described in &apos;what is not covered&apos; under the Fire and Theft section of this policy. We also do not cover the following:</P>
      <Bullet>Damage to tyres caused by wear and tear, braking, punctures, cuts or bursts.</Bullet>
      <Bullet>Damage caused by frost, unless you have taken care to stop the damage happening and have followed the manufacturer&apos;s instructions to avoid liquid freezing in your vehicle.</Bullet>
      <Bullet>Loss or damage arising from the insured vehicle being filled with the wrong fuel.</Bullet>
      <Bullet>Any satellite navigation equipment or accessories, whether permanently fitted or not, that are not standard accessories.</Bullet>

      <Rule />

      {/* SECTION 4 */}
      <H1>Section 4 — Windscreen and Windows</H1>

      <H2>What is covered</H2>
      <Bullet>You are covered for the damage to the vehicle&apos;s windscreen and windows.</Bullet>
      <Bullet>You will need to pay an excess if your windscreen or windows are replaced. Your schedule will show how much you will need to pay and the additional excess should you choose to use a non-approved repairer.</Bullet>

      <H2>What is not covered</H2>
      <Bullet>Any loss or damage if you do not have cover under this section.</Bullet>
      <Bullet>Loss or damage to sunroofs, panoramic sunroof or panoramic glass roof, roof panels or any loss or damage which is not included above.</Bullet>

      <Rule />

      {/* SECTION 5 */}
      <H1>Section 5 — Personal Accident, Personal Belongings and Medical Expenses</H1>

      <H2>Personal Accident — What is covered</H2>
      <P>
        If you, your husband, your wife or your civil partner (as defined in the Civil
        Partnership Act 2004) are involved in a car accident, we will pay the amounts shown
        below if, within three months of the accident, it directly causes one of the following:
      </P>
      <Bullet>Death — £5,000</Bullet>
      <Bullet>Total loss of one or more limbs — £5,000</Bullet>
      <Bullet>Permanent blindness in one or both eyes — £5,000</Bullet>
      <P>
        The most we will pay is the limit for any one cause of death or injury during any one
        period of insurance. We will only make a payment if the injury or death is directly
        connected with an accident involving the insured vehicle.
      </P>

      <H2>Personal Accident — What is not covered</H2>
      <Bullet>Any loss if you do not have cover under this Section.</Bullet>
      <Bullet>Death or bodily injury caused by suicide or attempted suicide, self-injury or by drugs, alcohol or anything taken or inhaled.</Bullet>
      <Bullet>Death or bodily injury caused by disease, physical sickness or disability.</Bullet>
      <Bullet>Anyone failing to keep to the law regarding the use of seat belts.</Bullet>

      <H2>Personal Belongings — What is covered</H2>
      <P>
        We will pay up to £250 for personal belongings in your car, if they are lost or
        damaged because of an accident, fire, theft or attempted theft.
      </P>

      <H2>Child Seat Cover</H2>
      <P>
        If you have a child seat fitted in your vehicle and your vehicle is involved in an
        accident, provided you are making a claim under Section 3, we will pay for the cost
        of a replacement of a similar model and standard even if there is no apparent damage,
        subject to the provision of the purchase receipt for the original item.
      </P>

      <H2>Personal Belongings — What is not covered</H2>
      <Bullet>Any loss or damage if you do not have cover under this Section.</Bullet>
      <Bullet>Personal belongings covered by any other insurance.</Bullet>
      <Bullet>Money, stamps, tickets, documents, securities, jewellery or furs.</Bullet>
      <Bullet>Goods, tools of trade or samples connected with your work or any other trade, or any container for these things.</Bullet>
      <Bullet>Televisions, portable DVD players, phones, phone equipment, phone accessories, computers, computer equipment, computer accessories, computer game console, computer games and computer accessories.</Bullet>
      <Bullet>Keys, remote control or security devices.</Bullet>
      <Bullet>Property taken from an unlocked or open vehicle or which you have not taken care to protect from loss or damage.</Bullet>
      <Bullet>The theft or attempted theft of personal belongings, if your vehicle has been left unlocked, left with the keys in, on or attached to or left in the immediate proximity of your vehicle, or left with a window or roof open.</Bullet>

      <H2>Tool Cover — What is covered</H2>
      <P>
        We will pay for loss of damage to your tools caused by fire, theft, attempted theft
        or accidental damage, while they are in the insured vehicle. The most we will pay for
        any one incident is £300.
      </P>

      <H2>Medical Expenses — What is covered</H2>
      <P>
        If you or your passengers are injured because of an accident involving the insured
        vehicle, we will pay up to £150, in addition to the compulsory Emergency Medical
        Treatment fee (see Section 1), for each person for any medical treatment they receive.
      </P>

      <Rule />

      {/* SECTION 6 */}
      <H1>Section 6 — Driving Abroad</H1>

      <H2>Minimum Insurance — What is covered</H2>
      <P>
        We provide the minimum cover that applies to the country concerned to allow you to
        use the insured car covered by this insurance in: Great Britain, Northern Ireland,
        The Isle of Man, The Channel Islands, Andorra, Austria, Belgium, Bosnia and
        Herzegovina, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Faroe
        Islands, Finland, France, Germany, Gibraltar, Greece, Greenland, Hungary, Iceland,
        Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Monaco, Montenegro,
        Netherlands, Norway, Poland, Portugal, Republic of Ireland, Romania, San Marino,
        Serbia, Slovakia, Slovenia, Spain, Sweden, Switzerland and the Vatican City. It also
        includes travelling between these countries by air, rail or sea, including loading
        and unloading.
      </P>

      <H2>Minimum Insurance — What is not covered</H2>
      <Bullet>Damage to the insured car.</Bullet>
      <Bullet>Customs and Excise duty.</Bullet>

      <Rule />

      {/* SECTION 7 */}
      <H1>Section 7 — Lock Replacement: Lost or Stolen Key Cover</H1>

      <H2>What is covered</H2>
      <P>
        If the keys, lock transmitter or entry card for the keyless entry system of your
        insured vehicle are lost or stolen, we will pay up to £1,000 towards the cost of
        replacing the door and boot locks, the ignition and steering locks, the lock
        transmitter, and the entry card, provided that we are satisfied that any person who
        may have the keys, transmitter or entry card knows the identity or location of your
        insured vehicle, and care is taken to safeguard the keys, transmitter or entry card
        from loss.
      </P>

      <H2>What is not covered</H2>
      <Bullet>The theft excess shown on your schedule.</Bullet>
      <Bullet>Any amount in excess of £1,000.</Bullet>

      <Rule />

      {/* SECTION 8 */}
      <H1>Section 8 — Overnight Accommodation or Onward Transport</H1>

      <H2>What is covered</H2>
      <P>
        If you are unable to continue your journey as a result of accidental loss or damage
        to the insured vehicle occurring within the geographical limits, provided you are
        claiming under section 3 Accidental Damage, we will contribute up to £300 in respect
        of: 3 night&apos;s hotel accommodation for occupants of the insured vehicle where loss
        of use necessitates an unplanned overnight stop; and/or travelling expenses for
        occupants of the insured car towards reaching your destination.
      </P>
      <P>You must pay for the accommodation or travelling expenses yourself and submit receipts for us to reimburse you.</P>

      <H2>What is not covered</H2>
      <Bullet>Newspapers, drinks, telephone calls and meals.</Bullet>
      <Bullet>Any amount in excess of £300 for any one incident.</Bullet>
      <Bullet>Any costs incurred outside the geographical limits.</Bullet>

      <Rule />

      {/* SECTION 9 */}
      <H1>Section 9 — Electric Vehicles</H1>

      <H2>Electric Vehicles — What is covered</H2>
      <P>
        This section will provide you additional information when insuring your electric
        vehicle which is not referenced elsewhere in this policy document. All sections
        within the policy document apply to you and your vehicle when insuring an electric
        vehicle.
      </P>

      <H2>Battery Cover — What is covered</H2>
      <P>
        Cover is provided irrespective of whether you own the battery or the battery is
        leased. If you lease the battery, please ensure you read all documentation you
        receive from the manufacturer.
      </P>
      <Bullet>Theft of, or accidental damage to the battery as per section 2 and section 3.</Bullet>

      <H2>Battery Cover — What is not covered</H2>
      <Bullet>Misuse of the vehicle battery, including but not limited to, overcharging, undercharging, deliberate acts and self repair/replace.</Bullet>
      <Bullet>Cost to repair or replace a non-functional battery.</Bullet>

      <H2>Charging on your driveway or in your garage — What is covered</H2>
      <Bullet>Theft of, fire, accidental damage to your charging cable and your charging point as per section 1, section 2 and section 3.</Bullet>
      <Bullet>Loss or damage to your vehicle as a direct result of your charging cable or charging point as per section 2 and section 3.</Bullet>

      <H2>Charging away from your driveway or garage — What is not covered</H2>
      <Bullet>Misuse of the charging cable, including but not limited to, overcharging, undercharging, deliberate acts and self repair/replace.</Bullet>
      <Bullet>Cost to repair/replace faulty charging cables.</Bullet>
      <Bullet>Any theft, fire, accidental or malicious damage to any charging point.</Bullet>
      <Bullet>Cost to repair/replace faulty charging points.</Bullet>

      <Rule />

      {/* CLAIMS INFORMATION */}
      <H1>Claims Information</H1>
      <P>
        We aim to provide you with the best claims service that we can. In the United Kingdom
        call us on 0330 678 5659.
      </P>

      <H2>To make a claim</H2>
      <Bullet>Call us as soon as possible after the accident — please have your policy number and as much information as possible about the claim ready when you call.</Bullet>
      <Bullet>If the insured vehicle is stolen or vandalised, report this to the police immediately and take a note of the crime reference number.</Bullet>
      <Bullet>Speak to us before you make any arrangements for replacement or repair.</Bullet>
      <P>You must also:</P>
      <Bullet>Immediately send us all communications from other people involved without replying.</Bullet>
      <Bullet>Immediately tell us about and send to us any notice of intended prosecution, inquest, fatal accident inquiry, or any writ, summons or process without replying.</Bullet>
      <Bullet>Tell us straightaway if the insured vehicle is stolen and you later get it back, or discover where it is.</Bullet>
      <Bullet>Get our permission before ordering any new part or accessory.</Bullet>
      <Bullet>Give any information, help, co-operation and documentation we need, including going to court if necessary.</Bullet>
      <Bullet>Pay any excess that applies.</Bullet>
      <Bullet>Pay the VAT element of a claim under the contract of motor insurance, if you are registered for VAT.</Bullet>
      <P>You must not, without our consent: negotiate or admit responsibility; or make any offer, promise, payment or settlement.</P>

      <H2>Paying Your Claim</H2>
      <P>We will pay the reasonable cost of protecting and returning the insured vehicle to the address shown on the schedule. Entirely at our discretion and subject to payment of the policy excess, we will arrange to:</P>
      <Bullet>Repair the damage at a recommended repairer. We may decide to use suitable parts or accessories which are not supplied by the original manufacturer, or alternatively authorise repairs at a repairer of your choice subject to the provision of satisfactory estimates.</Bullet>
      <Bullet>Pay you the cost of replacing or repairing the damaged parts, including their fitting, or</Bullet>
      <Bullet>Treat the insured vehicle as a total loss and pay you the market value of your vehicle less any applicable excess. Once you accept our offer or we have paid the claim (or both) the insured vehicle becomes our property, unless we agree otherwise.</Bullet>
      <P>We will not refund any premium if the insured vehicle is written off or there is any claim.</P>

      <Rule />

      {/* GENERAL EXCLUSIONS */}
      <H1>General Exclusions</H1>
      <P>
        These general exclusions apply to the whole of this contract of motor insurance and
        describe the things which are not covered. These apply as well as the exclusions
        shown under &apos;What is not covered&apos; in each of the Sections detailing the cover provided.
      </P>
      <P>This contract of motor insurance does not cover claims arising from any of the following:</P>

      <H2>1. Vehicle use and driver conditions</H2>
      <P>Any accident, injury, loss or damage that happens while the insured vehicle is being:</P>
      <Bullet>Used for a purpose which it is not insured for.</Bullet>
      <Bullet>Driven or in the charge of anyone who is not described in the certificate of motor insurance as a person entitled to drive or who is excluded from driving by any endorsements or covered by another insurance.</Bullet>
      <Bullet>Driven or in the charge of anyone who does not have a valid driving licence, has not held a driving licence, is disqualified from driving or is prevented by law from holding a licence.</Bullet>
      <Bullet>Driven or in the charge of anyone who does not meet the terms and conditions of their driving licence as required by DVLA/DVLNI rules and regulations and any relevant law.</Bullet>
      <Bullet>Kept or used in an unsafe or unroadworthy condition.</Bullet>
      <Bullet>Kept or used without a current Department of Transport Test (MoT) certificate if one is needed.</Bullet>
      <Bullet>Used to carry passengers or goods in a way likely to affect the safe driving and control of the vehicle.</Bullet>
      <Bullet>Used in or on restricted areas of airports, airfields or military bases.</Bullet>

      <H2>2–11. Further exclusions</H2>
      <Bullet>Any liability that you have agreed to accept unless you would have had that liability anyway.</Bullet>
      <Bullet>Any use connected with the motor trade, unless this use is described in the certificate of motor insurance.</Bullet>
      <Bullet>Hiring out the insured vehicle for money (you can accept money from passengers if you give them a lift so long as you do not make a profit and the insured car has no more than eight seats, not including the driver).</Bullet>
      <Bullet>Racing of any description or being used in any contest, competition, rally or speed trial (apart from treasure hunts).</Bullet>
      <Bullet>The insured vehicle being used on any form of race track, de-restricted toll road (including the Nurburgring) or off-road activity.</Bullet>
      <Bullet>Any accident, injury, loss or damage caused directly or indirectly by war, invasion, act of foreign enemy, hostilities, revolution, act of terrorism, riot or civil unrest, earthquake, ionising radiations, nuclear fuel or waste, nuclear weapons, or carrying any dangerous substances or goods.</Bullet>
      <Bullet>Any liability, loss or damage that happens outside the geographical limits (apart from cover detailed in Section 6).</Bullet>
      <Bullet>Any liability, injury, loss or damage caused directly or indirectly by pollution or contamination, unless the pollution or contamination is sudden, identifiable, not deliberate and unexpected.</Bullet>
      <Bullet>Any death, injury, loss or damage caused directly or indirectly as a result of any deliberate act by you or any person driving the insured vehicle.</Bullet>

      <H2>13. Software and updates</H2>
      <Bullet>Loss or damage caused by failure to install and/or accept any safety critical updates to your car through OTA, OBD, USB or Portal updates recommended or required by your car&apos;s manufacturer.</Bullet>
      <Bullet>Loss or damage caused by OTA, OBD, USB or portal updates that are not supplied by your car&apos;s manufacturer unless we have previously agreed to the updates.</Bullet>

      <H2>14. Cyber Incidents/Cyber Acts</H2>
      <P>We will not pay for any loss, damage or liability directly or indirectly caused or contributed to by a Cyber Act affecting your vehicle, or loss of, corruption, or access to data due to a Cyber Incident or Cyber Act.</P>

      <H2>16. Sanctions</H2>
      <P>
        Day Drive can&apos;t provide you with cover and won&apos;t be liable to pay any claim if doing so
        exposes Day Drive to any sanction, prohibition or restriction under United Nations
        resolutions. This also includes the trade or economic sanctions, laws or regulations
        of the United Kingdom, European Union or United States of America.
      </P>

      <H2>17. Drink/drugs driving</H2>
      <P>
        We will not pay more than our legal liability under compulsory motor insurance
        legislation for any claim, if the driver of your vehicle at the time of the incident
        is found to be over the permitted limit for alcohol; is unfit to drive through alcohol
        or drugs, whether prescribed or otherwise; or fails to provide a sample of breath,
        blood or urine when required to do so, without lawful reason.
      </P>

      <Rule />

      {/* GENERAL CONDITIONS */}
      <H1>General Conditions</H1>
      <P>
        The following general conditions apply to the whole of this contract of motor
        insurance. If you do not meet the terms and conditions of this contract of motor
        insurance, it could make the cover invalid or mean we will refuse to pay your claim.
      </P>

      <H2>Keeping to the Policy Terms</H2>
      <P>
        Your premium is based on the information you gave us when your cover started and
        when you renew it. If any of the details on your statement of fact change, you must
        tell us as soon as possible. If you did not or do not give full and accurate
        information, this contract of motor insurance may be invalid and we may refuse to
        deal with any claim you might make.
      </P>

      <H2>Misrepresentation, Fraud and Financial Crime</H2>
      <P>If you or anyone representing you provides us with misleading or incorrect information, deliberately misleads us to obtain cover or a cheaper premium, provides us with false documents, or makes a fraudulent payment, we may reject a claim or reduce the amount of payment we make, or cancel or avoid your policy including all other policies which you have with us.</P>
      <P>Where fraud is identified we will not return any premium paid by you, will recover from you any costs we have incurred, and will pass details to fraud prevention and law enforcement agencies.</P>

      <H2>Care of the Vehicle</H2>
      <P>
        The insured vehicle must be covered by a valid Department of Transport Test (MoT)
        Certificate if you need one by law. You must always take the keys out of the ignition
        and remove them completely when the insured vehicle is left at any time whatsoever
        (regardless of whether the vehicle is still within your sight) and make sure that you
        do not leave belongings on display. You should close all the windows and sun-roofs
        and lock all the doors. Alarms, immobilisers and tracking devices should be turned
        on when fitted.
      </P>

      <H2>Other Insurance</H2>
      <P>If there is any other insurance covering the same claim, we will only pay our share of the claim, even if the other insurer refuses the claim.</P>

      <H2>Advanced Driver-Assistance Systems</H2>
      <P>
        When using a vehicle fitted with ADAS, you must follow the manufacturer&apos;s
        instructions and load any software and/or safety related updates. If you don&apos;t, your
        insurance won&apos;t be valid, we may void or cancel and we won&apos;t pay any claims for loss
        or damage.
      </P>

      <Rule />

      <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 5 }}>
        Day Drive — 37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA.
        Underwritten by Highway Insurance Company Limited, registered in England and Wales
        number 3730662. Authorised by the Prudential Regulation Authority and regulated by
        the Financial Conduct Authority and the Prudential Regulation Authority, register
        number 202972. Reference: 0039918-2024.
      </Text>
    </DemoDocumentLayout>
  );
}
