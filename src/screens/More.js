import React, { useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { BUILD, VERSION } from '../buildInfo';

export default function More({ onOpen, email, onLogout, update, onCheckUpdate }) {
  const [checking, setChecking] = useState(false);
  const check = async () => {
    setChecking(true);
    await onCheckUpdate();
    setChecking(false);
  };
  const msg = !update ? null : update.error ? update.error : update.available ? `New build ${update.build} is available.` : 'You have the latest version.';
  const items = [
    { key: 'calc', icon: '🧮', title: 'Calculators', sub: 'BMI, ideal weight, calories, macros, body fat' },
    { key: 'health', icon: '❤️', title: 'Health & profile', sub: 'Your stats, nutrition targets, edit profile' },
  ];
  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>More</Text>
      <View style={{ height: 12 }} />
      {items.map((it) => (
        <TouchableOpacity key={it.key} style={[S.card, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => onOpen(it.key)}>
          <Text style={{ fontSize: 28, marginRight: 14 }}>{it.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{it.title}</Text>
            <Text style={S.sub}>{it.sub}</Text>
          </View>
          <Text style={{ color: C.sub, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      ))}
      <View style={[S.card, { marginTop: 8 }]}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>App version {VERSION} (build {BUILD})</Text>
        {msg ? <Text style={[S.sub, { marginTop: 4 }]}>{msg}</Text> : null}
        {update && update.available && update.url ? (
          <TouchableOpacity style={S.btn} onPress={() => Linking.openURL(update.url)}>
            <Text style={S.btnText}>Download update</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[S.btn, { backgroundColor: C.card, borderWidth: 1, borderColor: C.accent }]} onPress={check} disabled={checking}>
            {checking ? <ActivityIndicator color={C.accent} /> : <Text style={[S.btnText, { color: C.accent }]}>Check for updates</Text>}
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 12 }} />
      {email ? <Text style={[S.sub, { marginBottom: 8 }]}>Signed in as {email}</Text> : null}
      <TouchableOpacity style={[S.card, { alignItems: 'center' }]} onPress={onLogout}>
        <Text style={{ color: '#ff453a', fontWeight: '800', fontSize: 16 }}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
