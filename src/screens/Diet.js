import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { calorieTargets, macroTargets, waterTarget } from '../utils/calculators';
import { buildDiet } from '../utils/diet';

const ACTIVITY_BY_DAYS = { 2: 1.375, 3: 1.55, 4: 1.55, 5: 1.725, 6: 1.725 };

function Pill({ label, value }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: C.text, fontWeight: '800', fontSize: 18 }}>{value}</Text>
      <Text style={S.sub}>{label}</Text>
    </View>
  );
}

export default function Diet({ profile }) {
  const [pref, setPref] = useState(profile.dietPref || 'nonveg');

  const data = useMemo(() => {
    const c = calorieTargets({
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      sex: profile.sex,
      activity: ACTIVITY_BY_DAYS[profile.daysPerWeek] || 1.55,
      goal: profile.goal,
    });
    const m = macroTargets(profile.weightKg, c.target, profile.goal);
    return { c, m, diet: buildDiet(c.target, m.protein, pref) };
  }, [profile, pref]);

  const { c, m, diet } = data;

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>Daily diet plan</Text>
      <Text style={[S.sub, { marginBottom: 14 }]}>
        Built for {profile.goal === 'lose' ? 'fat loss' : profile.goal === 'gain' ? 'muscle gain' : 'maintenance'}
      </Text>

      <View style={S.row}>
        {[{ v: 'nonveg', l: 'Non-veg' }, { v: 'veg', l: 'Vegetarian' }].map((o) => (
          <TouchableOpacity key={o.v} style={[S.chip, pref === o.v && S.chipOn]} onPress={() => setPref(o.v)}>
            <Text style={[S.chipText, pref === o.v && S.chipTextOn]}>{o.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={S.card}>
        <Text style={S.sub}>YOUR DAILY TARGET</Text>
        <Text style={{ color: C.accent, fontSize: 36, fontWeight: '800', marginVertical: 4 }}>{c.target} kcal</Text>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Pill label="Protein" value={`${m.protein} g`} />
          <Pill label="Carbs" value={`${m.carbs} g`} />
          <Pill label="Fat" value={`${m.fat} g`} />
          <Pill label="Water" value={`${waterTarget(profile.weightKg)} L`} />
        </View>
      </View>

      {diet.meals.map((meal) => (
        <View key={meal.name} style={S.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={S.h2}>{meal.name}</Text>
            <Text style={S.sub}>{meal.time}</Text>
          </View>
          {meal.items.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ color: C.text, flex: 1 }}>{it.name}</Text>
              <Text style={{ color: C.sub }}>{it.quantity}</Text>
            </View>
          ))}
          <Text style={[S.sub, { marginTop: 6 }]}>
            {meal.total.kcal} kcal • P {meal.total.p} g • C {meal.total.c} g • F {meal.total.f} g
          </Text>
        </View>
      ))}

      {diet.addon && (
        <View style={S.card}>
          <Text style={S.h2}>Add-on</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: C.text, flex: 1 }}>{diet.addon.name}</Text>
            <Text style={{ color: C.sub }}>{diet.addon.quantity}</Text>
          </View>
          <Text style={[S.sub, { marginTop: 6 }]}>
            Food alone is a little short on protein; this closes the gap ({diet.addon.p} g protein).
          </Text>
        </View>
      )}

      <View style={[S.card, { borderColor: C.accent }]}>
        <Text style={S.sub}>PLAN TOTAL</Text>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 18, marginTop: 4 }}>
          {diet.total.kcal} kcal • P {diet.total.p} g • C {diet.total.c} g • F {diet.total.f} g
        </Text>
      </View>

      <View style={S.card}>
        <Text style={S.h2}>Tips</Text>
        {[
          'Eat a protein source at every meal and spread it through the day.',
          'Have a banana or rice-based meal 1-2 hours before training for energy.',
          'Eat within 2 hours after training; add the whey scoop here if suggested.',
          'Weigh yourself weekly, same time of day. Adjust calories by ~100-200 if the trend stalls for 2-3 weeks.',
          'Swap foods freely: chicken ⇄ fish ⇄ paneer ⇄ soya; rice ⇄ chapati. Keep the calories similar.',
        ].map((t, i) => (
          <Text key={i} style={[S.sub, { marginBottom: 6 }]}>• {t}</Text>
        ))}
      </View>
      <Text style={[S.sub, { fontSize: 12 }]}>
        Food values are approximate averages. Not medical advice; see a dietitian for medical conditions.
      </Text>
    </ScrollView>
  );
}
