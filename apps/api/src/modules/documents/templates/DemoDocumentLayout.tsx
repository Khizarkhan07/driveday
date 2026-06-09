import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  BRAND_NAME,
  DEMO_DISCLAIMER,
  PLACEHOLDER_COMPANY,
} from "@motorcover/shared-types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  watermark: {
    position: "absolute",
    top: "42%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 34,
    fontWeight: 700,
    color: "#dc2626",
    opacity: 0.28,
    transform: "rotate(-28deg)",
  },
  bannerTop: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#991b1b",
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

interface DemoDocumentLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Every generated PDF (certificate, schedule, IPID, policy wording) MUST be
 * composed inside
 * this layout. The watermark and disclaimer banners are rendered here and
 * here only — there is no per-document opt-out, which is what makes it
 * structurally impossible to ship a document without the DEMO marking.
 *
 * A regression test (documents.test.ts) parses generated PDF text and asserts
 * DEMO_DISCLAIMER is present — if someone bypasses this layout, that test fails.
 */
export function DemoDocumentLayout({ title, subtitle, children }: DemoDocumentLayoutProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>{DEMO_DISCLAIMER}</Text>


        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {children}

        <View style={styles.footer} fixed>
          <Text>
            
          </Text>
        </View>
      </Page>
    </Document>
  );
}
