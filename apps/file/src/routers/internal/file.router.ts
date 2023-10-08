import express, { NextFunction, Request, Response } from "express";

import { getLinkValidator } from "../../validator";
import multer from "multer";
import { HttpError, HttpStatus, ResultError } from "app";
import { getPublicURL, uploadFile } from "../../controllers/file.controller";
export const router = express.Router();

router.post(
    "/upload-file/",
    multer({
        storage: multer.memoryStorage(), // Lưu trữ dưới dạng buffer
    }).single("file"),
    async (req: Request, _: Response, next: NextFunction) => {
        if (!req.file) {
            const e: ResultError = {
                status: HttpStatus.BAD_REQUEST,
                errors: [
                    {
                        message: "Lỗi, không có file",
                    },
                ],
            };
            throw new HttpError(e);
        }
        const fileName = req.file?.originalname as string;
        const type = req.file?.mimetype as string;
        const buffer = req.file?.buffer as Buffer;
        const result = await uploadFile({
            filename: fileName,
            type: type,
            buffer: buffer,
            userId: "IDQUANG",
        });
        next(result);
    }
);

router.get(
    "/:fileId",
    async (req: Request, _: Response, next: NextFunction) => {
        const fileId = req.params.fileId as string;
        const result = await getPublicURL(fileId);
        next(result);
    }
);
