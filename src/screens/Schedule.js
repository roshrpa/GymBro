import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { DAY_NAMES } from '../data/splits';
import { MUSCLE_LABEL } from '../data/exercises';

export default function Schedule({ profile, plan, onOpenWorkout }) {
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.pad}>
      <Text style={S.h1}>Weekly split</Text>
      <Text style={[S.sub, { marginBottom: 18 }]}>{profile.daysPerWeek} days / week</Text>

      {order.map((wd) => {
        const w = plan.find((d) => d.weekday === wd);
        const isToday = wd === today;
        return (
          <TouchableOpacity
            key={wd}
            disabled={!w}
            onPress={() => w && onOpenWorkout(w)}
            style={[S.card, isToday && { borderColor: C.accent }, !w && { opacity: 0.55 }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{DAY_NAMES[wd]}</Text>
              {isToday && <Text style={{ color: C.accent, fontWeight: '700' }}>TODAY</Text>}
            </View>
            {w ? (
              <>
                <Text style={{ color: C.text, marginTop: 4 }}>{w.title}</Text>
                <Text style={S.sub}>{w.blocks.map((b) => MUSCLE_LABEL[b.muscle]).join(' • ')}</Text>
              </>
            ) : (
              <Text style={S.sub}>Rest</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
