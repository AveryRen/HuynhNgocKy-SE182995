import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, TouchableOpacity, Text, StyleSheet} from 'react-native';
import 'react-native-gesture-handler';

import ListScreen from './screens/ListScreen';
import DetailScreen from './screens/DetailScreen';
import FavoritesScreen from './screens/FavoritesScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="List"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="List"
          component={ListScreen}
          options={({navigation}) => ({
            title: 'Sản phẩm',
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Favorites')}>
                <Text style={styles.headerButtonText}>⭐ Yêu thích</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{title: 'Chi tiết sản phẩm'}}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{title: 'Yêu thích'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default App;

