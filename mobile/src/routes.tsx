import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Radar from './pages/Radar';
import Profile from './pages/Profile';


type StackParamList = {
  Radar: undefined;
  Profile: { github_username: string };
};


const Stack = createNativeStackNavigator<StackParamList>();

function Routes() {
    return (
    <NavigationContainer >
      <Stack.Navigator initialRouteName='Radar' screenOptions={{
          headerStyle: {
            backgroundColor: '#7d40e7',
          },
          headerBackTitleVisible: false,
          headerTintColor: '#fff',
          headerTitle: ''
        }}>
          <Stack.Screen name="Radar" component={Radar} options={{headerShown: false}}/>
          <Stack.Screen name="Profile" component={Profile} options={{headerTitle: 'Perfil no GitHub'}}/>
      </Stack.Navigator>
    </NavigationContainer>

  );
}

export default Routes;