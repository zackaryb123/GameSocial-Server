export type XBLAuthorization = {
    userHash: string;
    XSTSToken: string;
};

export type MediaThumbnail = {
    uri: string;
    fileSize: 0;
    thumbnailType: 'Small' | 'Large';
};

export type MediaUri = {
    uri: string;
    fileSize: number;
    uriType: 'Download';
    expiration: string;
};

export type GameClipNode = {
    gameClipId: string;
    state: string;
    datePublished: string;
    dateRecorded: string;
    lastModified: string;
    userCaption: string;
    type: 'UserGenerated' | 'AutoGenerated';
    durationInSeconds: number;
    scid: string;
    titleId: number;
    rating: number;
    ratingCount: number;
    views: number;
    titleData: string;
    systemProperties: string;
    savedByUser: boolean;
    achievementId: string;
    greatestMomentId: string | null;
    thumbnails: MediaThumbnail[];
    gameClipUris: MediaUri[];
    xuid: string;
    clipName: string;
    titleName: string;
    gameClipLocale: string;
    clipContentAttributes: string;
    deviceType: string;
    commentCount: number;
    likeCount: number;
    shareCount: number;
    partialViews: number;
};

export type PlayerGameClipsResponse = {
    gameClips: GameClipNode[];
    pagingInfo: {
        continuationToken: string | null;
    };
};

export type ScreenshotNode = {
    screenshotId: string;
    resolutionHeight: number;
    resolutionWidth: number;
    state: string;
    datePublished: string;
    dateTaken: string;
    lastModified: string;
    userCaption: string;
    type: 'UserGenerated' | 'AutoGenerated';
    scid: string;
    titleId: number;
    rating: number;
    ratingCount: number;
    views: number;
    titleData: string;
    systemProperties: string;
    savedByUser: boolean;
    achievementId: string;
    greatestMomentId: string | null;
    thumbnails: MediaThumbnail[];
    screenshotUris: MediaUri[];
    xuid: string;
    screenshotName: string;
    titleName: string;
    screenshotLocale: string;
    screenshotContentAttributes: string;
    deviceType: string;
};

export type PlayerScreenshotsResponse = {
    screenshots: ScreenshotNode[];
    pagingInfo: {
        continuationToken: string | null;
    };
};

export type GetUGCQueryString = {
    maxItems?: number;
    continuationToken?: string;
};

export type GetMediaHubItemsPayload = {
    query?: string;
    max?: number;
    skip?: number;
    continuationToken?: string;
};

export type ProfileResponse = {
    profileUsers: [
        {
            id: string;
            hostId: string;
            settings: SettingsNode;
            isSponsoredUser: false;
        }
    ];
};

export interface IActivityTypeItems {
    items: 'GameDVR' | 'Screenshot' | 'Achievement' | 'Played';
}

export type GetActivityQueryString = {
    numItems?: number;
    contToken?: string;
    pollingToken?: string;
    activityTypes?: IActivityTypeItems['items'];
    excludeTypes?: IActivityTypeItems['items'];
    contentTypes?: 'Game' | 'App';
    startDate?: string;
    includeSelf?: boolean;
};

export type ActivityHistoryResponse<T = any> = {
    numItems: number;
    activityItems: T[];
    pollingToken: string;
    pollingIntervalSeconds: string | null;
    contToken: string;
};

export type ScreenshotsFromActivityHistoryNode = {
    screenshotId: string;
    screenshotThumbnail: string;
    screenshotScid: string;
    screenshotName: string;
    screenshotUri: string;
    viewCount: number;
    gameMediaContentLocators: [
        {
            Expiration: string;
            FileSize: number;
            LocatorType: 'Download';
            Uri: string;
        },
        {
            Expiration: string;
            FileSize: number;
            LocatorType: 'Thumbnail_Small';
            Uri: string;
        },
        {
            Expiration: string;
            FileSize: number;
            LocatorType: 'Thumbnail_Large';
            Uri: string;
        }
    ];
    contentImageUri: string;
    contentTitle: string;
    platform: string;
    titleId: string;
    uploadTitleId: string;
    activity: {
        screenshotThumbLarge: null;
        screenshotThumbSmall: null;
        screenshotType: null;
        savedByUser: boolean;
        screenshotScid: string;
        screenshotId: string;
        numShares: number;
        numLikes: number;
        numComments: number;
        ugcCaption: string | null;
        authorType: string;
        activityItemType: 'Screenshot';
        userXuid: string;
        date: string;
        contentType: 'Game';
        titleId: string;
        platform: string;
        sandboxid: string;
        userKey: string | null;
        scid: string;
    };
    userImageUriMd: string;
    userImageUriXs: string;
    description: string;
    date: string;
    hasUgc: boolean;
    activityItemType: 'Screenshot';
    contentType: 'Game';
    shortDescription: string;
    itemText: string;
    itemImage: string;
    shareRoot: string;
    feedItemId: string;
    itemRoot: string;
    hasLiked: boolean;
    authorInfo: {
        name: string;
        secondName: string;
        imageUrl: string;
        authorType: string;
        id: string;
    };
    gamertag: string;
    realName: string;
    displayName: string;
    userImageUri: string;
    userXuid: string;
};

