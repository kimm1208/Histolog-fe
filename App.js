import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';

// API 베이스 URL (백엔드 팀원이 알려준 주소로 수정하세요)
const BASE_URL = 'https://api.histolog.com';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [sessionId, setSessionId] = useState('');

  // 로그인 정보 상태
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 채팅 메시지 상태
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. 로그인 (POST /api/auth/login) 
  const handleLogin = async () => {
    if (!username || !password) return Alert.alert("입력 확인", "아이디와 비밀번호를 입력해주세요.");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) // 명세서 규격 
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.access_token); // 명세서 res.body 규격 
        setIsLoggedIn(true);
        startNewSession(data.access_token); // 로그인 성공 후 세션 생성
      } else {
        Alert.alert("로그인 실패", data.message || "정보가 일치하지 않습니다.");
      }
    } catch (err) {
      Alert.alert("에러", "서버와 통신할 수 없습니다.");
    }
  };

  // 2. 새 대화 세션 시작 (POST /api/chat/sessions) 
  const startNewSession = async (accessToken) => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setSessionId(data.session); // 명세서 res.body: { session: "string" } 
    } catch (err) {
      console.error("세션 생성 실패", err);
    }
  };

  // 3. 메시지 전송 (POST /api/chat/sessions/{sessionId}/messages) [cite: 9]
  const sendMessage = async () => {
    if (!inputText || !sessionId) return;

    const userMsg = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentInput }) // 명세서 req.body 규격 [cite: 9]
      });
      const data = await res.json();

      // 명세서 규격: res.body { event: "...", data: "내용" } [cite: 9]
      setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
    } catch (err) {
      Alert.alert("에러", "메시지 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 화면 렌더링 ---

  if (!isLoggedIn) {
    // 로그인 화면
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authBox}>
          <Text style={styles.title}>Histolog</Text>
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 채팅 화면
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={item.role === 'user' ? styles.userText : styles.botText}>{item.content}</Text>
          </View>
        )}
      />
      {loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
      <View style={styles.inputArea}>
        <TextInput style={styles.chatInput} value={inputText} onChangeText={setInputText} placeholder="역사학자에게 질문하기..." />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.buttonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea' },
  authBox: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#5d4037' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#5d4037', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  // 채팅 스타일
  bubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#5d4037' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, height: 45 },
  sendBtn: { marginLeft: 10, backgroundColor: '#5d4037', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' }
});