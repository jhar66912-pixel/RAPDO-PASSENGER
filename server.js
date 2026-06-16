import http from 'http';

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Native Android Project - Export via Code Editor to run in Android Studio.');
}

const server = http.createServer(requestListener);
server.listen(3000, '0.0.0.0', () => {
    console.log(`Server is running on port 3000`);
});
