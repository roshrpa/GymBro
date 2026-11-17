import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { summary } from '../utils/health';

function Row({ k, v }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={S.sub}>{k}</Text>
      <Text style={{ color: C.text, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}

export default function Health({ profile, onEdit }) {
  const h = summary(profile);
  // BMI scale 15..40 mapped to 0..100%
  const pct = Math.min(100, Math.max(0, ((h.bmi - 15) / 25) * 100));
  const goalText =
    profile.goal === 'lose' ? 'Fat loss (−500 kcal)' : profile.goal === 'gain' ? 'Muscle gain (+300 kcal)' : 'Maintain';

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>Health</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>
        {profile.weightKg} kg • {profile.heightCm} cm • {profile.age} yrs
      </Text>

      <View style={S.card}>
        <Text style={S.sub}>BMI</Text>
        <Text style={{ color: h.category.color, fontSize: 44, fontWeight: '800' }}>{h.bmi.toFixed(1)}</Text>
        <Text style={{ color: h.category.color, fontWeight: '700', marginBottom: 12 }}>{h.category.label}</Text>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: C.border, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: 10, backgroundColor: h.category.color }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={S.sub}>15</Text><Text style={S.sub}>18.5</Text><Text style={S.sub}>25</Text><Text style={S.sub}>30</Text><Text style={S.sub}>40</Text>
        </View>
      </View>

      <View style={S.card}>
        <Text style={S.h2}>Weight</Text>
        <Row k="Healthy range" v={`${h.range.min.toFixed(1)} – ${h.range.max.toFixed(1)} kg`} />
        <Row
          k="To reach range"
          v={h.toHealthyRangeKg === 0 ? 'In range ✓' : `${h.toHealthyRangeKg > 0 ? '+' : ''}${h.toHealthyRangeKg.toFixed(1)} kg`}
        />
      </View>

      <View style={S.card}>
        <Text style={S.h2}>Daily nutrition</Text>
        <Row k="Goal" v={goalText} />
        <Row k="BMR (at rest)" v={`${h.bmr} kcal`} />
        <Row k="Maintenance" v={`${h.calories.maintenance} kcal`} />
        <Row k="Target calories" v={`${h.calories.target} kcal`} />
        <Row k="Protein" v={`${h.protein} g`} />
        <Row k="Water" v={`${h.water} L`} />
      </View>

      {(profile.weightHistory || []).length > 1 && (
        <View style={S.card}>
          <Text style={S.h2}>Weight history</Text>
          {profile.weightHistory.slice(-6).reverse().map((e, i) => (
            <Row key={i} k={new Date(e.date).toDateString()} v={`${e.kg} kg`} />
          ))}
        </View>
      )}

      <Text style={[S.sub, { fontSize: 12 }]}>
        These are general estimates, not medical advice. BMI does not account for muscle mass. See a doctor or dietitian for personal guidance.
      </Text>

      <TouchableOpacity style={S.btn} onPress={onEdit}>
        <Text style={S.btnText}>Edit profile / update weight</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
