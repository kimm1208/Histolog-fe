import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MessageItem = ({ role, content }) => {
    const isUser = role === 'user'; // 사용자인지 확인

    return (
        // 1. row-reverse를 사용하여 아바타와 내용을 좌우 반전시킵니다.
        <View style={[styles.messageRow, isUser && { flexDirection: 'row-reverse' }]}>
            <View style={[
                styles.avatarContainer,
                // 2. 방향에 따라 마진(여백) 위치를 조정합니다.
                isUser ? { marginLeft: 12, marginRight: 0 } : { marginRight: 12 }
            ]}>
                <Text style={styles.avatarText}>{isUser ? 'U' : 'H'}</Text>
            </View>

            {/* 3. 사용자의 경우 텍스트 내용들을 우측으로 밀어냅니다. */}
            <View style={[styles.contentContainer, isUser && { alignItems: 'flex-end' }]}>
                <Text style={styles.roleLabel}>{isUser ? '나' : 'Histolog'}</Text>
                <Text style={[
                    styles.messageText,
                    isUser && { textAlign: 'right' } // 4. 텍스트 자체도 우측 정렬
                ]}>
                    {content}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageRow: { flexDirection: 'row', marginBottom: 28 },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2
    },
    avatarText: { fontSize: 14, fontWeight: 'bold', color: '#5D4037' },
    contentContainer: { flex: 1 },
    roleLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
    messageText: { fontSize: 16, lineHeight: 24, color: '#333333' },
});