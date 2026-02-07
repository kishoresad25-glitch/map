import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to the Home Screen!</Text>
            <Button title="Go to Menu" onPress={() => navigation.navigate('MenuScreen')} />
        </View>
    );
};

export default HomeScreen;