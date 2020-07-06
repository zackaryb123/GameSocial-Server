import axios, {AxiosRequestConfig} from 'axios';
import express  from 'express';
import {
    ActivityHistoryResponse,
    GetActivityQueryString,
    GetMediaHubItemsPayload,
    GetUGCQueryString,
    MediaHubGameClipResponseNode, MediaHubResponse,
    MediaHubScreenshotResponseNode,
    PlayerGameClipsFromActivityHistoryResponse,
    PlayerGameClipsResponse,
    PlayerScreenshotsFromActivityHistoryResponse,
    PlayerScreenshotsResponse,
    ProfileResponse,
    Setting,
    SettingsNode,
    XBLAuthorization
} from "../models/xboxlive.models";
import { join } from 'path';

const router = express.Router();

// ----- Xbox Live API ----- //

router.get('/clips', async (req, res, next) => {
    console.log('Server Requests: ', req.body);

    const auth: XBLAuthorization = {
        XSTSToken: 'eyJlbmMiOiJBMTI4Q0JDK0hTMjU2IiwiYWxnIjoiUlNBLU9BRVAiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJ4NXQiOiIxZlVBejExYmtpWklFaE5KSVZnSDFTdTVzX2cifQ.LXVSPoYyguQySnrjOWVuH2asTwJMA_882ykLm5Z8nMMjwUGDfMztVg6fbvyuHH5kNaBtRAdP9X-5StQUpVO153mcpsYnKmQobE2MRNClpg1dJq9-Tx6P1OT5m1F7jBgrsAmOHKI1L7A63Vl0wZHtIE8GuAJ_f7b9WwZ1_28rT3M.FrI-dXVXf1Vdht2uQ5jMpg.TtqmX3Bu2uZNMfYjJ0K10D_H_rj__GbH8-D70dfeWVGqXke6bDigS_5H_HCmW__N6YbqMA_rLf0i_3OAWFi46jj6onPj0Y_KZtnEojOZRYOYRgzzF6nxJwAIp4L6cN7z4AOWffwaeqj4ODWTNtzyM_BcnvOIPi7yVvlE27xrqa5OagVBIq7abY_OIxigJue3Jgw5G2qcswUWTMI3hLl-aKckqL9zd6_9JUmxE4I03gMrVaaIEG_3V0zCyxt-GoYG_y7Qq3H3yRMDkx8i-UOpaaogCYpIIiAT4pogLgNuOArdPBOUqhV3wTeBLA6WoYYkIzkg4-7i8W1uamJbjcDj2cqFCWkA4spfEehu9Qxo9iIbWMaveLqrEROtPQTG0uLJxWLTO73mTeMoRsfhnMSUtjxlbubtxFO3o31jZYmRtuxdrTf2HmyquCwpqNG3zXQCebj9n885_FV8xBuuUjaYXFHeQcrVGst7l5CQ12OtZWgnWLwbrAdqT8SpyMKwGdZdBO7r4DY_uKPFIqkxmnSrIpVlHzLu6o-rgFlsGitbFypY21M4sOZN2Bn9bToRT0mojeSYH3skADTcY8VfPOKbVqEePQqINE_TZSQUehqrZS5Ffr5pJP7sokRTiN9eTQn7jalXmqdd1gx5nrb9uqKEWlRuiY60tLtoSCe3MpAaS8pk2cxXLpBLfIvyaik374D8VN0wRA6bR6IrxPcWT-sQUJ_jvHVtA0NN_MuPbIJsFWKke9PCrKkRPQTw7hF3Oz3XUyq7xLtihcR53IDp6_o3OVSgBJzNpRx-2pC2TUIg_TKJFkUHWD1olsGiQcQ-K1nqwDJtsj69qntvSJgzyo-2hG9yYv_dMStFmQOJl7NpsoHikXYshwIgiL2nSjqjPe61yPsuvlAziHac9n27XfQEvXeZEIh6D1w0cLyrBSZxqIaWSA8qP6DsOjwTc2xihBGlULM1kPJ8o-IzT2MCtiY1Umgez_X_HlHbMtAnGx7NPCsdSB9SzdvrIZRMRbGleOLCPN8BS-4jP0rGs_sInSPH9uN0M11XwYilQug2bQwS5N9-7Y-MprEYtOuPWel_VxMna6TEjJlQWK6RSTIt0paqizpp10wcfgEe5NgrXZHkuWlSiWR4xhrlUnK0usDVDEXPcFNO549dH2-AXQuq5sZBba5V00z9EGOz_8HpzjTlEY4RLafTGkLvTVFHOsTI4QU-bdhIY--mASiN8zPssQzOMQ2IKQixC5jKhU6YbUSoMOTVLuUh17qAf7qQ9qgbT7RPVAdMZSqZTTHBERXbImhGfTlYrEk_lHazdEeug-QPQm3kyABppzAWZ22FaQLxaMTq2APVoqtacc4TPl9Biq8c7R-_Uo0EX8x_I7wqPXjT047ygksIbpOntL7wwA5_X_hk.R9Avkp5QNsPLvDXP0GKV5yD1jam9znvrq-LASyn7EZU',
        userHash: '10299317882998388246'
    };

    const query: GetUGCQueryString = {
    };

    getPlayerGameClips('2533274858701166', auth, query).then((data: any) => {
        res.send(data);
    }).catch((err: any) => {
        console.log('getPlayerGameClips: error: ', err);
        res.send(err);
    })
});
module.exports = router;
// ----- Constants ----- //
const uris = {
    screenshots: 'https://screenshotsmetadata.xboxlive.com',
    gameclips: 'https://gameclipsmetadata.xboxlive.com',
    profile: 'https://profile.xboxlive.com',
    avty: 'https://avty.xboxlive.com',
    mediahub: 'https://mediahub.xboxlive.com'
};
const request = {
    baseHeaders: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip',
        'Accept-Language': 'en-US',
        // 'User-Agent': USER_AGENT
    }
};

