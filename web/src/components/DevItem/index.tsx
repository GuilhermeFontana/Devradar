import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';

import removeDevImg from '../../assets/images/remove-dev.svg';
import editDevImg from '../../assets/images/edit-dev.svg';

import './style.scss'
import { useDevs } from '../../hooks/useDevs';

  
type propsItemProps = { 
    dev: {
      name: string;
      github_username: string,
      avatar_url: string;
      bio: string
      techs: string[];
    },
    updateDev: (github_username: string) => void,
    updatingDev: boolean
}

export default function DevItem(props: propsItemProps) {
    const {name, github_username, avatar_url, bio, techs} = props.dev;

    const { removeDev } = useDevs();

    const [updatingState, setUpdatingState] = useState(false); 

    useEffect(() => {
      if (!props.updatingDev)
        setUpdatingState(false)
    }, [props.updatingDev])

    async function handleRemoveDev() {
        const result = await removeDev(github_username)
        if (result === '') 
            toast.success('Dev removido');
        else {
          toast.error(result, {
            duration: 2000
          })
        };   

        removeDev(github_username)
    }

    async function handleEditDev(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      event.preventDefault();
      setUpdatingState(true);

      props.updateDev(github_username);
    }

    return (
        <li className={`dev-item ${updatingState && 'editing'}`}>
          <header>
            <img src={avatar_url} alt={github_username} />
            <div className="user-info">
              <strong>{name || github_username }</strong>
              <span>{techs.join(', ')}</span>
            </div>
          </header>
          <p>{bio}</p>
          {!updatingState &&
            <div className='footer'>
              <a {...{target: '_blank'}} href={`https://github.com/${github_username}`}>Acessar perfil no GitHub</a>
              <div className='actions-btn'>
                {!props.updatingDev &&
                    <button
                        type="button"
                        onClick={(e) => {handleEditDev(e)}}
                    >
                            <img src={editDevImg} alt="Remover dev"/>
                    </button>
                }
                <button
                    type="button"
                    onClick={handleRemoveDev}
                >
                        <img src={removeDevImg} alt="Remover dev"/>
                </button>
              </div>
            </div>
        }
        </li>
    )
}