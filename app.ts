import express  from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from "morgan";
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
const admin = require('firebase-admin');
const serviceAccount = require('./config/account-credentials.json');

mongoose.Promise = global.Promise;
const { PORT, CLIENT_ORIGIN } = require('./config');

const microsoftRouter = require('./routes/microsoft');
const firebaseRouter = require('./routes/firebase');

const app = express.application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use('/xboxlive', microsoftRouter);
app.use('/firebase', firebaseRouter);

app.use('*', (req, res) => {
    return res.status(404).json({ message: 'Not Found' });
});

export const server = app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));

// function runServer() {
//   return new Promise((res, rej) => {
//     mongoose.connect(DATABASE_URL, {useNewUrlParser: true}, err => {
//       if(err) {
//         return rej(err);
//       }
//       app.listen(PORT, () => {
//         console.log(`Server is listening on port ${PORT}`);
//         res();
//       }).on('error', err => {
//         mongoose.disconnect();
//         rej(err);
//       })
//     }).catch(err => console.log(err) && rej(err))
//   })
// }
//
// function closeServer() {
//   return mongoose.disconnect().then(() => {
//     return new Promise((res, rej) => {
//       console.log('Closing Server');
//       app.disable(err => {
//         if (err) {
//           return rej(err)
//         }
//         res();
//       }).catch(err => console.log(err) && rej(err))
//     });
//   });
// }
//
// if(require.main === module) {{
//   runServer().catch(err => console.log(err));
// }}

module.exports = {app};