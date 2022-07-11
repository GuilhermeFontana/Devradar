const { Router } = require('express');
const routes = Router();

const devController = require('./controllers/devController');
const searchController = require('./controllers/searchController');

routes.get('/api/devs', devController.index)
routes.get('/api/devs/:github_username', devController.show)
routes.post('/api/devs', devController.store)
routes.put('/api/devs/:github_username', devController.update)
routes.delete('/api/devs/:github_username', devController.destroy)

routes.get('/api/search', searchController.index)

module.exports = routes;