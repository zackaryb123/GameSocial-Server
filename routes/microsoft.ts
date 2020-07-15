import {stringify, parse} from "querystring";
const admin = require('firebase-admin');
const serviceAccount = require('../config/account-credentials.json');
import axios from 'axios';
import express  from 'express';
import {
    AuthenticateOptions,
    AuthenticateResponse,
    Credentials, ExchangeResponse,
    ExchangeRpsTicketResponse,
    LogUserResponse, PreAuthResponse, TokensExchangeOptions, TokensExchangeProperties
} from "../models/microsoft.models";
import {GetUGCQueryString, XBLAuthorization} from "../models/xboxlive.models";
import {getPlayerGameClips, getPlayerXUID} from "./xboxlive";

const router = express.Router();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://gamesocial-zb.firebaseio.com'
    });
}

// ----- Microsoft API ----- //
// {
//     uid: '',
//     gamertag: '',
//     email: '',
//     password: ''
// }
router.post('/link', async (req, res, next) => {
    authenticate(req.body.email, req.body.password, {}).then(async (data) => {
        const authorization: XBLAuthorization = { XSTSToken: data.XSTSToken, userHash: data.userHash };
        const gamerXUID = await getPlayerXUID(req.body.gamertag, authorization);
        if (gamerXUID === data.userXUID) {
            // TODO: Add firebse to add gamertag to user account
            // admin.firestore().collection('users').doc(req.body.uid).update({gamertag: req.body.gamertag});
            res.status(200).send(data);
        } else {
            res.status(401).send(new Error('Gamertag does not match authentication data'));
        }
    }).catch(err =>{
        console.log("ERROR: ", err);
        res.status(500).send(new Error(err));
    })
});

router.post('/clips', async (req, res, next) => {
    console.log('Server Requests: ', req.body);
    // TODO: For individual user authentication and check matching XUID
    authenticate('', '', {}).then((data) => {
        if (data) {
            const gamertagOrXUID = req.body.gamertagOrXUID;
            const auth: XBLAuthorization = { XSTSToken: data.XSTSToken, userHash: data.userHash};
            const query: GetUGCQueryString = {};
            getPlayerGameClips(gamertagOrXUID, auth, query).then((data: any) => {
                res.status(200).send(data);
            }).catch((err: any) => {
                res.status(500).send(new Error(err));
            })
        } else {
            res.status(401).send(new Error('No authentication data'));
        }
    }).catch((err: any) => {
        res.status(500).send(new Error(err));
    });
});

module.exports = router;

// ----- CONSTANTS ----- //

const uris = {
    userAuthenticate: 'https://user.auth.xboxlive.com/user/authenticate',
    XSTSAuthorize: 'https://xsts.auth.xboxlive.com/xsts/authorize',
    authorize: 'https://login.live.com/oauth20_authorize.srf'
};
const queries = {
    authorize: {
        client_id: '0000000048093EE3',
        redirect_uri: 'https://login.live.com/oauth20_desktop.srf',
        scope: 'service::user.auth.xboxlive.com::MBI_SSL',
        display: 'touch',
        response_type: 'token',
        locale: 'en'
    }
};
const defaultRelyingParty = 'http://xboxlive.com';
const request = {
    baseHeaders: {
        'Accept-encoding': 'gzip',
        'Accept-Language': 'en-US',
        // 'User-Agent': USER_AGENT
    }
};
type PreAuthMatchesParameters = {
    PPFT?: string;
    urlPost?: string;
};
type HashParameters = LogUserResponse;

// ----- Methods ----- //

export const authenticate = async (
    email: Credentials['email'],
    password: Credentials['password'],
    options: AuthenticateOptions = {}
): Promise<AuthenticateResponse> => {
    const preAuthResponse = await preAuth();
    const logUserResponse = await logUser(preAuthResponse, { email, password });
    const exchangeRpsTicketForUserTokenResponse = await exchangeRpsTicketForUserToken(
        logUserResponse.access_token
    );

    return exchangeUserTokenForXSTSIdentity(
        exchangeRpsTicketForUserTokenResponse.Token,
        { XSTSRelyingParty: options.XSTSRelyingParty, raw: false }
    ) as Promise<AuthenticateResponse>;
};

export const exchangeRpsTicketForUserToken = (
    RpsTicket: string
): Promise<ExchangeRpsTicketResponse> =>
    axios.post(
        uris.userAuthenticate,
        {
            RelyingParty: 'http://auth.xboxlive.com',
            TokenType: 'JWT',
            Properties: {
                AuthMethod: 'RPS',
                SiteName: 'user.auth.xboxlive.com',
                RpsTicket
            }
        },
        {
            headers: {
                ...request.baseHeaders,
                Accept: 'application/json',
                'x-xbl-contract-version': 0
            }
        }
    )
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Could not exchange specified "RpsTicket"');
            } else {
                return response.data as ExchangeRpsTicketResponse;
            }
        })
        .catch(err => {
            throw new Error(err.message);
        });

