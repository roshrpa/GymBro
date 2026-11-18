import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { FOOD_DB, ACTIVITIES } from '../data/foodDb';
import { dailyCalories } from '../utils/health';
import {
  dayKey, shiftDay, entriesFor, foodTotals, gymBurn, otherBurn, dayBalance, activityKcal, recentFoods, round,
} from '../utils/diary';

const num = (s) => {
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function prettyDay(key) {
  const today = dayKey();
  if (key === today) return 'Today';
  if (key === shiftDay(today, -1)) return 'Yesterday';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toDateString().slice(0, 10);
}

function Stat({ label, value, color }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: color || C.text, fontSize: 22, fontWeight: '900' }}>{value}</Text>
      <Text style={[S.sub, { fontSize: 12 }]}>{label}</Text>
    </View>
  );
}

export default function Diary({ profile, logs, entries, onChange }) {
  const [day, setDay] = useState(dayKey());
  const [mode, setMode] = useState(null); // null | 'food' | 'activity'
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [qty, setQty] = useState('1');
  const [customKcal, setCustomKcal] = useState('');
  const [mins, setMins] = useState('30');
  const [actPicked, setActPicked] = useState(null);

  const target = dailyCalories(profile).target;
  const foods = entriesFor(entries, day, 'food');
  const acts = entriesFor(entries, day, 'activity');
  const eaten = foodTotals(entries, day);
  const gym = gymBurn(logs, profile.weightKg, day);
  const other = otherBurn(entries, day);
  const bal = dayBalance({ target, eaten: eaten.kcal, gym, other });
  const pct = Math.min(1, eaten.kcal / target);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FOOD_DB.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);
  const recents = useMemo(() => recentFoods(entries), [entries]);

  const reset = () => {
    setMode(null); setQuery(''); setPicked(null); setQty('1'); setCustomKcal(''); setActPicked(null); setMins('30');
  };
  const add = (e) => onChange([...entries, { id: uid(), date: day, ts: Date.now(), ...e }]);
  const remove = (id) => onChange(entries.filter((e) => e.id !== id));

  const addFood = () => {
    const q = num(qty);
    if (!q) return;
    if (picked.custom) {
      const k = num(customKcal);
      if (!k) return;
      add({ kind: 'food', name: picked.name, serving: 'serving', qty: q, kcal: round(k * q), protein: 0 });
    } else {
      add({ kind: 'food', name: picked.name, serving: picked.serving, qty: q, kcal: round(picked.kcal * q), protein: round(picked.protein * q) });
    }
    reset();
  };
  const quickAdd = (e) =>
    add({ kind: 'food', name: e.name, serving: e.serving, qty: e.qty, kcal: e.kcal, protein: e.protein || 0 });

  const addActivity = () => {
    const m = num(mins);
    if (!actPicked || !m) return;
    add({ kind: 'activity', name: actPicked.name, minutes: m, kcal: activityKcal(profile.weightKg, actPicked.met, m) });
    reset();
  };

  const statusColor = bal.over ? '#ff453a' : C.accent;

  return (
    <KeyboardAvoidingView style={S.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={S.pad} keyboardShouldPersistTaps="handled">
        <Text style={S.h1}>Diary</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setDay(shiftDay(day, -1))}><Text style={{ color: C.accent, fontSize: 28, padding: 6 }}>‹</Text></TouchableOpacity>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>{prettyDay(day)}</Text>
          <TouchableOpacity onPress={() => day < dayKey() && setDay(shiftDay(day, 1))}>
            <Text style={{ color: day < dayKey() ? C.accent : C.border, fontSize: 28, padding: 6 }}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={S.card}>
          <View style={{ flexDirection: 'row' }}>
            <Stat label="Eaten" value={eaten.kcal} />
            <Stat label="Target" value={target} />
            <Stat label={bal.over ? 'Over by' : 'Left'} value={Math.abs(bal.remaining)} color={statusColor} />
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: C.border, marginTop: 14, overflow: 'hidden' }}>
            <View style={{ width: `${pct * 100}%`, height: 10, backgroundColor: statusColor }} />
          </View>
          <Text style={{ color: statusColor, fontWeight: '800', marginTop: 10 }}>
            {bal.over
              ? `You are ${Math.abs(bal.remaining)} kcal over your target today.`
              : `${bal.remaining} kcal still available today.`}
          </Text>
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 12 }} />
          <View style={{ flexDirection: 'row' }}>
            <Stat label="Gym workout" value={`-${gym}`} />
            <Stat label="Other activity" value={`-${other}`} />
            <Stat label="Net (eaten - burned)" value={bal.net} />
          </View>
          <Text style={[S.sub, { marginTop: 10, fontSize: 12 }]}>
            Protein today: {eaten.protein} g. Your target already includes normal training days, so "Left" compares food to your target; burned calories are shown so you can see the net.
          </Text>
        </View>

        {/* Food */}
        <Text style={S.h2}>Food</Text>
        {foods.length === 0 && <Text style={[S.sub, { marginBottom: 10 }]}>Nothing logged yet.</Text>}
        {foods.map((e) => (
          <View key={e.id} style={[S.card, { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '700' }}>{e.name}</Text>
              <Text style={S.sub}>{e.qty} × {e.serving}</Text>
            </View>
            <Text style={{ color: C.accent, fontWeight: '800', marginRight: 12 }}>{e.kcal} kcal</Text>
            <TouchableOpacity onPress={() => remove(e.id)}><Text style={{ color: C.sub, fontSize: 18 }}>✕</Text></TouchableOpacity>
          </View>
        ))}

        {mode !== 'food' && (
          <TouchableOpacity style={S.btn} onPress={() => { reset(); setMode('food'); }}>
            <Text style={S.btnText}>+ Add food</Text>
          </TouchableOpacity>
        )}

        {mode === 'food' && (
          <View style={S.card}>
            {!picked ? (
              <>
                <TextInput style={S.input} value={query} onChangeText={setQuery} placeholder="Search food: chapati, rice, egg..." placeholderTextColor="#667" autoFocus />
                {results.map((f) => (
                  <TouchableOpacity key={f.id} onPress={() => setPicked(f)} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                    <Text style={{ color: C.text, fontWeight: '600' }}>{f.name}</Text>
                    <Text style={S.sub}>{f.serving} • {f.kcal} kcal</Text>
                  </TouchableOpacity>
                ))}
                {query.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={() => setPicked({ custom: true, name: query.trim(), serving: 'serving', kcal: 0, protein: 0 })}
                    style={{ paddingVertical: 12 }}
                  >
                    <Text style={{ color: C.accent, fontWeight: '700' }}>Can't find it? Add "{query.trim()}" with your own calories</Text>
                  </TouchableOpacity>
                )}
                {!query.trim() && recents.length > 0 && (
                  <>
                    <Text style={[S.label, { marginTop: 4 }]}>Recent (tap to add again)</Text>
                    <View style={S.row}>
                      {recents.map((e) => (
                        <TouchableOpacity key={e.name} style={S.chip} onPress={() => { quickAdd(e); reset(); }}>
                          <Text style={S.chipText}>{e.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            ) : (
              <>
                <Text style={{ color: C.text, fontWeight: '800', fontSize: 17 }}>{picked.name}</Text>
                {!picked.custom && <Text style={[S.sub, { marginBottom: 10 }]}>1 serving = {picked.serving} • {picked.kcal} kcal</Text>}
                {picked.custom && (
                  <>
                    <Text style={[S.label, { marginTop: 10 }]}>Calories per serving</Text>
                    <TextInput style={S.input} value={customKcal} onChangeText={setCustomKcal} keyboardType="numeric" placeholder="kcal" placeholderTextColor="#667" />
                  </>
                )}
                <Text style={S.label}>How many servings?</Text>
                <TextInput style={S.input} value={qty} onChangeText={setQty} keyboardType="decimal-pad" />
                <Text style={{ color: C.accent, fontWeight: '800', marginBottom: 8 }}>
                  = {round((picked.custom ? num(customKcal) : picked.kcal) * num(qty))} kcal
                </Text>
                <TouchableOpacity style={S.btn} onPress={addFood}><Text style={S.btnText}>Add to {prettyDay(day)}</Text></TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={reset} style={{ alignItems: 'center', paddingTop: 14 }}><Text style={S.sub}>Cancel</Text></TouchableOpacity>
          </View>
        )}

        {/* Activity */}
        <Text style={[S.h2, { marginTop: 22 }]}>Workouts & activity</Text>
        {gym > 0 && (
          <View style={[S.card, { paddingVertical: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }]}>
            <View>
              <Text style={{ color: C.text, fontWeight: '700' }}>Gym workout{logs.filter((l) => dayKey(new Date(l.date)) === day).length > 1 ? 's' : ''}</Text>
              <Text style={S.sub}>from your logged sessions</Text>
            </View>
            <Text style={{ color: C.accent, fontWeight: '800' }}>-{gym} kcal</Text>
          </View>
        )}
        {acts.map((e) => (
          <View key={e.id} style={[S.card, { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '700' }}>{e.name}</Text>
              <Text style={S.sub}>{e.minutes} min</Text>
            </View>
            <Text style={{ color: C.accent, fontWeight: '800', marginRight: 12 }}>-{e.kcal} kcal</Text>
            <TouchableOpacity onPress={() => remove(e.id)}><Text style={{ color: C.sub, fontSize: 18 }}>✕</Text></TouchableOpacity>
          </View>
        ))}
        {gym === 0 && acts.length === 0 && <Text style={[S.sub, { marginBottom: 10 }]}>No workout yet. Gym sessions you finish are counted automatically.</Text>}

        {mode !== 'activity' && (
          <TouchableOpacity style={[S.btn, { backgroundColor: C.card, borderWidth: 1, borderColor: C.accent }]} onPress={() => { reset(); setMode('activity'); }}>
            <Text style={[S.btnText, { color: C.accent }]}>+ Add other activity</Text>
          </TouchableOpacity>
        )}
        {mode === 'activity' && (
          <View style={S.card}>
            <View style={S.row}>
              {ACTIVITIES.map((a) => (
                <TouchableOpacity key={a.name} style={[S.chip, actPicked && actPicked.name === a.name && S.chipOn]} onPress={() => setActPicked(a)}>
                  <Text style={[S.chipText, actPicked && actPicked.name === a.name && S.chipTextOn]}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={S.label}>Minutes</Text>
            <TextInput style={S.input} value={mins} onChangeText={setMins} keyboardType="numeric" />
            {actPicked && (
              <Text style={{ color: C.accent, fontWeight: '800', marginBottom: 8 }}>
                about {activityKcal(profile.weightKg, actPicked.met, num(mins))} kcal burned
              </Text>
            )}
            <TouchableOpacity style={[S.btn, !actPicked && { opacity: 0.5 }]} onPress={addActivity} disabled={!actPicked}>
              <Text style={S.btnText}>Add activity</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={reset} style={{ alignItems: 'center', paddingTop: 14 }}><Text style={S.sub}>Cancel</Text></TouchableOpacity>
          </View>
        )}
        <Text style={[S.sub, { marginTop: 14, fontSize: 12 }]}>
          Calories are approximate averages (home-cooked portions vary). Burn estimates use MET values and your body weight.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