// ----- Methods ----- //

export const getPlayerXUID = async (
    gamertag: string,
    authorization: XBLAuthorization
): Promise<string> => {
    if (_isXUID(gamertag)) {
        return String(gamertag);
    }

    const response = await call<ProfileResponse>(
        {
            url: `${uris.profile}/${join(
                'users',
                `gt(${encodeURIComponent(gamertag)})`,
                'settings'
            )}`
        },
        authorization
    );

    if (response?.profileUsers?.[0]?.id === void 0) {
        throw new Error("Could not resolve player's XUID.");
    } else return response.profileUsers[0].id.toString();
};

export const getPlayerSettings = async (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    settings: Setting[] = []
): Promise<SettingsNode> => {
    const target =
        _isXUID(gamertagOrXUID)
            ? `xuid(${gamertagOrXUID})`
            : `gt(${encodeURIComponent(gamertagOrXUID as string)})`;

    const response = await call<ProfileResponse>(
        {
            url: `${uris.profile}/${join(
                'users',
                target,
                'settings'
            )}`,
            params: { settings: settings.join(',') }
        },
        authorization
    );

    if (response.profileUsers[0] === void 0) {
        throw new Error("Could not resolve player's settings.");
    } else return response.profileUsers[0].settings || [];
};

export const getPlayerActivityHistory = async (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: GetActivityQueryString = {}
): Promise<ActivityHistoryResponse> => {
    const target =
        _isXUID(gamertagOrXUID)
            ? `xuid(${gamertagOrXUID})`
            : `xuid(${await getPlayerXUID(
            gamertagOrXUID as string,
            authorization
            )})`;

    return call<ActivityHistoryResponse>(
        {
            url: `${uris.avty}/${join(
                'users',
                target,
                'activity/History'
            )}`,
            params: qs
        },
        authorization
    );
};

export const getPlayerScreenshots = async (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
): Promise<PlayerScreenshotsResponse> =>
    _getPlayerUGC<PlayerScreenshotsResponse>(
        gamertagOrXUID,
        authorization,
        qs,
        'screenshots'
    );

export const getPlayerScreenshotsFromMediaHub = (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    payload: GetMediaHubItemsPayload = {}
) =>
    _getFromMediaHub<MediaHubScreenshotResponseNode>(
        gamertagOrXUID,
        authorization,
        payload,
        'screenshots'
    );

export const getPlayerScreenshotsFromActivityHistory = async (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: Omit<
        GetActivityQueryString,
        'contentTypes' | 'activityTypes' | 'excludeTypes' | 'includeSelf'
        > = {}
): Promise<PlayerScreenshotsFromActivityHistoryResponse> =>
    getPlayerActivityHistory(gamertagOrXUID, authorization, {
        ...qs,
        contentTypes: 'Game',
        activityTypes: 'Screenshot',
        excludeTypes: 'GameDVR'
    });

