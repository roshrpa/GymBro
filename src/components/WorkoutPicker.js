import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { MUSCLE_LABEL } from '../data/exercises';
import { MUSCLES } from '../utils/schedule';

// Lets the user choose what to train on a given day. Nothing is forced: any plan workout,
// any muscle combination, or a rest day can be picked.
export default function WorkoutPicker({ visible, dateLabel, plan, onPick, onClose }) {
  const [sel, setSel] = useState([]);
  const toggle = (m) => setSel((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  const close = () => {
    setSel([]);
    onClose();
  };
  const pick = (desc) => {
    setSel([]);
    onPick(desc);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={S.screen}>
        <ScrollView contentContainerStyle={[S.pad, { paddingTop: 40 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={S.h1}>Choose workout</Text>
            <TouchableOpacity onPress={close}><Text style={{ color: C.accent, fontWeight: '800', fontSize: 16 }}>Close ✕</Text></TouchableOpacity>
          </View>
          <Text style={[S.sub, { marginBottom: 16 }]}>{dateLabel}. Your upcoming days will rearrange automatically.</Text>

          <Text style={S.h2}>Pick muscles</Text>
          <View style={S.row}>
            {MUSCLES.map((m) => (
              <TouchableOpacity key={m} style={[S.chip, sel.includes(m) && S.chipOn]} onPress={() => toggle(m)}>
                <Text style={[S.chipText, sel.includes(m) && S.chipTextOn]}>{MUSCLE_LABEL[m]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[S.btn, { marginTop: 0, marginBottom: 22 }, !sel.length && { opacity: 0.4 }]}
            disabled={!sel.length}
            onPress={() => pick({ t: 'custom', muscles: sel })}
          >
            <Text style={S.btnText}>Use {sel.length ? sel.map((m) => MUSCLE_LABEL[m]).join(' + ') : 'selected muscles'}</Text>
          </TouchableOpacity>

          <Text style={S.h2}>From your plan</Text>
          {plan.map((w) => (
            <TouchableOpacity key={w.title} style={S.card} onPress={() => pick({ t: 'plan', title: w.title })}>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>{w.title}</Text>
              <Text style={S.sub}>{w.blocks.map((b) => MUSCLE_LABEL[b.muscle]).join(' • ')}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[S.h2, { marginTop: 10 }]}>Or</Text>
          <TouchableOpacity style={S.card} onPress={() => pick({ t: 'rest' })}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Rest day</Text>
            <Text style={S.sub}>Skip training; the next workouts move back a day.</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
