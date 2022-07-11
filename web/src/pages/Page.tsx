import { FormEvent, useEffect, useState } from 'react';

import DevItem from '../components/DevItem';

import { useDevs } from '../hooks/useDevs'

import '../styles/page.scss'
import toast, { Toaster } from 'react-hot-toast';


export function Page() {
  const {devs, findDev, updateDev, addDev } = useDevs();

  const [github_username, setGitHubUsername] = useState('');
  const [techs, setTechs] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [updating, setUpdating] = useState(false);

  useEffect(() => { 
    getCurrentPosition();
  }, [])

  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          setLatitude(latitude.toString());
          setLongitude(longitude.toString());
        },
        (err) => { 
          console.log(err)
          toast.error('Geolocalização não encontrada')
        },
        {
          timeout: 30000
        }
    )
}

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    if (updating) {
      const result = await updateDev({ 
        github_username,
        techs,
        latitude,
        longitude
      })
  
      if (result === '') {
        toast.success('Dev atualizado')

        setGitHubUsername('');
        setTechs('');
        setUpdating(false);
  
        getCurrentPosition();
      }
      else {
        toast.error(result, {
          duration: 2000
        })
      };    
    }
    else {
      const result = await addDev({ 
        github_username,
        techs,
        latitude,
        longitude
      })
  
      if (result === '') {
        toast.success('Dev cadastrado')
        
        setGitHubUsername('');
        setTechs('');
  
        getCurrentPosition();
      }
      else {
        toast.error(result, {
          duration: 2000
        })
      };    
    }
  }

  async function handleCancel() {
    setUpdating(false)
    setGitHubUsername('')
    setTechs('');

    getCurrentPosition();
  }

  async function handleUpdateDev (github_username: string) {
    setUpdating(true);
    
    const dev = await findDev(github_username);

    setGitHubUsername(dev.github_username);
    setTechs(dev.techs);
    setLatitude(dev.latitude)
    setLongitude(dev.longitude);
  }

  return (
    <div id="app">
      <aside>
        <strong>Cadastrar</strong>
        <form onSubmit={handleSubmit}>
          <div className="input-block">
            <label htmlFor="github_username">Usuário do GitHub</label>
            <input 
              id="github_username" 
              name="github_username" 
              value={github_username}
              onChange={(e) => setGitHubUsername(e.target.value)}
              required 
              disabled={updating}
            />
          </div>

          <div className="input-block">
            <label htmlFor="techs">Tecnologias</label>
            <input 
              id="techs" 
              name="techs" 
              value={techs}
              onChange={(e) => setTechs(e.target.value)}
              required 
            />
          </div>  

          <div className="input-group">
            <div className="input-block">
              <label htmlFor="latitude">Latitude</label>
              <input 
                id="latitude" 
                name="latitude" 
                type="number"
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value)}
                required 
              />
            </div>  
            <div className="input-block">
              <label htmlFor="longitude">Longitude</label>
              <input 
                id="longitude" 
                name="longitude" 
                type="number"
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value)}
                required 
              />
            </div>  
          </div>
          <button 
            className='geolocation'
            type="button" 
            onClick={getCurrentPosition}
          >Localização atual</button>

          <button type="submit">Salvar</button>
          {
            updating &&
            <button type="button" onClick={handleCancel}>Cancelar</button>
          }
        </form>
      </aside>
      <main>
        <ul>
          {devs.map((dev) => (
            <DevItem 
              key={dev._id}
              dev={dev}
              updateDev={handleUpdateDev}
              updatingDev={updating}
            />
          ))}
        </ul>

        <Toaster 
          position='bottom-right'
        />
      </main>
    </div>
  );
}