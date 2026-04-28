import React, { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

// src/components 폴더에 저장될 화면들을 불러옵니다.
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';
import ChatScreen from './src/components/ChatScreen';

// 실제 백엔드 서버 주소를 입력하세요.
const BASE_URL = 'https://histolog.app';


export default function App() {
  const [screen, setScreen] = useState('login'); // 'login', 'signup', 'chat', 'googleLogin'
  const [token, setToken] = useState(''); // 로그인 후 받은 access_token 저장
  const url = Linking.useURL();

  // 앱 시작 시 저장된 토큰 복원
  useEffect(() => {
    AsyncStorage.getItem('session').then(savedToken => {
      if (savedToken) {
        setToken(savedToken);
        setScreen('chat');
      }
    });
  }, []);

  // 로그인 성공 시 호출
  const handleLoginSuccess = async (accessToken) => {
    await AsyncStorage.setItem('session', accessToken);
    setToken(accessToken);
    setScreen('chat');
  };

  useEffect(() => {
    if (!url) {
      return;
    }

    const { queryParams } = Linking.parse(url);
    const accessToken = queryParams?.token;

    if (!accessToken || typeof accessToken !== 'string') {
      return;
    }

    handleLoginSuccess(decodeURIComponent(accessToken));

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/');
    }
  }, [url]);

  if (screen === 'signup') {
    return (
      <SignupScreen
        baseUrl={BASE_URL}
        onSignupSuccess={() => setScreen('login')}
        onBackToLogin={() => setScreen('login')}
      />
    );
  }

  if (screen === 'chat') {
    return (
      <ChatScreen
        baseUrl={BASE_URL}
        token={token}
      />
    );
  }

  return (
    <LoginScreen
      baseUrl={BASE_URL}
      onLoginSuccess={handleLoginSuccess}
      onGoToSignup={() => setScreen('signup')}
    />
  );
}
