import { StyleSheet } from 'react-native';

export const C = {
  bg: '#0f1115',
  card: '#1a1d24',
  border: '#2a2f3a',
  text: '#f2f4f8',
  sub: '#9aa3b2',
  accent: '#ff5a1f',
  good: '#34c759',
};

export const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 18, paddingBottom: 40 },
  h1: { color: C.text, fontSize: 26, fontWeight: '800', marginBottom: 4 },
  h2: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  sub: { color: C.sub, fontSize: 14 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  btn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
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
  chipTextOn: { color: '#fff' },
});
