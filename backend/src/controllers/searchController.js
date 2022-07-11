const dev = require('../models/dev')
const parseStringAsArray = require('../utils/parseStringAsArray')


module.exports = {
    async index (req, res) { 
        const { latitude, longitude, distance, techs  } = req.query

        const filter = {
            location: { 
                $near: { 
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: (distance ?? 1) * 10000
                }
            }
        }

        if (techs && techs !== '')
            filter.techs = { 
                $in: parseStringAsArray(techs)
            }

        const devs = await dev.find(filter)

        return res
            .json(devs);
    } 
};