import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { DAY_NAMES } from '../data/splits';
import { MUSCLE_LABEL } from '../data/exercises';
import { dayKey, shiftDay } from '../utils/diary';
import { workoutOn, isChanged } from '../utils/schedule';
import WorkoutPicker from '../components/WorkoutPicker';

const label = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAY_NAMES[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1}`;
};

export default function Schedule({ profile, plan, onOpenWorkout, onChangeDay, onResetPlan, entries = [] }) {
  const [editKey, setEditKey] = useState(null);
  const today = dayKey();
  const overrides = profile.overrides || {};
  const days = Array.from({ length: 14 }, (_, i) => shiftDay(today, i));
  const hasChanges = Object.keys(overrides).length > 0;

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>Schedule</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>
        {profile.daysPerWeek} days / week. Tap a day to train, or use Change to pick any workout.
      </Text>

      {days.map((key) => {
        const w = workoutOn(plan, overrides, key);
        const isToday = key === today;
        const changed = isChanged(overrides, key);
        const acts = entries.filter((e) => e.kind === 'activity' && e.date === key);
        return (
          <View key={key} style={[S.card, isToday && { borderColor: C.accent }, !w && { opacity: 0.8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{label(key)}</Text>
              <Text style={{ color: C.accent, fontWeight: '700' }}>{isToday ? 'TODAY' : changed ? 'CHANGED' : ''}</Text>
            </View>
            <TouchableOpacity disabled={!w} onPress={() => w && onOpenWorkout(w)}>
              {w ? (
                <>
                  <Text style={{ color: C.text, marginTop: 4, fontWeight: '600' }}>{w.title}</Text>
                  <Text style={S.sub}>{w.blocks.map((b) => MUSCLE_LABEL[b.muscle]).join(' • ')}</Text>
                </>
              ) : (
                <Text style={[S.sub, { marginTop: 4 }]}>Rest</Text>
              )}
            </TouchableOpacity>
            {acts.length > 0 && (
              <Text style={{ color: C.accent, marginTop: 6, fontWeight: '600' }}>
                Also: {acts.map((a) => `${a.name} ${a.minutes} min`).join(', ')}
              </Text>
            )}
            <TouchableOpacity onPress={() => setEditKey(key)} style={{ marginTop: 10, alignSelf: 'flex-start' }}>
              <Text style={{ color: C.accent, fontWeight: '800' }}>{w ? 'Change workout' : 'Train anyway'}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {hasChanges && (
        <TouchableOpacity style={[S.btn, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={onResetPlan}>
          <Text style={[S.btnText, { color: C.text }]}>Reset to my original plan</Text>
        </TouchableOpacity>
      )}

      <WorkoutPicker
        visible={!!editKey}
        dateLabel={editKey ? label(editKey) : ''}
        plan={plan}
        onClose={() => setEditKey(null)}
        onPick={(desc) => {
          onChangeDay(editKey, desc);
          setEditKey(null);
        }}
      />
    </ScrollView>
  );
}
