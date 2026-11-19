import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { S, C } from '../theme';
import { signIn, signUp, resetPassword, friendlyError } from '../auth';
import { googleEnabled, signInWithGoogle, googleErrorMessage } from '../googleAuth';

export default function Auth() {
  const [mode, setMode] = useState('login'); // login | signup | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const go = (m) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  const submit = async () => {
    setError('');
    setInfo('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (mode !== 'reset' && password.length < 6) return setError('Password must be at least 6 characters.');
    if (mode === 'signup' && password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      if (mode === 'login') await signIn(email, password);
      else if (mode === 'signup') await signUp(email, password);
      else {
        await resetPassword(email);
        setInfo('Reset link sent. Check your email (and spam folder).');
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(googleErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password';

  return (
    <KeyboardAvoidingView style={S.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[S.pad, { paddingTop: 70 }]} keyboardShouldPersistTaps="handled">
        <Text style={{ color: C.accent, fontSize: 44, fontWeight: '900', letterSpacing: 1 }}>GYMBRO</Text>
        <Text style={[S.sub, { marginBottom: 28 }]}>Train smart. Track everything.</Text>
        <Text style={S.h1}>{title}</Text>
        <View style={{ height: 14 }} />

        <Text style={S.label}>Email</Text>
        <TextInput
          style={S.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#667"
        />
        {mode !== 'reset' && (
          <>
            <Text style={S.label}>Password</Text>
            <TextInput
              style={S.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="At least 6 characters"
              placeholderTextColor="#667"
            />
          </>
        )}
        {mode === 'signup' && (
          <>
            <Text style={S.label}>Confirm password</Text>
            <TextInput style={S.input} value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" placeholder="Repeat password" placeholderTextColor="#667" />
          </>
        )}

        {error ? <Text style={{ color: '#ff453a', marginBottom: 8 }}>{error}</Text> : null}
        {info ? <Text style={{ color: C.accent, marginBottom: 8 }}>{info}</Text> : null}

        <TouchableOpacity style={[S.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color={C.onAccent} /> : <Text style={S.btnText}>{mode === 'login' ? 'Log in' : mode === 'signup' ? 'Sign up' : 'Send reset link'}</Text>}
        </TouchableOpacity>

        {googleEnabled && mode !== 'reset' && (
          <>
            <Text style={[S.sub, { textAlign: 'center', marginVertical: 14 }]}>or</Text>
            <TouchableOpacity
              style={[S.btn, { marginTop: 0, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }, busy && { opacity: 0.6 }]}
              onPress={google}
              disabled={busy}
            >
              <Text style={[S.btnText, { color: C.text }]}>Continue with Google</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: 22, gap: 14, alignItems: 'center' }}>
          {mode === 'login' && (
            <>
              <TouchableOpacity onPress={() => go('reset')}><Text style={S.sub}>Forgot password?</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => go('signup')}><Text style={{ color: C.accent, fontWeight: '700' }}>New here? Create an account</Text></TouchableOpacity>
            </>
          )}
          {mode === 'signup' && (
            <TouchableOpacity onPress={() => go('login')}><Text style={{ color: C.accent, fontWeight: '700' }}>Already have an account? Log in</Text></TouchableOpacity>
          )}
          {mode === 'reset' && (
            <TouchableOpacity onPress={() => go('login')}><Text style={{ color: C.accent, fontWeight: '700' }}>← Back to log in</Text></TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
