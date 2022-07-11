const axios = require('axios');

const dev = require('../models/dev');
const { findConnections, findAllConnections, sendMessage } = require('../websocket')
const parseStringAsArray = require('../utils/parseStringAsArray');


/**
 * Methods:
 *  Index: retorna N
 *  Show: retorna 1
 *  Store: criação
 *  Update: atualização
 *  Destroy: remoção
 */

module.exports = {
    async index (req, res) { 
        return res
            .json(await dev.find())
    },

    async show(req, res) {
        const { github_username } = req.params;
        
        return res
            .json(await dev.findOne({github_username}))
    },

    async store (req, res) {
        const { github_username, latitude, longitude, techs } = req.body;
    
        let newDev = await dev.findOne({github_username})

        if (!newDev) {
            const result = await axios.get(`https://api.github.com/users/${github_username}`)
                .then(x => x)
                .catch(x => x);
            
            const { status, data } = result.response ?? result;
        
            if (status !== 200) 
                return res
                    .status(status)
                    .json(data);
                
            const { name = login, bio, avatar_url } = data
            const techsArray = parseStringAsArray(techs)
            const location = { 
                type: 'Point', 
                coordinates: [longitude, latitude]
            }

            newDev = await dev.create({ 
                    name, 
                    github_username,
                    bio,
                    avatar_url,
                    location,
                    techs: techsArray
                })

            const sendSocketMessageTo = findConnections(
                {latitude, longitude},
                techsArray
            )

            sendMessage(sendSocketMessageTo, `new-dev`, newDev)
        }

        return res
            .json(newDev)
    },

    async update (req, res) {
        const { github_username } = req.params;
        const { latitude, longitude, techs } = req.body;

        if (!await dev.findOne({github_username}))
            return res
                .status(400)
                .json({message: 'Dev não encontrado'})

        const techsArray = parseStringAsArray(techs)
        const location = { 
            type: 'Point', 
            coordinates: [longitude, latitude]
        }

        const result = await axios.get(`https://api.github.com/users/${github_username}`)
                .then(x => x)
                .catch(x => x);
            
        const { status, data } = result.response ?? result;
        
        if (status !== 200) 
            return res
                .status(status)
                .json(data);

        const { _id, name = login, bio, avatar_url } = data

        const response = await dev.updateOne({github_username}, {
            name, 
            bio,
            avatar_url,
            location,
            techs: techsArray
        })

        if (response.modifiedCount < 1) 
            return res
                .status(500)
                .json({message: 'Erro ao atualizar o dev'})
        else
            return res
                .json({
                    message: 'Dev atualizado',
                    dev: {
                        name, 
                        bio,
                        avatar_url,
                        location,
                        techs: techsArray
                    }
                })

    },

    async destroy (req, res) {
        const { github_username } = req.params;

        if (!await dev.findOne({github_username}))
            return res
                .status(400)
                .json({message: 'Dev não encontrado'})

        const response = await dev.deleteOne({github_username})
        if (response.deletedCount < 1) 
            return res
                .status(500)
                .json({message: 'Erro ao remover o dev'})
        else
            return res
                .json({message: 'Dev removido'})

    }
};