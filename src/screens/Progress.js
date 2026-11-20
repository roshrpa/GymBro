import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { S, C } from '../theme';
import { monthActivityDays } from '../utils/diary';
import {
  exerciseTrend, formatKg, monthWorkoutDays, personalRecords, sessionVolume, weekStreak, workoutsThisWeek,
} from '../utils/logs';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
  { key: 'records', label: 'Records' },
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Bars({ values, labels, color = C.accent, height = 90 }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  // scale from slightly below the minimum so small changes are visible
  const floor = values.length > 1 ? Math.max(0, min - (max - min) * 0.6 - 1) : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 4 }}>
      {values.map((v, i) => {
        const h = Math.max(6, ((v - floor) / (max - floor || 1)) * (height - 16));
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ color: C.sub, fontSize: 9 }}>{Math.round(v * 10) / 10}</Text>
            <View style={{ width: '70%', height: h, backgroundColor: color, borderRadius: 4 }} />
            {labels && <Text style={{ color: C.sub, fontSize: 9 }}>{labels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={[S.card, { flex: 1, alignItems: 'center', marginBottom: 0 }]}>
      <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>{value}</Text>
      <Text style={[S.sub, { fontSize: 12, textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

const shortDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

function Overview({ profile, logs, onLogWeight }) {
  const [kg, setKg] = useState('');
  const [exercise, setExercise] = useState(null);
  const names = useMemo(() => [...new Set(logs.flatMap((l) => l.sets.map((s) => s.exercise)))].sort(), [logs]);
  const chosen = exercise && names.includes(exercise) ? exercise : names[0];
  const trend = chosen ? exerciseTrend(logs, chosen).slice(-10) : [];
  const wh = (profile.weightHistory || []).slice(-10);

  const submitWeight = () => {
    const v = parseFloat(kg.replace(',', '.'));
    if (!(v >= 30 && v <= 250)) {
      Alert.alert('Check weight', 'Enter a weight between 30 and 250 kg.');
      return;
    }
    onLogWeight(v);
    setKg('');
  };

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <Stat label="This week" value={`${workoutsThisWeek(logs)}/${profile.daysPerWeek}`} />
        <Stat label="Week streak 🔥" value={weekStreak(logs)} />
        <Stat label="Total workouts" value={logs.length} />
      </View>

      <View style={S.card}>
        <Text style={S.h2}>Body weight</Text>
        <Text style={[S.sub, { marginBottom: 8 }]}>Current: {formatKg(profile.weightKg)} kg</Text>
        {wh.length > 1 ? (
          <Bars values={wh.map((e) => e.kg)} labels={wh.map((e) => shortDate(e.date))} color="#4da3ff" />
        ) : (
          <Text style={S.sub}>Log your weight over time to see a chart.</Text>
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TextInput
            style={[S.input, { flex: 1, marginBottom: 0 }]}
            value={kg}
            onChangeText={setKg}
            keyboardType="decimal-pad"
            placeholder="Today's weight (kg)"
            placeholderTextColor="#667"
          />
          <TouchableOpacity style={[S.btn, { marginTop: 0, paddingHorizontal: 18, justifyContent: 'center' }]} onPress={submitWeight}>
            <Text style={S.btnText}>Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={S.card}>
        <Text style={S.h2}>Strength progress</Text>
        {names.length === 0 ? (
          <Text style={S.sub}>Finish a workout to start tracking strength.</Text>
        ) : (
          <>
            <View style={S.row}>
              {names.map((n) => (
                <TouchableOpacity key={n} style={[S.chip, chosen === n && S.chipOn]} onPress={() => setExercise(n)}>
                  <Text style={[S.chipText, chosen === n && S.chipTextOn]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[S.sub, { marginBottom: 8 }]}>Best set per session (estimated 1RM, or reps for bodyweight)</Text>
            {trend.length > 1 ? (
              <Bars values={trend.map((t) => t.score)} labels={trend.map((t) => shortDate(t.date))} />
            ) : (
              <Text style={S.sub}>Do this exercise in 2+ workouts to see a trend.</Text>
            )}
          </>
        )}
      </View>
    </>
  );
}

function History({ logs, entries = [] }) {
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [open, setOpen] = useState(null);
  const days = monthWorkoutDays(logs, ym.y, ym.m);
  const actDays = monthActivityDays(entries, ym.y, ym.m);
  const first = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7; // Monday = 0
  const count = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const move = (d) => {
    const dt = new Date(ym.y, ym.m + d, 1);
    setYm({ y: dt.getFullYear(), m: dt.getMonth() });
  };
  const isToday = (d) => d && ym.y === today.getFullYear() && ym.m === today.getMonth() && d === today.getDate();
  const recent = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);

  return (
    <>
      <View style={S.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => move(-1)}><Text style={{ color: C.accent, fontSize: 20, padding: 6 }}>‹</Text></TouchableOpacity>
          <Text style={S.h2}>{MONTHS[ym.m]} {ym.y}</Text>
          <TouchableOpacity onPress={() => move(1)}><Text style={{ color: C.accent, fontSize: 20, padding: 6 }}>›</Text></TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={{ width: `${100 / 7}%`, textAlign: 'center', color: C.sub, fontSize: 12 }}>{d}</Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}>
              {d ? (
                <View
                  style={{
                    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: days.has(d) ? C.accent : 'transparent',
                    borderWidth: isToday(d) || (actDays.has(d) && !days.has(d)) ? 1 : 0,
                    borderColor: actDays.has(d) && !days.has(d) ? C.accent : C.text,
                  }}
                >
                  <Text style={{ color: days.has(d) ? C.onAccent : C.text, fontWeight: days.has(d) ? '800' : '400' }}>{d}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <Text style={S.h2}>Recent workouts</Text>
      {recent.length === 0 && <Text style={S.sub}>No workouts yet. Finish one and it will show up here.</Text>}
      {recent.map((l) => {
        const isOpen = open === l.id;
        const byEx = {};
        l.sets.forEach((s) => { (byEx[s.exercise] = byEx[s.exercise] || []).push(s); });
        return (
          <TouchableOpacity key={l.id} style={S.card} onPress={() => setOpen(isOpen ? null : l.id)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: C.text, fontWeight: '700' }}>{l.title}</Text>
              <Text style={S.sub}>{new Date(l.date).toDateString()}</Text>
            </View>
            <Text style={S.sub}>{l.sets.length} sets • {Math.round(sessionVolume(l))} kg volume</Text>
            {isOpen && Object.entries(byEx).map(([name, ss]) => (
              <View key={name} style={{ marginTop: 8 }}>
                <Text style={{ color: C.text }}>{name}</Text>
                <Text style={S.sub}>{ss.map((s) => (s.kg > 0 ? `${formatKg(s.kg)}×${s.reps}` : `${s.reps}`)).join('  •  ')}</Text>
              </View>
            ))}
          </TouchableOpacity>
        );
      })}
    </>
  );
}

function Records({ logs }) {
  const prs = personalRecords(logs);
  if (prs.length === 0) return <Text style={S.sub}>Your personal records will appear here after your first workout.</Text>;
  return prs.map((p) => (
    <View key={p.exercise} style={S.card}>
      <Text style={{ color: C.text, fontWeight: '700' }}>🏆 {p.exercise}</Text>
      <Text style={{ color: C.accent, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
        {p.kg > 0 ? `${formatKg(p.kg)} kg × ${p.reps}` : `${p.reps} reps`}
      </Text>
      <Text style={S.sub}>
        {p.kg > 0 ? `Est. 1RM ${Math.round(p.score)} kg • ` : ''}{new Date(p.date).toDateString()}
      </Text>
    </View>
  ));
}

export default function Progress({ profile, logs, onLogWeight, entries = [] }) {
  const [tab, setTab] = useState('overview');
  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
      <Text style={S.h1}>Progress</Text>
      <View style={[S.row, { marginTop: 8 }]}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[S.chip, tab === t.key && S.chipOn]} onPress={() => setTab(t.key)}>
            <Text style={[S.chipText, tab === t.key && S.chipTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'overview' && <Overview profile={profile} logs={logs} onLogWeight={onLogWeight} />}
      {tab === 'history' && <History logs={logs} entries={entries} />}
      {tab === 'records' && <Records logs={logs} />}
    </ScrollView>
  );
}
