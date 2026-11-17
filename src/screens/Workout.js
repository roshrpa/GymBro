import React, { useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { MUSCLE_LABEL, videoUrl } from '../data/exercises';

export default function Workout({ workout, onBack }) {
  const [done, setDone] = useState({});
  const total = workout.blocks.reduce((n, b) => n + b.items.length, 0);
  const count = Object.values(done).filter(Boolean).length;

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <TouchableOpacity onPress={onBack}>
        <Text style={{ color: C.accent, fontWeight: '700', marginBottom: 10 }}>← Back</Text>
      </TouchableOpacity>
      <Text style={S.h1}>{workout.title}</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>{count} / {total} exercises done</Text>

      {workout.blocks.map((b) => (
        <View key={b.muscle}>
          <Text style={S.h2}>{MUSCLE_LABEL[b.muscle]}</Text>
          {b.items.map((ex) => {
            const on = !!done[ex.name];
            return (
              <View key={ex.name} style={[S.card, on && { borderColor: C.good }]}>
                <Text style={{ color: C.text, fontSize: 16, fontWeight: '700' }}>{ex.name}</Text>
                <Text style={[S.sub, { marginVertical: 4 }]}>{ex.sets} sets × {ex.reps}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[S.chip, { borderColor: C.accent }]}
                    onPress={() => Linking.openURL(videoUrl(ex.name))}
                  >
                    <Text style={{ color: C.accent, fontWeight: '700' }}>▶ Watch demo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[S.chip, on && { backgroundColor: C.good, borderColor: C.good }]}
                    onPress={() => setDone({ ...done, [ex.name]: !on })}
                  >
                    <Text style={[S.chipText, on && { color: '#fff' }]}>{on ? '✓ Done' : 'Mark done'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
