import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, Vibration, View } from 'react-native';
import { C } from '../theme';

// Bottom bar that counts down to `endAt` (ms timestamp). Uses the clock, not ticks, so it stays
// accurate if the app is briefly in the background.
export default function RestTimer({ endAt, onAdjust, onDismiss }) {
  const [now, setNow] = useState(Date.now());
  const buzzed = useRef(false);

  useEffect(() => {
    if (!endAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endAt]);

  const left = endAt ? Math.max(0, Math.ceil((endAt - now) / 1000)) : 0;

  useEffect(() => {
    if (!endAt) return;
    if (left > 0) {
      buzzed.current = false;
    } else if (!buzzed.current) {
      buzzed.current = true;
      Vibration.vibrate([0, 400, 200, 400]);
    }
  }, [left, endAt]);

  if (!endAt) return null;

  const mm = String(Math.floor(left / 60));
  const ss = String(left % 60).padStart(2, '0');
  const over = left === 0;

  const Btn = ({ label, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: C.onAccent }}
    >
      <Text style={{ color: C.accent, fontWeight: '800' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        backgroundColor: C.accent,
        borderTopWidth: 1,
        borderTopColor: C.accent,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View>
        <Text style={{ color: C.onAccent, fontSize: 12, fontWeight: '700' }}>{over ? 'REST OVER' : 'REST'}</Text>
        <Text style={{ color: C.onAccent, fontSize: 30, fontWeight: '900' }}>
          {over ? 'Go! 💪' : `${mm}:${ss}`}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {!over && <Btn label="-15s" onPress={() => onAdjust(-15)} />}
        {!over && <Btn label="+15s" onPress={() => onAdjust(15)} />}
        <Btn label={over ? 'Dismiss' : 'Skip'} onPress={onDismiss} />
      </View>
    </View>
  );
}
