export interface FileGoogleAPIResBody {
    kind: string;
    id: string;
    name: string;
    mimeType: string;
}

export interface FileDBResBody {
    objectId: string;
    name: string;
    type: string;
    uploaded_by: string;
    created_time: Date;
}

export interface FileUrlResBody {
    webContentLink: string;
    webViewLink: string;
}
