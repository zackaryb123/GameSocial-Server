export type Credentials = {
    email: string;
    password: string;
};

export type TokensExchangeProperties = {
    userToken: string;
    deviceToken?: string;
    titleToken?: string;
};

export type TokensExchangeOptions = {
    XSTSRelyingParty?: string;
    optionalDisplayClaims?: string[];
    raw?: boolean;
};

export type AuthenticateOptions = {
    XSTSRelyingParty?: string;
};

export type PreAuthResponse = {
    cookie: string;
    matches: {
        PPFT: string;
        urlPost: string;
    };
};

export type LogUserResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    refresh_token: string;
    user_id: string;
};

export type ExchangeResponse = {
    IssueInstant: string;
    NotAfter: string;
    Token: string;
    DisplayClaims: object;
};

export type ExchangeRpsTicketResponse = ExchangeResponse & {
    DisplayClaims: { xui: [{ uhs: string }] };
};

export type AuthenticateResponse = {
    userXUID: string | null;
    userHash: string;
    XSTSToken: string;
    expiresOn: string;
};