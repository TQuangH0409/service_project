import {
    error,
    HttpError,
    HttpStatus,
    Result,
    ResultSuccess,
    success,
} from "app";
import File from "../models/file";
import { google } from "googleapis";
import { configs } from "../configs";
import { PassThrough, Readable } from "stream";
import fs from "fs";

const oauth2Client = new google.auth.OAuth2(
    configs.googleapis.client_id,
    configs.googleapis.client_secret,
    configs.googleapis.client_redirect_uri
);

oauth2Client.setCredentials({
    refresh_token: configs.googleapis.client_refresh_token,
});

// const accessToken = await oAuth2Client.getAccessToken();

const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

const mimeMap = {
    "application/zip": ".zip",
    "application/xhtml+xml": ".xhtml",
    "application/vnd.visio": ".vsd",
    "image/svg+xml": ".svg",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/x-httpd-php": ".php",
    "audio/mpeg": ".mp3",
    "video/mp4": ".mp4",
    "application/json": ".json",
    "image/gif": ".gif",
    "text/html": [".htm", ".html"],
    "text/csv": ".csv",
    "text/css": ".css",
    "text/plain": ".txt",
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": ".png",
    "application/java-archive": ".jar",
    "application/pdf": ".pdf",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
};

export async function uploadFile(params: {
    filename: string;
    type: string;
    buffer: Buffer;
    userId: string;
}): Promise<Result> {
    checkFileName(params.filename, params.type);
    const stream = new PassThrough();
    stream.end(params.buffer);
    const response = await drive.files.create({
        requestBody: {
            name: params.filename, //This can be name of your choice
            mimeType: params.type,
        },
        media: {
            mimeType: params.type,
            body: stream,
        },
    });
    const file = await File.create(
        new File({
            objectId: response.data.id,
            name: response.data.name,
            type: response.data.mimeType,
            uploaded_by: params.userId,
            created_time: new Date(),
        })
    );
    return success.ok(file);
}

// export async function getLinkDownload(objectNames: string[]): Promise<Result> {}

function checkFileName(filename: string, type: string): void {
    const actualExt: string | undefined | string[] =
        mimeMap[<keyof typeof mimeMap>type];
    const dotIndex = filename.lastIndexOf(".");
    const ext = filename.substring(dotIndex).toLocaleLowerCase();

    const hasExt = Object.keys(mimeMap).find((k) => {
        const key = <keyof typeof mimeMap>k;
        return mimeMap[key] === ext || mimeMap[key].includes(ext);
    });

    const err = new HttpError(
        error.invalidData({
            location: "query|param",
            param: "type|filename",
            value: `${filename}|${type}`,
            description: {
                vi:
                    "Hệ thống chỉ hỗ trợ các định dạng file doc, " +
                    "docx, xlsx, xls, csv, mp3, mp4, png, jpeg, jpg, pdf, " +
                    "ppt, pptx, zip, rar. Vui lòng kiểm tra lại định " +
                    "dạng file đính kèm của bạn.",
                en:
                    "The system only supports file format doc, docx, xlsx, xls, csv, " +
                    "mp3, mp4, png, jpeg, jpg, pdf, ppt, pptx, zip, rar file " +
                    "formats. Please double check your attachment format.",
            },
        })
    );
    if (!actualExt || !hasExt) {
        throw err;
    }
    if (actualExt !== ext && !actualExt.includes(ext)) {
        throw err;
    }
}

export async function getPublicURL(fileId: string): Promise<Result> {
    console.log(fileId);
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: "writer",
            type: "anyone",
        },
    });

    /* 
        webViewLink: View the file in browser
        webContentLink: Direct download link 
        */
    const result = await drive.files.get({
        fileId: fileId,
        fields: "webViewLink, webContentLink",
    });
    return success.ok(result.data);
}

export async function getInfoFile(params: {
    file: string;
}): Promise<ResultSuccess> {
    const response = await drive.files.get({ fileId: params.file });
    return success.ok(response.data);
}

export async function getFileByIdInDB(params: {
    id: string;
}): Promise<ResultSuccess> {
    const check = await File.findOne({ objectId: params.id }, { _id: 0 });

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This FILE was not exits",
                vi: "File không tồn tại",
            },
            errors: [
                {
                    param: "id",
                    location: "param",
                    value: params.id,
                },
            ],
        });
    }

    return success.ok(check);
}

export async function getFileContent(fileId: string): Promise<ResultSuccess> {
    try {
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );
  
      const fileStream = response.data as Readable;
  
      return new Promise<ResultSuccess>((resolve, reject) => {
        const chunks: any[] = [];
        fileStream.on("data", (chunk) => {
          chunks.push(chunk);
        });
  
        fileStream.on("end", () => {
          const fileContent = Buffer.concat(chunks).toString("utf-8");
          resolve(success.ok({content: fileContent}));
        });
  
        fileStream.on("error", (err) => {
          reject(err);
        });
      });
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw error;
    }
  }
