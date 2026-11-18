import React, { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { MUSCLE_LABEL } from '../data/exercises';
import VideoPlayer from '../components/VideoPlayer';
import RestTimer from '../components/RestTimer';
import {
  bestScore, formatKg, lastPerformance, parseRepRange, sessionVolume, setScore, suggestNext,
} from '../utils/logs';

const REST_OPTIONS = [60, 90, 120, 180];

function initialRows(ex, logs) {
  const last = lastPerformance(logs, ex.name);
  const sug = suggestNext(last, ex.reps);
  const range = parseRepRange(ex.reps);
  return {
    last,
    sug,
    rows: Array.from({ length: ex.sets }, () => ({
      kg: sug && sug.kg > 0 ? formatKg(sug.kg) : '',
      reps: sug ? String(sug.reps) : range ? String(range.min) : '',
      done: false,
      pr: false,
    })),
  };
}

export default function Workout({ workout, logs, onFinish, onBack }) {
  const exercises = useMemo(
    () => workout.blocks.flatMap((b) => b.items.map((ex) => ({ ...ex, muscle: b.muscle }))),
    [workout]
  );
  const info = useMemo(() => {
    const o = {};
    for (const ex of exercises) o[ex.name] = initialRows(ex, logs);
    return o;
  }, [exercises, logs]);

  const [sets, setSets] = useState(() => {
    const o = {};
    for (const ex of exercises) o[ex.name] = info[ex.name].rows;
    return o;
  });
  const [playing, setPlaying] = useState(null);
  const [restSec, setRestSec] = useState(90);
  const [restEnd, setRestEnd] = useState(null);
  const [summary, setSummary] = useState(null);
  const startedAt = useRef(Date.now());

  const doneCount = Object.values(sets).reduce((n, rows) => n + rows.filter((r) => r.done).length, 0);
  const totalSets = exercises.reduce((n, ex) => n + ex.sets, 0);

  const update = (name, i, patch) =>
    setSets((prev) => ({ ...prev, [name]: prev[name].map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));

  const toggleSet = (ex, i) => {
    const row = sets[ex.name][i];
    if (row.done) {
      update(ex.name, i, { done: false, pr: false });
      return;
    }
    const reps = parseInt(row.reps, 10);
    const kg = parseFloat(String(row.kg).replace(',', '.')) || 0;
    if (!(reps > 0)) {
      Alert.alert('Enter reps', 'Type the number of reps (or seconds) for this set first.');
      return;
    }
    // PR = better than anything logged before (needs prior history to count)
    const prevBest = Math.max(
      bestScore(logs, ex.name),
      ...sets[ex.name].filter((r, idx) => r.done && idx !== i).map((r) =>
        setScore({ kg: parseFloat(r.kg) || 0, reps: parseInt(r.reps, 10) || 0 })
      ),
      0
    );
    const hadHistory = bestScore(logs, ex.name) > 0;
    const pr = hadHistory && setScore({ kg, reps }) > prevBest;
    update(ex.name, i, { done: true, pr });
    setRestEnd(Date.now() + restSec * 1000);
  };

  const buildSession = () => {
    const out = [];
    for (const ex of exercises) {
      sets[ex.name].forEach((r) => {
        if (!r.done) return;
        out.push({
          exercise: ex.name,
          muscle: ex.muscle,
          kg: parseFloat(String(r.kg).replace(',', '.')) || 0,
          reps: parseInt(r.reps, 10) || 0,
        });
      });
    }
    return {
      id: String(Date.now()),
      date: new Date().toISOString(),
      title: workout.title,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      sets: out,
    };
  };

  const finish = async () => {
    if (doneCount === 0) {
      Alert.alert('Nothing logged', 'Tick at least one set before finishing.');
      return;
    }
    const session = buildSession();
    const prs = [];
    for (const ex of exercises) {
      if (sets[ex.name].some((r) => r.pr)) prs.push(ex.name);
    }
    setRestEnd(null);
    await onFinish(session);
    setSummary({ session, prs });
  };

  const back = () => {
    if (doneCount > 0 && !summary) {
      Alert.alert('Leave workout?', 'Your logged sets for this session will be discarded.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onBack },
      ]);
    } else onBack();
  };

  if (summary) {
    const { session, prs } = summary;
    const mins = Math.max(1, Math.round(session.durationSec / 60));
    return (
      <ScrollView style={S.screen} contentContainerStyle={S.pad}>
        <Text style={{ fontSize: 48, textAlign: 'center' }}>🎉</Text>
        <Text style={[S.h1, { textAlign: 'center' }]}>Workout complete!</Text>
        <Text style={[S.sub, { textAlign: 'center', marginBottom: 18 }]}>{session.title}</Text>
        <View style={S.card}>
          <Row k="Sets logged" v={String(session.sets.length)} />
          <Row k="Total volume" v={`${Math.round(sessionVolume(session))} kg`} />
          <Row k="Duration" v={`${mins} min`} />
        </View>
        {prs.length > 0 && (
          <View style={[S.card, { borderColor: C.accent }]}>
            <Text style={S.h2}>🏆 New personal records</Text>
            {prs.map((p) => (
              <Text key={p} style={{ color: C.text, marginBottom: 4 }}>• {p}</Text>
            ))}
          </View>
        )}
        <TouchableOpacity style={S.btn} onPress={onBack}>
          <Text style={S.btnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={back}>
          <Text style={{ color: C.accent, fontWeight: '700', marginBottom: 10 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={S.h1}>{workout.title}</Text>
        <Text style={[S.sub, { marginBottom: 12 }]}>{doneCount} / {totalSets} sets done</Text>

        <Text style={S.label}>Rest between sets</Text>
        <View style={S.row}>
          {REST_OPTIONS.map((s) => (
            <TouchableOpacity key={s} style={[S.chip, restSec === s && S.chipOn]} onPress={() => setRestSec(s)}>
              <Text style={[S.chipText, restSec === s && S.chipTextOn]}>{s >= 120 ? `${s / 60} min` : `${s}s`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {workout.blocks.map((b) => (
          <View key={b.muscle}>
            <Text style={S.h2}>{MUSCLE_LABEL[b.muscle]}</Text>
            {b.items.map((ex) => {
              const { last, sug } = info[ex.name];
              const timed = !parseRepRange(ex.reps);
              const rows = sets[ex.name];
              const allDone = rows.every((r) => r.done);
              return (
                <View key={ex.name} style={[S.card, allDone && { borderColor: C.good }]}>
                  <Text style={{ color: C.text, fontSize: 16, fontWeight: '700' }}>{ex.name}</Text>
                  <Text style={[S.sub, { marginVertical: 2 }]}>{ex.sets} sets × {ex.reps}</Text>
                  {last ? (
                    <Text style={{ color: C.sub, fontSize: 12 }}>
                      Last: {last.map((s) => (s.kg > 0 ? `${formatKg(s.kg)}×${s.reps}` : `${s.reps}`)).join(', ')}
                    </Text>
                  ) : null}
                  {sug ? <Text style={{ color: C.accent, fontSize: 12, marginBottom: 4 }}>💡 {sug.note}</Text> : null}

                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <Text style={[S.sub, { width: 40 }]}>Set</Text>
                    <Text style={[S.sub, { flex: 1 }]}>kg</Text>
                    <Text style={[S.sub, { flex: 1 }]}>{timed ? 'sec' : 'reps'}</Text>
                    <Text style={[S.sub, { width: 64, textAlign: 'center' }]}>Done</Text>
                  </View>

                  {rows.map((r, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Text style={{ color: C.text, width: 40, fontWeight: '700' }}>{i + 1}</Text>
                      <TextInput
                        style={[S.input, { flex: 1, marginBottom: 0, marginRight: 8, paddingVertical: 8 }]}
                        value={r.kg}
                        onChangeText={(t) => update(ex.name, i, { kg: t })}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="#667"
                        editable={!r.done}
                      />
                      <TextInput
                        style={[S.input, { flex: 1, marginBottom: 0, marginRight: 8, paddingVertical: 8 }]}
                        value={r.reps}
                        onChangeText={(t) => update(ex.name, i, { reps: t })}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#667"
                        editable={!r.done}
                      />
                      <TouchableOpacity
                        onPress={() => toggleSet(ex, i)}
                        style={{
                          width: 56,
                          height: 40,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: r.done ? C.good : 'transparent',
                          borderWidth: 1,
                          borderColor: r.done ? C.good : C.border,
                        }}
                      >
                        <Text style={{ color: r.done ? C.onAccent : C.sub, fontWeight: '800', fontSize: 16 }}>
                          {r.done ? (r.pr ? '🏆' : '✓') : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[S.chip, { borderColor: C.accent, alignSelf: 'flex-start', marginTop: 12 }]}
                    onPress={() => setPlaying(ex)}
                  >
                    <Text style={{ color: C.accent, fontWeight: '700' }}>▶ Watch demo</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}

        <TouchableOpacity style={S.btn} onPress={finish}>
          <Text style={S.btnText}>Finish workout</Text>
        </TouchableOpacity>
        <VideoPlayer exercise={playing} onClose={() => setPlaying(null)} />
      </ScrollView>

      <RestTimer
        endAt={restEnd}
        onAdjust={(d) => setRestEnd((e) => (e ? Math.max(Date.now(), e + d * 1000) : e))}
        onDismiss={() => setRestEnd(null)}
      />
    </View>
  );
}

function Row({ k, v }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={S.sub}>{k}</Text>
      <Text style={{ color: C.text, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}