export const exchangeTokensForXSTSIdentity = <T extends ExchangeResponse>(
    { userToken, deviceToken, titleToken }: TokensExchangeProperties,
    { XSTSRelyingParty, optionalDisplayClaims, raw }: TokensExchangeOptions = {}
): Promise<T | AuthenticateResponse> =>
    axios.post(
        uris.XSTSAuthorize,
        {
            RelyingParty:
                XSTSRelyingParty || defaultRelyingParty,
            TokenType: 'JWT',
            Properties: {
                UserTokens: [userToken],
                DeviceToken: deviceToken,
                TitleToken: titleToken,
                OptionalDisplayClaims: optionalDisplayClaims,
                SandboxId: 'RETAIL'
            }
        },
        {
            headers: {
                ...request.baseHeaders,
                Accept: 'application/json',
                'x-xbl-contract-version': 1
            }
        }
    )
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Could not exchange specified "userToken"');
            }
            if (raw !== true) {
                const body = response.data as ExchangeResponse & {
                    DisplayClaims: { xui: [{ uhs: string; xid?: string }] };
                };

                return {
                    userXUID: body.DisplayClaims.xui[0].xid || null,
                    userHash: body.DisplayClaims.xui[0].uhs,
                    XSTSToken: body.Token,
                    expiresOn: body.NotAfter
                };
            } else {
                return response.data as T;
            }
        })
        .catch(err => {
            if (err.response?.status === 400) {
                const isDefaultRelyingParty =
                    XSTSRelyingParty === defaultRelyingParty;
                const computedErrorMessage = ['Could not exchange "userToken"'];

                // prettier-ignore
                if (!isDefaultRelyingParty) {
                    computedErrorMessage.splice(1, 0, 'double check the specified "XSTSRelyingParty" or');
                }
                throw new Error(computedErrorMessage.join(' '));
            } else {
                throw new Error(err.message);
            }
        });

export const exchangeUserTokenForXSTSIdentity = <T extends ExchangeResponse>(
    userToken: string,
    options: TokensExchangeOptions
): Promise<T | AuthenticateResponse> =>
    exchangeTokensForXSTSIdentity<T>({ userToken }, options);

export const preAuth = (): Promise<PreAuthResponse> =>
    axios
        .get(
            `${uris.authorize}?${stringify({
                ...queries.authorize
            })}`,
            { headers: request.baseHeaders }
        )
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Pre-authentication failed.');
            }

            const body = (response.data || '') as string;
            console.log("BODY: ", body);
            const cookie = (response.headers['set-cookie'] || [])
                .map((c: string) => c.split(';')[0])
                .join('; ');

            // prettier-ignore
            const matches: PreAuthMatchesParameters = {
                PPFT: getMatchForIndex(body, /sFTTag:'.*value=\"(.*)\"\/>'/, 1),
                urlPost: getMatchForIndex(body, /urlPost:'(.+?(?=\'))/, 1)
            };

            if (matches.PPFT === void 0) {
                throw new Error(`Could not match "PPFT" parameter`);
            } else if (matches.urlPost === void 0) {
                throw new Error(`Could not match "urlPost" parameter`);
            }

            return {
                cookie,
                matches: {
                    PPFT: matches.PPFT,
                    urlPost: matches.urlPost
                }
            };
        })
        .catch(err => {
            throw err.message;
        });

export const logUser = (
    preAuthResponse: PreAuthResponse,
    credentials: Credentials
): Promise<LogUserResponse> =>
    axios
        .post(
            preAuthResponse.matches.urlPost,
            stringify({
                login: credentials.email,
                loginfmt: credentials.email,
                passwd: credentials.password,
                PPFT: preAuthResponse.matches.PPFT
            }),
            {
                maxRedirects: 1,
                headers: {
                    ...request.baseHeaders,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: preAuthResponse.cookie
                }
            }
        )
        .then(response => {
            if (response.status !== 200) {
                throw new Error(`Authentication failed.`);
            }

            const body = (response.data || '') as string;
            const { responseUrl = '' } = response.request?.res || {};
            const hash = responseUrl.split('#')[1];

            if (responseUrl === preAuthResponse.matches.urlPost) {
                throw new Error('Invalid credentials.');
            }

            if (hash === void 0) {
                const errorMessage =
                    requiresIdentityConfirmation(body) === true
                        ? `Activity confirmation required`
                        : `Invalid credentials or 2FA enabled, please refer to`;

                throw new Error(errorMessage);
            }

            const parseHash = (parse(hash) as unknown) as HashParameters;
            parseHash.expires_in = Number(parseHash.expires_in);
            return parseHash;
        })
        .catch(err => {
            throw new Error(err.message);
        });


// ----- Functions ----- //
const getMatchForIndex = (entry: string, regex: RegExp, index: number = 0) => {
    const match = entry.match(regex);
    return match?.[index] || void 0;
};

const requiresIdentityConfirmation = (body: string) => {
    const m1 = getMatchForIndex(body, /id=\"fmHF\" action=\"(.*?)\"/, 1);
    const m2 = getMatchForIndex(m1 || '', /identity\/confirm/, 0);
    return m2 !== null;
};


// Types //

// export type Credentials = {
//     email: string;
//     password: string;
// };
//
// export type TokensExchangeProperties = {
//     userToken: string;
//     deviceToken?: string;
//     titleToken?: string;
// };
//
// export type TokensExchangeOptions = {
//     XSTSRelyingParty?: string;
//     optionalDisplayClaims?: string[];
//     raw?: boolean;
// };
//
// export type AuthenticateOptions = {
//     XSTSRelyingParty?: string;
// };
//
// export type PreAuthResponse = {
//     cookie: string;
//     matches: {
//         PPFT: string;
//         urlPost: string;
//     };
// };
//
// export type LogUserResponse = {
//     access_token: string;
//     token_type: string;
//     expires_in: number;
//     scope: string;
//     refresh_token: string;
//     user_id: string;
// };
//
// export type ExchangeResponse = {
//     IssueInstant: string;
//     NotAfter: string;
//     Token: string;
//     DisplayClaims: object;
// };
//
// export type ExchangeRpsTicketResponse = ExchangeResponse & {
//     DisplayClaims: { xui: [{ uhs: string }] };
// };
//
// export type AuthenticateResponse = {
//     userXUID: string | null;
//     userHash: string;
//     XSTSToken: string;
//     expiresOn: string;
// };