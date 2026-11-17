import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loadProfile, saveProfile } from './src/storage';
import { buildPlan } from './src/data/splits';
import { C } from './src/theme';
import Onboarding from './src/screens/Onboarding';
import Home from './src/screens/Home';
import Schedule from './src/screens/Schedule';
import Workout from './src/screens/Workout';
import Health from './src/screens/Health';

const TABS = [
  { key: 'home', label: 'Today', icon: '🏠' },
  { key: 'schedule', label: 'Plan', icon: '📅' },
  { key: 'health', label: 'Health', icon: '❤️' },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('home');
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const plan = useMemo(() => (profile ? buildPlan(profile.daysPerWeek) : []), [profile]);

  const onSave = async (p) => {
    await saveProfile(p);
    setProfile(p);
    setEditing(false);
    setTab('home');
  };

  const topPad = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

  let body;
  if (loading) body = <ActivityIndicator style={{ flex: 1 }} color={C.accent} />;
  else if (!profile || editing) body = <Onboarding initial={profile} onDone={onSave} />;
  else if (workout) body = <Workout workout={workout} onBack={() => setWorkout(null)} />;
  else if (tab === 'home') body = <Home profile={profile} plan={plan} onOpenWorkout={setWorkout} />;
  else if (tab === 'schedule') body = <Schedule profile={profile} plan={plan} onOpenWorkout={setWorkout} />;
  else body = <Health profile={profile} onEdit={() => setEditing(true)} />;

  const showTabs = !loading && profile && !editing && !workout;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, paddingTop: topPad }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>{body}</View>
      {showTabs && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card }}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.key} style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => setTab(t.key)}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={{ color: tab === t.key ? C.accent : C.sub, fontSize: 12, fontWeight: '600' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
