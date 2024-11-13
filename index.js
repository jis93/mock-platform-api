const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Add custom route for api/v1
server.use(middlewares);
server.use(jsonServer.rewriter({
    '/api/v1/*': '/$1',
}));

server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running at http://localhost:3000/api/v1');
});