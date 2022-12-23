import express from "express";
import * as http from "http";
import * as jose from 'jose'
import fs from 'fs';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;

const privateKey = fs.readFileSync('./src/pkcs8.key').toString('utf8');
const publicKey = fs.readFileSync('./src/jwt256.key.pub').toString('utf8');


app.use(express.json());


// Sample get request to check if server is running
app.get("/", (req: express.Request, res: express.Response) => {
	res.status(200).send(`Server is running!`);
});

let privateKeyObj: jose.KeyLike;

app.post("/machine", async (req: express.Request, res: express.Response) => {
	const payload = {
		machineId: req.query.machineId,
		serialNumber: req.query.serialNumber,
	};

	if (privateKeyObj === undefined) {
		privateKeyObj = await jose.importPKCS8(privateKey, 'RS256');
	}
	const jwt = await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: 'RS256' })
		.setIssuedAt()
		.setExpirationTime('172h')
		.sign(privateKeyObj);

	console.log('hello there: ' + jwt);
	res.json({
		access_token: jwt,
		refresh_token: 'random token'
	});
});

// The server listens to requests in port 3000
server.listen(port, () => {
	console.log(`Server running locally at port: ${port}`);
});
