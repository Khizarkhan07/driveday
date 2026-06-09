import { View, Text, Svg, Path, Line, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  textGroup: { marginLeft: 7 },
  nameRow: { flexDirection: "row", alignItems: "baseline" },
  day: { fontWeight: 700, color: "#081B3A" },
  drive: { fontWeight: 700, color: "#0047FF" },
  sub: { color: "#5C6B82" },
  rule: { backgroundColor: "#D9E2F2", height: 1, marginTop: 2 },
});

interface DayDriveLogoProps {
  /** Overall height in points — width scales proportionally. Default 50. */
  height?: number;
}

export function DayDriveLogo({ height = 50 }: DayDriveLogoProps) {
  const iconW = height * 0.78;
  const nameSize = height * 0.30;
  const subSize  = height * 0.115;

  return (
    <View style={s.container}>
      {/* ── DD monogram drawn with react-pdf SVG primitives ── */}
      <Svg viewBox="0 0 200 155" width={iconW} height={height}>
        {/* First D — dark navy vertical stroke + closed arc */}
        <Path
          d="M22 8 L22 147 C22 147 98 147 98 77 C98 8 22 8 22 8 Z"
          fill="none"
          stroke="#081B3A"
          strokeWidth="16"
          strokeLinejoin="round"
        />
        {/* Second D — blue open arc */}
        <Path
          d="M62 8 C150 8 190 47 190 77 C190 107 150 147 62 147"
          fill="none"
          stroke="#0047FF"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Road diagonal */}
        <Path
          d="M30 118 C82 88 128 65 178 38"
          fill="none"
          stroke="#081B3A"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Dashed centre line on road */}
        <Line
          x1="50" y1="105" x2="60" y2="99"
          stroke="white" strokeWidth="5" strokeLinecap="round"
        />
        <Line
          x1="90" y1="82" x2="100" y2="76"
          stroke="white" strokeWidth="5" strokeLinecap="round"
        />
        <Line
          x1="130" y1="61" x2="140" y2="55"
          stroke="white" strokeWidth="5" strokeLinecap="round"
        />
      </Svg>

      {/* ── Brand text — react-pdf Text (reliable, no SVG font issues) ── */}
      <View style={s.textGroup}>
        <View style={s.nameRow}>
          <Text style={[s.day,  { fontSize: nameSize }]}>DAY</Text>
          <Text style={[s.drive, { fontSize: nameSize }]}> DRIVE</Text>
        </View>
        <Text style={[s.sub, { fontSize: subSize, letterSpacing: 1.8 }]}>
          AUTO INSURANCE
        </Text>
        <View style={[s.rule, { width: nameSize * 4.5 }]} />
      </View>
    </View>
  );
}
