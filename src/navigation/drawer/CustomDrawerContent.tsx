// CustomDrawerContent.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
    const user = 'Ayrton'; // o venir de props o contexto

    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
                    style={styles.avatar}
                />
                <Text style={styles.welcome}>Bienvenido {user}</Text>
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    welcome: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
