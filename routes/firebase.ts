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

router.post('/userClips', (req, res, next) => {
    (async () => {
        const clipRefs = new Array<firestore.DocumentReference<firestore.DocumentData>>();

        for (const clip of req.body) {
            const ref = admin.firestore().doc(`clips/${clip}`);
            clipRefs.push(ref);
        }
        const snap = await db.getAll(...clipRefs);
        const data = snap.map((item: any) => item.data());
        console.log(data);
        return res.json(data);
    })();
});

module.exports = router;

