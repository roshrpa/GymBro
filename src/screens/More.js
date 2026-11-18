import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';

export default function More({ onOpen, email, onLogout }) {
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
      <View style={{ height: 12 }} />
      {email ? <Text style={[S.sub, { marginBottom: 8 }]}>Signed in as {email}</Text> : null}
      <TouchableOpacity style={[S.card, { alignItems: 'center' }]} onPress={onLogout}>
        <Text style={{ color: '#ff453a', fontWeight: '800', fontSize: 16 }}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
