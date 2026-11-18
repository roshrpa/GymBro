import { StyleSheet } from 'react-native';

export const C = {
  bg: '#0b0b0d',
  card: '#17171a',
  border: '#2a2a30',
  text: '#f5f5f2',
  sub: '#a1a1a8',
  accent: '#c6ff3d',
  onAccent: '#0b0b0d',
  good: '#c6ff3d',
};

export const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 18, paddingBottom: 40 },
  h1: { color: C.text, fontSize: 28, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  h2: { color: C.text, fontSize: 18, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  sub: { color: C.sub, fontSize: 14 },
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  btn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: C.onAccent, fontWeight: '900', fontSize: 16, letterSpacing: 1, textTransform: 'uppercase' },
  input: {
    backgroundColor: C.bg,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    color: C.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  label: { color: C.sub, fontSize: 13, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: C.border },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.sub, fontWeight: '600' },
  chipTextOn: { color: C.onAccent, fontWeight: '800' },
});
