
export interface TrelloCard {
    id: string;
    name: string;
    address: any;
    badges: any;
    checkItemStates: any;
    closed: any;
    coordinates: any;
    creationMethod: any;
    dueComplete: any;
    dateLastActivity: any;
    desc: any;
    descData: any;
    due: any;
    dueReminder: any;
    email: any;
    idBoard: any;
    idChecklists: any;
    idLabels: any;
    idList: any;
    idMembers: any;
    idMembersVoted: any;
    idShort: any;
    idAttachmentCover: any;
    labels: any;
    limits: any;
    locationName: any;
    manualCoverAttachment: any;
    pos: any;
    shortLink: any;
    shortUrl: any;
    subscribed: any;
    url: any;
    cover: any;
    isTemplate:any;
}

export interface TrelloList {
    id: string;
    name: string;
    closed: boolean;
    pos: number;
    softLimit: string;
    idBoard: string;
    subscribed: boolean;
    limits: object;
    cards: Array<TrelloCard>;
}

export interface TrelloBoard {
    id: string;
    name: string;
    desc: string;
    descData: string;
    closed: boolean;
    idMemberCreator: string;
    idOrganization: string;
    pinned: boolean
    url: string;
    shortUrl: string;
    labelNames: any;
    prefs: any;
    limits: any;
    starred: boolean
    memberships: string;
    shortLink: string;
    subscribed: boolean;
    powerUps: string;
    dateLastActivity: string;
    dateLastView: string;
    idTags: string;
    datePluginDisable: string;
    creationMethod?: string;
    ixUpdate?: number;
    templateGallery: string;
    enterpriseOwned?: boolean;
    lists: Array<TrelloList>;
}