import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '../theme';
import { videoUrl } from '../data/exercises';

// Plays the exercise demo inside the app (no external app is opened).
// We load YouTube's mobile watch page instead of the embed player, because many videos
// disable embedding (error 152) but still play on the normal watch page.
export default function VideoPlayer({ exercise, onClose }) {
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => setSearchMode(false), [exercise]);
  if (!exercise) return null;

  const showVideo = !!exercise.video && !searchMode;
  const uri = showVideo ? `https://m.youtube.com/watch?v=${exercise.video}` : videoUrl(exercise.name);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
          <Text style={{ color: C.text, fontSize: 17, fontWeight: '700', flex: 1 }} numberOfLines={1}>
            {exercise.name}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: C.accent, fontWeight: '700', fontSize: 16 }}>Close ✕</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <WebView
            key={uri}
            source={{ uri }}
            originWhitelist={['https://*', 'http://*']}
            // keep everything inside the app: block intent:// and app-store redirects
            onShouldStartLoadWithRequest={(req) => /^https?:\/\//i.test(req.url)}
            setSupportMultipleWindows={false}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => <ActivityIndicator style={{ flex: 1 }} color={C.accent} />}
          />
        </View>

        {showVideo && (
          <TouchableOpacity style={{ padding: 14, alignItems: 'center' }} onPress={() => setSearchMode(true)}>
            <Text style={{ color: C.sub }}>Video not working? Browse more demos →</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
}
