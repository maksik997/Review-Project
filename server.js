const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if(req.method = 'PUT' && parsedUrl.pathname === '/update') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newData = JSON.parse(body);
            const filePath = path.join(__dirname, './db/reviews.json');
            fs.writeFile(filePath, JSON.stringify(newData), err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Error encounterd while saving JSON file.");
                    console.error("Error encounterd while saving JSON file.");
                } else {
                    res.writeHead(200, { 'Content-Type' : 'text/plain' });
                    res.end("The JSON file saved successfully!");
                    console.log("Update");
                }
            })
        });
        return;
    }

    const filePath = path.join(__dirname, parsedUrl.pathname);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain'});
            res.end('File not found');
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
