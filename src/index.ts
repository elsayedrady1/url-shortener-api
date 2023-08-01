import { createSpinner } from 'nanospinner';
import { config } from "dotenv";
config()
import express, { Request, Response } from 'express'
import { initDatabaseConnection } from './controllers/mongoose';
import urls from './models/urls';
import checkAuth from './middlewares/checkAuth';

(async () => {
    await initDatabaseConnection(process.env.MONGOOSE_URI)
})()
const lSpinner = createSpinner(`Starting server...`).start({ color: 'blue' });

let app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', checkAuth, async (req: Request, res: Response) => {
    let urlsData = await urls.find()
    if (urlsData.length > 0) {
        res.status(200).json(urlsData.map(url => {
            return {
                redirectURL: url.redirectURL,
                urlCode: url.urlCode
            };
        }))
    } else {
        res.status(400).send('No data found.')
    }

})
app.get('/:code', async (req: Request, res: Response) => {
    let urlData = await urls.findOne({ urlCode: req.params.code })
    if (urlData) {
        res.redirect(urlData.redirectURL)
    } else {
        res.status(404).send('The url not found')
    }
})
app.delete('/:code', async (req: Request, res: Response) => {
    let urlData = await urls.findOne({ urlCode: req.params.code })
    if (urlData) {
        urlData.deleteOne({ urlCode: req.params.code })
        res.status(400).send('The url has been deleted successfully')
    } else {
        res.status(404).send('The url not found')
    }
})
app.post('/', async (req: Request, res: Response) => {
    if (req.body.redirectURL && isValidLink({ string: req.body.redirectURL })) {
        let urlData = await urls.create({ urlCode: generateUniqueId({ length: 10 }), redirectURL: req.body.redirectURL })
        res.status(200).send(urlData.urlCode)
    } else {
        res.status(400).send('Invalid redirect URL provided')
    }
})

app.listen(process.env.PORT || 3000, () => {
    lSpinner.success({ text: `The server is listening on port ${process.env.PORT}` })
})

function generateUniqueId({ length }: {
    /**
     * The length of the unique id
     */
    length: number
}) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function isValidLink({ string }: {
    /**
     * The string to check
     */
    string: string
}) {
    const linkRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
    return linkRegex.test(string);
}