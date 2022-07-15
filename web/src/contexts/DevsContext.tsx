import { createContext, ReactNode, useEffect, useState } from "react";

import api from '../services/api';


type devType = {
    _id: string;
    name: string;
    github_username: string,
    avatar_url: string;
    bio: string
    techs: string[];
}

type inputDevType = {
    github_username: string,
    techs: string,
    latitude: string,
    longitude: string
}

type DevsContextProviderProps = {
    children?: ReactNode
}  

type DevsContextType = { 
    devs: devType[] | [],
    findDev: (github_username: string) => Promise<inputDevType>
    addDev: (dev: inputDevType) => Promise<string>
    updateDev: (dev: inputDevType) => Promise<string>
    removeDev: (github_username: string) => Promise<string>
}
export const DevsContext = createContext({} as DevsContextType)

export function DevsContextProvider(props: DevsContextProviderProps) {
    const [devs, setDevs] = useState<devType[]>([])

    useEffect(() => { 
        return () => {
            loadDevs();
        }
    }, [])

    async function loadDevs() { 
        const result = await api.get('/api/devs')
        setDevs(result.data);
    }

    async function findDev(github_username: string) {
        const result = await api.get(`/api/devs/${github_username}`)

        return {
            github_username: result.data.github_username,
            techs: result.data.techs.join(', '),
            latitude: result.data.location.coordinates[1],
            longitude : result.data.location.coordinates[0]
        };
    }

    async function addDev(dev: inputDevType) {
        return await api.post('/api/devs', dev)
            .then(response => {
               if (response.status === 200) {
                    setDevs([...devs, response.data].sort((a: devType , b: devType) => {
                        const aName = a.name || a.github_username;
                        const bName = b.name || b.github_username;

                        return aName.localeCompare(bName)
                    }))

                    return '';
               } 
               else 
                    return 'Erro ao cadastrar o dev'
            
            })
            .catch (err => {
                return err.response.data.message ?? 'Dev não cadastrado'
            })
    }

    async function updateDev(dev: inputDevType){
        return await api.put(`api/devs/${dev.github_username}`, dev)
            .then((resDev) => {
                setDevs(
                    devs.map((d) => dev.github_username !== d.github_username 
                        ? d 
                        : {
                            _id: d._id, 
                            github_username: d.github_username,
                            ...resDev.data.dev
                        }
                ));

                return '';
            })
            .catch((err) => {
                return err.response.data.message ?? 'Erro ao atualizar o dev';
            })
    }

    async function removeDev(github_username: string) {
        return await api.delete(`api/devs/${github_username}`)
            .then(() => {
                setDevs(
                    devs.filter((dev) => dev.github_username !== github_username)                    
                )

                return '';
            })
            .catch((err) => {
                return err.response.data.message ?? 'Erro ao remover o dev';
            })
    }
    
    return (
        <DevsContext.Provider value={{devs, findDev, addDev, updateDev, removeDev}}>
            {props.children}
        </DevsContext.Provider>
    )

}