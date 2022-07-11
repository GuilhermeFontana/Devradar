import React from "react";
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from "@react-navigation/native-stack";


type StackParamList = {
    Main: undefined;
    Profile: { github_username: string };
  };
type Props = NativeStackScreenProps<StackParamList, 'Profile'>;


function Profile({ route }: Props){
    const { github_username } = route.params

    return <WebView  
        style={{flex: 1}}
        source={{ uri:`https://github.com/${github_username}` }}        
    />
}

export default Profile