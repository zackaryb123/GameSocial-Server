import express  from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from "morgan";
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

mongoose.Promise = global.Promise;
const { PORT, CLIENT_ORIGIN } = require('./config');

const xboxliveRouter = require('./routes/xboxlive');
const microsoftRouter = require('./routes/microsoft');

const app = express.application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// app.use('/xboxlive', xboxliveRouter);
app.use('/xboxlive', microsoftRouter);

app.use(
    cors
);

app.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
   next();
});

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