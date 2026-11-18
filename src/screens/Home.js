import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { DAY_NAMES, workoutForWeekday } from '../data/splits';
import { MUSCLE_LABEL } from '../data/exercises';
import { summary } from '../utils/health';
import { weekStreak, workoutsThisWeek } from '../utils/logs';

export default function Home({ profile, plan, logs, onOpenWorkout }) {
  const today = new Date().getDay();
  const todays = workoutForWeekday(plan, today);
  const h = summary(profile);
  const doneToday = logs.some((l) => new Date(l.date).toDateString() === new Date().toDateString());
  const streak = weekStreak(logs);

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>Hi {profile.name} 👋</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>{DAY_NAMES[today]}</Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <View style={[S.card, { flex: 1, marginBottom: 0, alignItems: 'center' }]}>
          <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>{workoutsThisWeek(logs)}/{profile.daysPerWeek}</Text>
          <Text style={S.sub}>This week</Text>
        </View>
        <View style={[S.card, { flex: 1, marginBottom: 0, alignItems: 'center' }]}>
          <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>🔥 {streak}</Text>
          <Text style={S.sub}>Week streak</Text>
        </View>
      </View>

      {todays ? (
        <TouchableOpacity style={[S.card, { borderColor: C.accent }]} onPress={() => onOpenWorkout(todays)}>
          <Text style={S.sub}>TODAY'S WORKOUT</Text>
          <Text style={[S.h1, { marginTop: 6 }]}>{todays.title}</Text>
          <Text style={S.sub}>{todays.blocks.map((b) => MUSCLE_LABEL[b.muscle]).join(' • ')}</Text>
          <View style={S.btn}>
            <Text style={S.btnText}>{doneToday ? 'Log another session ▶' : 'Start workout ▶'}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={S.card}>
          <Text style={S.sub}>TODAY</Text>
          <Text style={[S.h1, { marginTop: 6 }]}>Rest day 😴</Text>
          <Text style={S.sub}>Recovery is when muscles grow. Eat well, sleep 7-8 hours, drink water.</Text>
        </View>
      )}

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
