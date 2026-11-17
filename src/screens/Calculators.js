import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { bmiCategory } from '../utils/health';
import {
  ACTIVITY_LEVELS,
  bmiValue,
  idealWeights,
  bodyFatNavy,
  bodyFatCategory,
  calorieTargets,
  macroTargets,
  waterTarget,
} from '../utils/calculators';

const TABS = [
  { key: 'bmi', label: 'BMI' },
  { key: 'ideal', label: 'Ideal weight' },
  { key: 'cal', label: 'Calories' },
  { key: 'macro', label: 'Macros' },
  { key: 'fat', label: 'Body fat' },
];

function Chips({ options, value, onChange }) {
  return (
    <View style={S.row}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <TouchableOpacity key={String(o.value)} style={[S.chip, on && S.chipOn]} onPress={() => onChange(o.value)}>
            <Text style={[S.chipText, on && S.chipTextOn]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <View style={{ flex: 1, minWidth: '45%' }}>
      <Text style={S.label}>{label}</Text>
      <TextInput
        style={S.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#667"
      />
    </View>
  );
}

function Row({ k, v, color }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={S.sub}>{k}</Text>
      <Text style={{ color: color || C.text, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}

const num = (s) => {
  const n = parseFloat(String(s).replace(',', '.'));
  return isFinite(n) ? n : 0;
};

export default function Calculators({ profile }) {
  const [tab, setTab] = useState('bmi');
  const [sex, setSex] = useState(profile.sex);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState(profile.goal);
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [hip, setHip] = useState('');

  const h = num(height), w = num(weight), a = num(age);
  const valid = h >= 100 && h <= 230 && w >= 25 && w <= 300 && a >= 12 && a <= 100;

  const renderResult = () => {
    if (!valid) return <Text style={S.sub}>Enter valid age, height (100-230 cm) and weight (25-300 kg).</Text>;

    if (tab === 'bmi') {
      const b = bmiValue(w, h);
      const cat = bmiCategory(b);
      const lo = 18.5 * (h / 100) ** 2, hi = 24.9 * (h / 100) ** 2;
      return (
        <>
          <Text style={{ color: cat.color, fontSize: 44, fontWeight: '800' }}>{b.toFixed(1)}</Text>
          <Text style={{ color: cat.color, fontWeight: '700', marginBottom: 8 }}>{cat.label}</Text>
          <Row k="Healthy weight for your height" v={`${lo.toFixed(1)} – ${hi.toFixed(1)} kg`} />
          <Text style={[S.sub, { fontSize: 12, marginTop: 6 }]}>
            BMI ignores muscle mass, so a muscular person can read "Overweight" while being lean.
          </Text>
        </>
      );
    }

    if (tab === 'ideal') {
      const iw = idealWeights(h, sex);
      const diff = w - iw.avg;
      return (
        <>
          <Text style={{ color: C.text, fontSize: 36, fontWeight: '800' }}>{iw.avg.toFixed(1)} kg</Text>
          <Text style={[S.sub, { marginBottom: 8 }]}>Average of four formulas</Text>
          <Row k="Devine" v={`${iw.devine.toFixed(1)} kg`} />
          <Row k="Robinson" v={`${iw.robinson.toFixed(1)} kg`} />
          <Row k="Miller" v={`${iw.miller.toFixed(1)} kg`} />
          <Row k="Hamwi" v={`${iw.hamwi.toFixed(1)} kg`} />
          <Row
            k="You vs ideal"
            v={`${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`}
            color={Math.abs(diff) < 3 ? C.good : C.accent}
          />
          <Text style={[S.sub, { fontSize: 12, marginTop: 6 }]}>
            These formulas are rough guides. Lifters often weigh above them because of muscle.
          </Text>
        </>
      );
    }

    if (tab === 'cal') {
      const c = calorieTargets({ weightKg: w, heightCm: h, age: a, sex, activity, goal });
      return (
        <>
          <Text style={{ color: C.accent, fontSize: 40, fontWeight: '800' }}>{c.target} kcal</Text>
          <Text style={[S.sub, { marginBottom: 8 }]}>Daily target for your goal</Text>
          <Row k="BMR (resting)" v={`${c.bmr} kcal`} />
          <Row k="Maintenance (TDEE)" v={`${c.maintenance} kcal`} />
          <Row k="Goal adjustment" v={`${c.adjust > 0 ? '+' : ''}${c.adjust} kcal`} />
          {c.flooredForSafety && (
            <Text style={{ color: C.accent, fontSize: 12, marginTop: 6 }}>
              Target raised to a safe minimum. Do not eat below this without medical supervision.
            </Text>
          )}
        </>
      );
    }

    if (tab === 'macro') {
      const c = calorieTargets({ weightKg: w, heightCm: h, age: a, sex, activity, goal });
      const m = macroTargets(w, c.target, goal);
      return (
        <>
          <Text style={{ color: C.text, fontSize: 28, fontWeight: '800', marginBottom: 8 }}>{c.target} kcal / day</Text>
          <Row k="Protein" v={`${m.protein} g`} />
          <Row k="Carbohydrates" v={`${m.carbs} g`} />
          <Row k="Fat" v={`${m.fat} g`} />
          <Row k="Fibre" v={`${m.fiber} g`} />
          <Row k="Water" v={`${waterTarget(w)} L`} />
        </>
      );
    }

    const bf = bodyFatNavy({ sex, heightCm: h, waistCm: num(waist), neckCm: num(neck), hipCm: num(hip) });
    return (
      <>
        <Field label="Waist at navel (cm)" value={waist} onChange={setWaist} placeholder="e.g. 85" />
        <Field label="Neck (cm)" value={neck} onChange={setNeck} placeholder="e.g. 38" />
        {sex === 'female' && <Field label="Hip, widest (cm)" value={hip} onChange={setHip} placeholder="e.g. 98" />}
        {bf ? (
          <>
            <Text style={{ color: C.text, fontSize: 40, fontWeight: '800' }}>{bf.toFixed(1)}%</Text>
            <Text style={{ color: C.accent, fontWeight: '700' }}>{bodyFatCategory(bf, sex)}</Text>
            <Row k="Lean mass" v={`${(w * (1 - bf / 100)).toFixed(1)} kg`} />
            <Row k="Fat mass" v={`${(w * (bf / 100)).toFixed(1)} kg`} />
          </>
        ) : (
          <Text style={S.sub}>Enter your measurements to estimate body fat (US Navy method).</Text>
        )}
      </>
    );
  };

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
      <Text style={S.h1}>Calculators</Text>
      <Text style={[S.sub, { marginBottom: 14 }]}>Prefilled from your profile. Change anything to try other values.</Text>

      <View style={S.row}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[S.chip, tab === t.key && S.chipOn]} onPress={() => setTab(t.key)}>
            <Text style={[S.chipText, tab === t.key && S.chipTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={S.card}>
        <Chips value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Field label="Age" value={age} onChange={setAge} />
          <Field label="Height (cm)" value={height} onChange={setHeight} />
          <Field label="Weight (kg)" value={weight} onChange={setWeight} />
        </View>
        {(tab === 'cal' || tab === 'macro') && (
          <>
            <Text style={S.label}>Activity level</Text>
            <Chips value={activity} onChange={setActivity} options={ACTIVITY_LEVELS.map((l) => ({ value: l.value, label: l.label }))} />
            <Text style={[S.sub, { fontSize: 12, marginTop: -6, marginBottom: 10 }]}>
              {ACTIVITY_LEVELS.find((l) => l.value === activity)?.hint}
            </Text>
            <Text style={S.label}>Goal</Text>
            <Chips
              value={goal}
              onChange={setGoal}
              options={[{ value: 'lose', label: 'Lose fat' }, { value: 'maintain', label: 'Maintain' }, { value: 'gain', label: 'Build muscle' }]}
            />
          </>
        )}
      </View>

      <View style={S.card}>{renderResult()}</View>
      <Text style={[S.sub, { fontSize: 12 }]}>Estimates only, not medical advice.</Text>
    </ScrollView>
  );
}
