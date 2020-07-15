import admin, {firestore} from "firebase-admin";
const serviceAccount = require('../config/account-credentials.json');
import express  from 'express';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://gamesocial-zb.firebaseio.com'
    });
}

const db = admin.firestore();
const router = express.Router();

router.post('/userClips', async (req, res, next) => {
    console.log('req.body: ', req.body);
    const clipRefs = new Array<firestore.DocumentReference<firestore.DocumentData>>();

    for (const clip of req.body) {
        const ref = admin.firestore().collection('clips').doc(clip);
        clipRefs.push(ref);
    }
    db.getAll(...clipRefs).then((snap: any) => {
        const data = snap.map((item: any) => item.data());
        res.send(data);
    }).catch((err: any) => {
        res.send(err);
    });
});

module.exports = router;

