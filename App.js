import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loadProfile, saveProfile, loadLogs, saveLogs, loadDiary, saveDiary, setStorageUser } from './src/storage';
import { watchAuth, signOut } from './src/auth';
import Auth from './src/screens/Auth';
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
import Diary from './src/screens/Diary';
import { pruneDiary } from './src/utils/diary';
import { changeWorkout } from './src/utils/schedule';
import { checkForUpdate } from './src/utils/update';
import { BUILD } from './src/buildInfo';
import More from './src/screens/More';

const TABS = [
  { key: 'home', label: 'Today', icon: '🏠' },
  { key: 'schedule', label: 'Plan', icon: '📅' },
  { key: 'diary', label: 'Diary', icon: '🍴' },
  { key: 'progress', label: 'Progress', icon: '📈' },
  { key: 'diet', label: 'Diet', icon: '🍽️' },
  { key: 'more', label: 'More', icon: '☰' },
];

const MAX_SESSIONS = 1000;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [diary, setDiary] = useState([]);
  const [update, setUpdate] = useState(null); // { available, build, url } | { error }
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('home');
  const [moreScreen, setMoreScreen] = useState(null);
  const [workout, setWorkout] = useState(null);

  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out

  useEffect(() => watchAuth((u) => setUser(u || null)), []);

  const runUpdateCheck = async () => {
    const r = await checkForUpdate(BUILD);
    setUpdate(r);
    return r;
  };
  useEffect(() => {
    runUpdateCheck();
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    setProfile(null);
    setLogs([]);
    setDiary([]);
    setWorkout(null);
    setEditing(false);
    setTab('home');
    setMoreScreen(null);
    if (!user) {
      setStorageUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setStorageUser(user.uid);
    Promise.all([loadProfile(), loadLogs(), loadDiary()]).then(([p, l, d]) => {
      setProfile(p);
      setLogs(l);
      setDiary(d);
      setLoading(false);
    });
  }, [user]);

  const plan = useMemo(() => (profile ? buildPlan(profile.daysPerWeek) : []), [profile]);

  const onSave = async (p) => {
    const keep = profile && profile.daysPerWeek === p.daysPerWeek ? profile.overrides : {}; // new split -> old changes no longer apply
    const full = { ...applyProfileUpdate(profile, { ...p, overrides: keep || {} }), email: user ? user.email : undefined };
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

  const onChangeDay = async (key, desc) => {
    const full = applyProfileUpdate(profile, { ...profile, overrides: changeWorkout(plan, profile.overrides || {}, key, desc) });
    await saveProfile(full);
    setProfile(full);
  };

  const onResetPlan = async () => {
    const full = applyProfileUpdate(profile, { ...profile, overrides: {} });
    await saveProfile(full);
    setProfile(full);
  };

  const onChangeDiary = async (next) => {
    const pruned = pruneDiary(next);
    setDiary(pruned);
    await saveDiary(pruned);
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
  if (user === undefined || (user && loading)) body = <ActivityIndicator style={{ flex: 1 }} color={C.accent} />;
  else if (!user) body = <Auth />;
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
  } else if (tab === 'home') body = <Home profile={profile} plan={plan} logs={logs} onOpenWorkout={setWorkout} update={update} onChangeDay={onChangeDay} entries={diary} />;
  else if (tab === 'schedule') body = <Schedule profile={profile} plan={plan} onOpenWorkout={setWorkout} onChangeDay={onChangeDay} onResetPlan={onResetPlan} entries={diary} />;
  else if (tab === 'diary') body = <Diary profile={profile} logs={logs} entries={diary} onChange={onChangeDiary} />;
  else if (tab === 'progress') body = <Progress profile={profile} logs={logs} onLogWeight={onLogWeight} entries={diary} />;
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
  } else body = <More onOpen={setMoreScreen} email={user && user.email} onLogout={signOut} update={update} onCheckUpdate={runUpdateCheck} />;

  const showTabs = !!user && !loading && profile && !editing && !workout;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, paddingTop: topPad }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>{body}</View>
      {showTabs && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: '#111114' }}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.key} style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => changeTab(t.key)}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={{ color: tab === t.key ? C.accent : C.sub, fontSize: 12, fontWeight: tab === t.key ? '800' : '600' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
