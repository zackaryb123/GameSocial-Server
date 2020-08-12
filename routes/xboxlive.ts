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
import admin from "firebase-admin";

const router = express.Router();

// ----- Constants ----- //
const uris = {
    screenshots: 'https://screenshotsmetadata.xboxlive.com',
    gameclips: 'https://gameclipsmetadata.xboxlive.com',
    profile: 'https://profile.xboxlive.com',
    avty: 'https://avty.xboxlive.com',
    mediahub: 'https://mediahub.xboxlive.com',
    list: `https://eplists.xboxlive.com`,
    inventory: 'https://inventory.xboxlive.com'
};
const request = {
    baseHeaders: {
        'Content-Type': 'application/json',
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

export const getPlayerInventory = async  (
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
): Promise<any> =>
    _getPlayerInventory(
        gamertagOrXUID,
        authorization,
        qs
    );

export const getPlayerList = async  (
    gamertagOrXUID: string | number,
    listType: string,
    listName: string,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
): Promise<any> =>
    _getPlayerList<PlayerGameClipsResponse>(
        gamertagOrXUID,
        listType,
        listName,
        authorization,
        qs
    );

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

export const getPlayerGameClip = (
    gamertagOrXUID: string | number,
    scid: string,
    gameClipId: string,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
    ): Promise<any> =>
    _getPlayerUGCs<PlayerGameClipsResponse>(
        gamertagOrXUID,
        scid,
        gameClipId,
        authorization,
        qs,
        'gameclips'
    );

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

const _getPlayerInventory = async  <T>(
    gamertagOrXUID: string | number,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
) => {
    const target = _isXUID(gamertagOrXUID) === true
        ? `xuid(${gamertagOrXUID})`
        : `xuid(${await getPlayerXUID(
            gamertagOrXUID as string,
            authorization
        )})`;
    return call<T>(
        {
            url: `${uris.inventory}/users/${target}/inventory`,
            params: { }
        },
        authorization
    )
}

const _getPlayerList = async <T>(
    gamertagOrXUID: string | number,
    listType: string,
    listName: string,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString = {}
) => {
    const target = _isXUID(gamertagOrXUID) === true
        ? `xuid(${gamertagOrXUID})`
        : `xuid(${await getPlayerXUID(
        gamertagOrXUID as string,
        authorization
        )})`;
    return call<T>(
        {
            url: `${uris.list}/${join( 'users', target, 'lists', listType, listName )}`,
            params: {
                maxItems: qs.maxItems || 25,
            }
        },
        authorization
    )
}

const _getPlayerUGCs = async <T>(
    gamertagOrXUID: string | number,
    scid: string,
    gameClipId: string,
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
            url: `${uris[type]}/${join('users', target, 'scids', scid, 
                type === 'screenshots' ? 'screenshots' : 'clips',
                gameClipId
            )}`,
            params: {
                maxItems: qs.maxItems || 25,
                continuationToken: qs.continuationToken
            }
        },
        authorization
    );
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
            url: `${uris[type]}/${join('users', target,
                type === 'screenshots' ? 'screenshots' : 'clips',
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