import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Home Screen!</Text>
            <Button title="Go to Menu" onPress={() => navigation.navigate('MenuScreen')} />
            <View style={styles.spacer} />
            <Button title="Open System" onPress={() => navigation.navigate('SystemScreen')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#05070d' },
    title: { color: '#d8ecf7', fontSize: 18, marginBottom: 16 },
    spacer: { height: 12 },
});

export default HomeScreen;
