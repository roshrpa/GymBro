import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Linking } from 'react-native';
import { S, C } from '../theme';
import { DAY_NAMES } from '../data/splits';
import { dayKey } from '../utils/diary';
import { workoutOn, isChanged } from '../utils/schedule';
import WorkoutPicker from '../components/WorkoutPicker';
import { MUSCLE_LABEL } from '../data/exercises';
import { summary } from '../utils/health';
import { weekStreak, workoutsThisWeek } from '../utils/logs';

export default function Home({ profile, plan, logs, onOpenWorkout, update, onChangeDay }) {
  const [picking, setPicking] = useState(false);
  const today = new Date().getDay();
  const todays = workoutOn(plan, profile.overrides || {}, dayKey());
  const changedToday = isChanged(profile.overrides || {}, dayKey());
  const h = summary(profile);
  const doneToday = logs.some((l) => new Date(l.date).toDateString() === new Date().toDateString());
  const streak = weekStreak(logs);

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>Hey, {profile.name}</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>{DAY_NAMES[today]}</Text>

      {update && update.available && update.url ? (
        <TouchableOpacity style={[S.card, { borderColor: C.accent, marginBottom: 14 }]} onPress={() => Linking.openURL(update.url)}>
          <Text style={{ color: C.accent, fontWeight: '800' }}>Update available (build {update.build})</Text>
          <Text style={S.sub}>Tap to download the new GymBro APK, then open it to install.</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <View style={[S.card, { flex: 1, marginBottom: 0, alignItems: 'center' }]}>
          <Text style={{ color: C.text, fontSize: 28, fontWeight: '900' }}>{workoutsThisWeek(logs)}/{profile.daysPerWeek}</Text>
          <Text style={S.sub}>This week</Text>
        </View>
        <View style={[S.card, { flex: 1, marginBottom: 0, alignItems: 'center' }]}>
          <Text style={{ color: C.accent, fontSize: 28, fontWeight: '900' }}>{streak}</Text>
          <Text style={S.sub}>Week streak</Text>
        </View>
      </View>

      {todays ? (
        <View style={[S.card, { backgroundColor: C.accent, borderColor: C.accent, padding: 22 }]}>
          <TouchableOpacity onPress={() => onOpenWorkout(todays)}>
            <Text style={{ color: C.onAccent, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>
              {changedToday ? "TODAY'S WORKOUT (CHANGED)" : "TODAY'S WORKOUT"}
            </Text>
            <Text style={[S.h1, { marginTop: 6, color: C.onAccent, fontSize: 44, lineHeight: 44 }]}>{todays.title}</Text>
            <Text style={{ color: C.onAccent, fontWeight: '600' }}>{todays.blocks.map((b) => MUSCLE_LABEL[b.muscle]).join(' • ')}</Text>
            <View style={[S.btn, { backgroundColor: C.onAccent }]}>
              <Text style={[S.btnText, { color: C.accent }]}>{doneToday ? 'Log another session ▶' : 'Start workout ▶'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPicking(true)} style={{ alignItems: 'center', paddingTop: 14 }}>
            <Text style={{ color: C.onAccent, fontWeight: '800', textDecorationLine: 'underline' }}>Train something else today</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={S.card}>
          <Text style={S.sub}>TODAY</Text>
          <Text style={[S.h1, { marginTop: 6 }]}>Rest day</Text>
          <Text style={S.sub}>Recovery is when muscles grow. Eat well, sleep 7-8 hours, drink water.</Text>
          <TouchableOpacity style={[S.btn, { backgroundColor: C.card, borderWidth: 1, borderColor: C.accent }]} onPress={() => setPicking(true)}>
            <Text style={[S.btnText, { color: C.accent }]}>Train anyway</Text>
          </TouchableOpacity>
        </View>
      )}

      <WorkoutPicker
        visible={picking}
        dateLabel="Today"
        plan={plan}
        onClose={() => setPicking(false)}
        onPick={(desc) => {
          onChangeDay(dayKey(), desc);
          setPicking(false);
        }}
      />

      <View style={S.card}>
        <Text style={S.sub}>YOUR BMI</Text>
        <Text style={{ color: h.category.color, fontSize: 40, fontWeight: '800' }}>{h.bmi.toFixed(1)}</Text>
        <Text style={{ color: h.category.color, fontWeight: '700' }}>{h.category.label}</Text>
        <Text style={[S.sub, { marginTop: 8 }]}>
          Daily target: {h.calories.target} kcal • {h.protein} g protein • {h.water} L water
        </Text>
      </View>
    </ScrollView>
  );
}