export const getPlayerGameClips = (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
): Promise<PlayerGameClipsResponse> =>
    _getPlayerUGC<PlayerGameClipsResponse>(
        gamertagOrXUID,
        authorization,
        qs,
        'gameclips'
    );

export const getPlayerGameClipsFromMediaHub = (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    payload: GetMediaHubItemsPayload = {}
) =>
    _getFromMediaHub<MediaHubGameClipResponseNode>(
        gamertagOrXUID,
        authorization,
        payload,
        'gameclips'
    );

export const getPlayerGameClipsFromActivityHistory = async (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: Omit<
        GetActivityQueryString,
        'contentTypes' | 'activityTypes' | 'excludeTypes' | 'includeSelf'
        > = {}
): Promise<PlayerGameClipsFromActivityHistoryResponse> =>
    getPlayerActivityHistory(gamertagOrXUID, authorization, {
        ...qs,
        contentTypes: 'Game',
        activityTypes: 'GameDVR',
        excludeTypes: 'Screenshot'
    });

// ----- Functions ----- //

const _isXUID = (entry: string | number) =>
    /^([0-9]+)$/g.test(entry.toString());

const _is2XX = (statusCode: number) => {
    const s = String(statusCode);
    // It ain't stupid if it works
    return s.length === 3 && s[0] === '2';
};

// ----- Http Request ----- //

export const call = <T = any>(
    config: AxiosRequestConfig = {},
    { userHash, XSTSToken }: XBLAuthorization,
    XBLContractVersion = 2
): Promise<T> => {
    const XBLContractVersionHeader = {
        'x-xbl-contract-version': XBLContractVersion
    };

    config.responseType = config.responseType || 'json';

    config.headers = {
        ...XBLContractVersionHeader,
        ...request.baseHeaders,
        Authorization: `XBL3.0 x=${userHash};${XSTSToken}`,
        ...(config.headers || {})
    };

    return axios(config)
        .then(response => {
            if (!_is2XX(response.status)) {
                throw new Error(
                    `Invalid response status code for "${config.url}", got "${response.status}".`
                );
            } else return response.data as T;
        })
        .catch(err => {
            if (!!err.__XboxReplay__) throw err;
            else if (err.response?.status === 400) throw new Error('Bad Request');
            else if (err.response?.status === 401) throw new Error('Unauthorized');
            else if (err.response?.status === 403) throw new Error('Forbidden');
            else if (err.response?.status === 429)
                throw new Error('Too many requests');
            else if (err.response?.status === 404)
                throw new Error('Not found');
            else throw new Error(err.message);
        });
};

const _getPlayerUGC = async <T>(
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {},
    type: 'screenshots' | 'gameclips'
) => {
    const target =
        _isXUID(gamertagOrXUID) === true
            ? `xuid(${gamertagOrXUID})`
            : `xuid(${await getPlayerXUID(
            gamertagOrXUID as string,
            authorization
            )})`;

    return call<T>(
        {
            url: `${uris[type]}/${join(
                'users',
                target,
                type === 'screenshots' ? 'screenshots' : 'clips'
            )}`,
            params: {
                maxItems: qs.maxItems || 25,
                continuationToken: qs.continuationToken
            }
        },
        authorization
    );
};

const _getFromMediaHub = async <
    T = MediaHubScreenshotResponseNode | MediaHubGameClipResponseNode
    >(
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    payload: GetMediaHubItemsPayload = {},
    target: 'screenshots' | 'gameclips'
): Promise<MediaHubResponse<T>> => {
    const xuid =
        _isXUID(gamertagOrXUID) === true
            ? gamertagOrXUID
            : await getPlayerXUID(gamertagOrXUID as string, authorization);

    return call<MediaHubResponse<T>>(
        {
            url: `https://mediahub.xboxlive.com/${target}/search`,
            method: 'POST',
            data: {
                query: [`OwnerXuid eq ${xuid.toString()}`, payload.query]
                    .filter(q => !!q)
                    .join(' and '),
                max: Math.min(payload.max || 100, 100),
                skip: Math.max(payload.skip || 0, 0),
                continuationToken: payload?.continuationToken
            }
        },
        authorization
    );
};