export type GameClipsFromActivityHistoryNode = {
    clipId: string;
    clipThumbnail: string;
    downloadUri: string;
    clipName: string;
    clipCaption: string;
    clipScid: string;
    dateRecorded: string;
    viewCount: number;
    gameMediaContentLocators: [
        {
            Expiration: string;
            FileSize: number;
            LocatorType: 'Download';
            Uri: string;
        },
        {
            Expiration: string;
            FileSize: number;
            LocatorType: 'Thumbnail_Small';
            Uri: string;
        },
        {
            Expiration: string;
            FileSize: number;
            LocatorType: 'Thumbnail_Large';
            Uri: string;
        }
    ];
    contentImageUri: string;
    contentTitle: string;
    platform: string;
    titleId: string;
    uploadTitleId: string;
    activity: {
        dateRecorded: string;
        numShares: number;
        numLikes: number;
        numComments: number;
        ugcCaption: string | null;
        authorType: string;
        clipId: string;
        clipName: string | null;
        activityItemType: 'GameDVR';
        clipScid: string;
        userXuid: string;
        clipImage: string | null;
        clipType: string | null;
        clipCaption: string | null;
        savedByUser: boolean;
        date: string;
        sharedSourceUser: number;
        contentType: 'Game';
        titleId: string;
        platform: string;
        sandboxid: string;
        userKey: string | null;
        scid: string;
    };
    userImageUriMd: string;
    userImageUriXs: string;
    description: string;
    date: string;
    hasUgc: boolean;
    activityItemType: 'GameDVR';
    contentType: 'Game';
    shortDescription: string;
    itemText: string;
    itemImage: string;
    shareRoot: string;
    feedItemId: string;
    itemRoot: string;
    hasLiked: boolean;
    authorInfo: {
        name: string;
        secondName: string;
        imageUrl: string;
        authorType: string;
        id: string;
    };
    gamertag: string;
    realName: string;
    displayName: string;
    userImageUri: string;
    userXuid: string;
};

export type PlayerScreenshotsFromActivityHistoryResponse = ActivityHistoryResponse<
    ScreenshotsFromActivityHistoryNode
    >;

export type PlayerGameClipsFromActivityHistoryResponse = ActivityHistoryResponse<
    GameClipsFromActivityHistoryNode
    >;

export type MediaHubScreenshotResponseNode = {
    captureDate: string;
    contentId: string;
    contentLocators: Array<
        | { fileSize: number; locatorType: 'Download'; uri: string }
        | { locatorType: 'Thumbnail_Small'; uri: string }
        | { locatorType: 'Thumbnail_Large'; uri: string }
        | { fileSize: number; locatorType: 'Download_HDR'; uri: string }
        >;
    CreationType: 'UserGenerated' | 'AutoGenerated';
    localId: string;
    ownerXuid: number;
    resolutionHeight: number;
    resolutionWidth: number;
    sandboxId: 'RETAIL';
    sharedTo: unknown[];
    titleId: number;
    titleName: string;
    dateUploaded: string;
    uploadLanguage: string;
    uploadRegion: string;
    uploadTitleId: number;
    uploadDeviceType: string;
    commentCount: number;
    likeCount: number;
    shareCount: number;
    viewCount: number;
    contentState: string;
    enforcementState: string;
    safetyThreshold: string;
    sessions: unknown[];
    tournaments: unknown[];
};

export type MediaHubGameClipResponseNode = {
    contentId: string;
    contentLocators: Array<
        | {
        expiration: string;
        fileSize: number;
        locatorType: 'Download';
        uri: string;
    }
        | { locatorType: 'Thumbnail_Small'; uri: string }
        | { locatorType: 'Thumbnail_Large'; uri: string }
        >;
    contentSegments: Array<{
        segmentId: number;
        creationType: 'UserGenerated' | 'AutoGenerated';
        creatorChannelId: string | null;
        creatorXuid: number;
        recordDate: string;
        durationInSeconds: number;
        offset: number;
        secondaryTitleId: string | null;
        titleId: number;
    }>;
    creationType: 'UserGenerated' | 'AutoGenerated';
    durationInSeconds: number;
    frameRate: number;
    greatestMomentId: string;
    localId: string;
    ownerXuid: number;
    resolutionHeight: number;
    resolutionWidth: number;
    sandboxId: 'RETAIL';
    sharedTo: unknown[];
    titleData: string;
    titleId: number;
    titleName: string;
    uploadDate: string;
    uploadLanguage: string;
    uploadRegion: string;
    uploadTitleId: number;
    uploadDeviceType: string;
    userCaption: string;
    commentCount: number;
    likeCount: number;
    shareCount: number;
    viewCount: number;
    contentState: string;
    enforcementState: string;
    safetyThreshold: string;
    sessions: unknown[];
    tournaments: unknown[];
};

export type MediaHubResponse<
    T = MediaHubScreenshotResponseNode | MediaHubGameClipResponseNode
    > = {
    continuationToken?: string;
    values: T[];
};

export interface ISettingItems {
    items:
        | 'GameDisplayPicRaw'
        | 'Gamerscore'
        | 'Gamertag'
        | 'AccountTier'
        | 'XboxOneRep'
        | 'PreferredColor'
        | 'RealName'
        | 'Bio'
        | 'Location'
        | 'ModernGamertag'
        | 'ModernGamertagSuffix'
        | 'UniqueModernGamertag'
        | 'RealNameOverride'
        | 'TenureLevel'
        | 'Watermarks'
        | 'IsQuarantined'
        | 'DisplayedLinkedAccounts';
}

export type Setting = ISettingItems['items'];
export type SettingsNode = Array<{
    id: Setting;
    value: string;
}>;