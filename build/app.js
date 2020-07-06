"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
mongoose.Promise = global.Promise;
var _a = require('./config'), PORT = _a.PORT, CLIENT_ORIGIN = _a.CLIENT_ORIGIN;
var indexRouter = require('./routes/index');
var microsoftRouter = require('./routes/microsoft');
var app = express.application = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
// app.use('/microsoft', microsoftRouter);
app.use(cors({
    origin: CLIENT_ORIGIN
}));
app.use('*', function (req, res) {
    return res.status(404).json({ message: 'Not Found' });
});
app.listen(PORT, function () { return console.log("Example app listening at http://localhost:" + PORT); });
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
module.exports = { app: app };
