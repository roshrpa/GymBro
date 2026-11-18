import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loadProfile, saveProfile, loadLogs, saveLogs } from './src/storage';
import { buildPlan } from './src/data/splits';
import { applyProfileUpdate } from './src/profileModel';
import { C } from './src/theme';
import Onboarding from './src/screens/Onboarding';
import Home from './src/screens/Home';
import Schedule from './src/screens/Schedule';
import Workout from './src/screens/Workout';
import Health from './src/screens/Health';
import Diet from './src/screens/Diet';
import Calculators from './src/screens/Calculators';
import Progress from './src/screens/Progress';
import More from './src/screens/More';

const TABS = [
  { key: 'home', label: 'Today', icon: '🏠' },
  { key: 'schedule', label: 'Plan', icon: '📅' },
  { key: 'progress', label: 'Progress', icon: '📈' },
  { key: 'diet', label: 'Diet', icon: '🍽️' },
  { key: 'more', label: 'More', icon: '☰' },
];

const MAX_SESSIONS = 1000;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('home');
  const [moreScreen, setMoreScreen] = useState(null);
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    Promise.all([loadProfile(), loadLogs()]).then(([p, l]) => {
      setProfile(p);
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const plan = useMemo(() => (profile ? buildPlan(profile.daysPerWeek) : []), [profile]);

  const onSave = async (p) => {
    const full = applyProfileUpdate(profile, p);
    await saveProfile(full);
    setProfile(full);
    setEditing(false);
    setMoreScreen(null);
    setTab('home');
  };

  const onLogWeight = async (kg) => {
    const full = applyProfileUpdate(profile, { ...profile, weightKg: kg });
    await saveProfile(full);
    setProfile(full);
  };

  const onFinishWorkout = async (session) => {
    const next = [...logs, session].slice(-MAX_SESSIONS);
    setLogs(next);
    await saveLogs(next);
  };

  const changeTab = (key) => {
    setTab(key);
    if (key !== 'more') setMoreScreen(null);
  };

  const topPad = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

  let body;
  if (loading) body = <ActivityIndicator style={{ flex: 1 }} color={C.accent} />;
  else if (!profile || editing) body = <Onboarding initial={profile} onDone={onSave} />;
  else if (workout) {
    body = (
      <Workout
        key={workout.title}
        workout={workout}
        logs={logs}
        onFinish={onFinishWorkout}
        onBack={() => setWorkout(null)}
      />
    );
  } else if (tab === 'home') body = <Home profile={profile} plan={plan} logs={logs} onOpenWorkout={setWorkout} />;
  else if (tab === 'schedule') body = <Schedule profile={profile} plan={plan} onOpenWorkout={setWorkout} />;
  else if (tab === 'progress') body = <Progress profile={profile} logs={logs} onLogWeight={onLogWeight} />;
  else if (tab === 'diet') body = <Diet profile={profile} />;
  else if (moreScreen) {
    body = (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setMoreScreen(null)} style={{ padding: 14, paddingBottom: 0 }}>
          <Text style={{ color: C.accent, fontWeight: '700' }}>← More</Text>
        </TouchableOpacity>
        {moreScreen === 'calc' ? (
          <Calculators profile={profile} />
        ) : (
          <Health profile={profile} onEdit={() => setEditing(true)} />
        )}
      </View>
    );
  } else body = <More onOpen={setMoreScreen} />;

  const showTabs = !loading && profile && !editing && !workout;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, paddingTop: topPad }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>{body}</View>
      {showTabs && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card }}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.key} style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => changeTab(t.key)}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={{ color: tab === t.key ? C.accent : C.sub, fontSize: 12, fontWeight: '600' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
