import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { S } from '../theme';

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

export default function Onboarding({ initial, onDone }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [sex, setSex] = useState(initial?.sex ?? 'male');
  const [height, setHeight] = useState(initial ? String(initial.heightCm) : '');
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : '');
  const [goal, setGoal] = useState(initial?.goal ?? 'maintain');
  const [days, setDays] = useState(initial?.daysPerWeek ?? 3);

  const submit = () => {
    const a = Number(age), h = Number(height), w = Number(weight);
    if (!(a >= 12 && a <= 90) || !(h >= 120 && h <= 230) || !(w >= 30 && w <= 250)) {
      Alert.alert('Check your details', 'Please enter a valid age, height (cm) and weight (kg).');
      return;
    }
    onDone({ name: name.trim() || 'Athlete', age: a, sex, heightCm: h, weightKg: w, goal, daysPerWeek: days });
  };

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
      <Text style={S.h1}>{initial ? 'Edit profile' : 'Welcome to GymBuddy 💪'}</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>Tell us about you and we'll build your weekly split.</Text>

      <Text style={S.label}>Name</Text>
      <TextInput style={S.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#667" />

      <Text style={S.label}>Age</Text>
      <TextInput style={S.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="e.g. 25" placeholderTextColor="#667" />

      <Text style={S.label}>Sex</Text>
      <Chips value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />

      <Text style={S.label}>Height (cm)</Text>
      <TextInput style={S.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="e.g. 172" placeholderTextColor="#667" />

      <Text style={S.label}>Weight (kg)</Text>
      <TextInput style={S.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="e.g. 70" placeholderTextColor="#667" />

      <Text style={S.label}>Goal</Text>
      <Chips
        value={goal}
        onChange={setGoal}
        options={[
          { value: 'lose', label: 'Lose fat' },
          { value: 'maintain', label: 'Maintain' },
          { value: 'gain', label: 'Build muscle' },
        ]}
      />

      <Text style={S.label}>Workout days per week</Text>
      <Chips value={days} onChange={setDays} options={[2, 3, 4, 5, 6].map((d) => ({ value: d, label: `${d} days` }))} />

      <TouchableOpacity style={S.btn} onPress={submit}>
        <Text style={S.btnText}>{initial ? 'Save' : 'Create my plan'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
