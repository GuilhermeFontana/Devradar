import React, { useEffect, useState } from "react";
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from 'react-native-maps'
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons'

import api from '../services/api'
import { connect, disconnect, subscribeToNewDevs } from '../services/socket'


type RegionType = {
    latitude: number;
    longitude: number;
    longitudeDelta: number;
    latitudeDelta: number;
}

type StackParamList = {
  Main: undefined;
  Profile: { github_username: string };
};
type Props = NativeStackScreenProps<StackParamList, 'Main'>;

type devResponseType = {
    _id: string;
    name: string;
    github_username: string,
    avatar_url: string;
    bio: string;
    techs: string[];
    location: {
        _id: string;
        coordinates: number[]
    }
}

type devType = {
    _id: string;
    name: string;
    github_username: string,
    avatar_url: string;
    bio: string;
    techs: string[];
    location: {
        latitude: number;
        longitude: number;
    }
}

function Main({navigation }: Props){
    const [ currentRegion, setcurrentRegion ] = useState<RegionType>()  
    const [ viewShow, setViewShow ] = useState(true);
    const [ devs, setDevs ] = useState<devType[]>([]);
    const [ techs, setTechs ] = useState('');

    useEffect(() => {
        async function loadInitialRegion() {
            let { granted } = await requestForegroundPermissionsAsync();
            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    distanceInterval: 50,
                    timeInterval: 60
                });

                const { latitude, longitude } = coords;
                setcurrentRegion({
                    latitude, 
                    longitude,
                    latitudeDelta: 0.4,
                    longitudeDelta: 0.4
                })
            }
        }

        loadInitialRegion();
    }, [])
    
    useEffect(() => {
        subscribeToNewDevs((dev: devResponseType) => {
            setDevs([...devs, {
                _id: dev._id,
                name: dev.name,
                github_username: dev.github_username,
                avatar_url: dev.avatar_url,
                bio: dev.bio,
                techs: dev.techs,
                location: {
                    latitude: dev.location.coordinates[1],
                    longitude: dev.location.coordinates[0]
                }
            }])
        })
    }, [devs])
    
    //#region Methods
    async function  hansleRegionChanged(region: RegionType) {
        setcurrentRegion(region);
    }

    function setupWebsocket() {
        disconnect();
         
        const distance = Math.max(currentRegion?.latitudeDelta ?? 0.4, currentRegion?.longitudeDelta ?? 0.4, 1)

        connect(currentRegion?.latitude, currentRegion?.longitude, distance, techs);
    }

    async function loadDevs() {
        const distance = Math.max(currentRegion?.latitudeDelta ?? 0.4, currentRegion?.longitudeDelta ?? 0.4, 1)

        await api.get('/api/search', { 
            params: {
                latitude: currentRegion?.latitude,
                longitude: currentRegion?.longitude,
                distance: distance > 1.2 ? distance * 10 : distance * 5,
                techs: techs
            }
        })
        .then((res) => {
            const response: devResponseType[] = res.data;
            setDevs(
                response.map((dev) => {
                    return {
                        _id: dev._id,
                        name: dev.name,
                        github_username: dev.github_username,
                        avatar_url: dev.avatar_url,
                        bio: dev.bio,
                        techs: dev.techs,
                        location: {
                            latitude: dev.location.coordinates[1],
                            longitude: dev.location.coordinates[0]
                        }
                    }
                })            
            )

            setupWebsocket();
        })
    }
    //#endregion Methods


    if (!currentRegion) 
        return null;

    return (
        <>
            <MapView 
                showsUserLocation
                toolbarEnabled
                style={style.map} 
                onPress={() => {setViewShow(!viewShow)}}
                onRegionChangeComplete={hansleRegionChanged}
                initialRegion={{
                    ...currentRegion,
                    latitudeDelta: 0.04, 
                    longitudeDelta: 0.04,
                }}
            >
                {devs.map((dev) => (
                    <Marker 
                        key={dev._id}
                        coordinate={{ 
                            latitude: dev.location.latitude, 
                            longitude: dev.location.longitude
                        }}
                        onPress={() => {setViewShow(false)}}
                    >
                        <Image source={{ uri: dev.avatar_url }} style={style.avatar}/>
                        <Callout onPress={() => {
                            navigation.navigate("Profile", { github_username: dev.github_username })
                        }}>
                            <View style={style.callout} >
                                <Text style={style.devName}>{dev.name ?? dev.github_username}</Text>
                                <Text style={style.devBio}>{dev.bio}</Text>
                                <Text style={style.devTechs}>{dev.techs.join(', ')}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
            {viewShow &&
            <View style={style.searchForm}>
                <TextInput 
                    style={style.techsInput}
                    placeholder="Buscar devs por techs"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={techs}
                    onChangeText={setTechs}
                />
                <TouchableOpacity style={style.loadButton} onPress={loadDevs}>
                    <MaterialIcons name="my-location" size={20} color="#fff"/>
                </TouchableOpacity>
            </View>}
        </>
    );
}

const style = StyleSheet.create({
    map: {
        flex: 1
    },

    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: "#fff"
    },
    callout: {
        width: 260
    },

    devName: {
        fontWeight: "bold",
        fontSize: 16
    },

    devBio: {
        color: "#666",
        marginTop: 5
    },

    devTechs: {
        marginTop: 5
    },

    searchForm: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: "row",
        opacity: 1
    },

    techsInput: {
        flex: 1,
        height: 50,
        backgroundColor: "#fff",
        color: "#333",
        borderRadius: 50,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 3
    },

    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: "#8e4fff",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 15
    }
})

export default Main