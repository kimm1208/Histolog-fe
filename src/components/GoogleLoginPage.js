import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const GoogleLoginPage = ({ baseUrl, onLoginSuccess, onBack }) => {

    const handleGoogleLogin = async () => {
        try {
            const appRedirect = Linking.createURL('google-auth');
            const authUrl = `${baseUrl}/api/auth/google/initiate?appRedirect=${encodeURIComponent(appRedirect)}`;

            if (Platform.OS === 'web') {
                window.location.assign(authUrl);
                return;
            }

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                appRedirect
            );

            if (result.type === 'success') {
                const tokenMatch = result.url.match(/[?&]token=([^&]+)/);
                if (tokenMatch) {
                    onLoginSuccess(decodeURIComponent(tokenMatch[1]));
                } else {
                    Alert.alert('로그인 실패', '토큰을 받지 못했습니다. 다시 시도해주세요.');
                }
            } else if (result.type !== 'cancel') {
                Alert.alert('로그인 실패', '구글 로그인 창을 열지 못했습니다. 다시 시도해주세요.');
            }
        } catch (err) {
            console.error('Google login error:', err);
            Alert.alert('에러', '구글 로그인 창을 여는 중 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histolog</Text>
            <Text style={styles.subtitle}>구글 계정으로 시작하기</Text>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <Text style={styles.googleButtonText}>🔍  Google로 로그인</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBack}>
                <Text style={styles.backText}>← 돌아가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f4f1ea' },
    title: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#5D4037', marginBottom: 5 },
    subtitle: { fontSize: 14, textAlign: 'center', color: '#8D6E63', marginBottom: 40 },
    googleButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    googleButtonText: { color: '#5D4037', fontWeight: 'bold', fontSize: 16 },
    backText: { color: '#5D4037', textAlign: 'center', marginTop: 25, fontWeight: '500' },
});

export default GoogleLoginPage;
