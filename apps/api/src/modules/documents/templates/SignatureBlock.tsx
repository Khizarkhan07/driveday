import { View, Text, Svg, Path } from "@react-pdf/renderer";

export function SignatureBlock() {
  return (
    <View style={{ marginBottom: 3 }}>
      <Svg viewBox="0 0 200 48" style={{ width: 100, height: 24 }}>
        {/* M — large looping M */}
        <Path
          d="M4,36 C4,36 6,18 10,16 C13,14 14,20 15,24 C16,28 17,32 18,28 C19,24 20,18 23,16 C26,14 27,20 27,24 L28,36"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* e */}
        <Path
          d="M30,36 C30,36 28,28 30,26 C32,24 35,25 35,28 C35,32 30,36 30,36 C30,36 33,38 36,34"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* g */}
        <Path
          d="M38,27 C38,27 36,24 38,23 C40,22 42,24 42,27 C42,30 40,32 38,32 C36,32 35,30 36,28 M42,27 L42,38 C42,40 40,42 38,42"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* h */}
        <Path
          d="M45,18 L45,36 M45,28 C46,25 49,23 51,24 C53,25 53,28 53,32 L53,36"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* a */}
        <Path
          d="M62,27 C62,27 60,24 62,23 C64,22 66,24 66,27 C66,30 64,33 62,33 C60,33 59,31 60,29 M66,27 L66,36"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* n */}
        <Path
          d="M68,36 L68,24 M68,28 C69,25 72,23 74,24 C76,25 76,28 76,32 L76,36"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* gap before last name */}
        {/* A — tall capital */}
        <Path
          d="M86,36 L92,14 L98,36 M88,28 L96,28"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* n */}
        <Path
          d="M100,36 L100,24 M100,28 C101,25 104,23 106,24 C108,25 108,28 108,32 L108,36"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* d */}
        <Path
          d="M118,18 L118,36 M118,27 C117,24 114,23 112,24 C110,25 110,28 111,31 C112,33 115,34 118,32"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* r */}
        <Path
          d="M120,36 L120,24 M120,27 C121,25 124,23 126,24"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* o */}
        <Path
          d="M136,28 C136,25 134,23 132,23 C130,23 128,25 128,28 C128,31 130,33 132,33 C134,33 136,31 136,28 Z"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* m */}
        <Path
          d="M138,36 L138,24 M138,28 C139,25 142,23 144,24 C146,25 146,28 146,32 M146,28 C147,25 150,23 152,24 C154,25 154,28 154,32 L154,36"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* e */}
        <Path
          d="M164,36 C164,36 162,28 164,26 C166,24 169,25 169,28 C169,32 164,36 164,36 C164,36 167,38 170,34"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* underline flourish */}
        <Path
          d="M2,42 C40,40 100,43 175,40"
          fill="none"
          stroke="#1d1e2c"
          strokeWidth={0.8}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ fontSize: 8.5, fontWeight: 700, color: "#1d1e2c", marginTop: 2 }}>Meghan Androme</Text>
      <Text style={{ fontSize: 8, color: "#444" }}>Managing Director, CEO</Text>
      <Text style={{ fontSize: 7.5, color: "#444" }}>DayDrive UK &amp; Ireland</Text>
    </View>
  );
}
