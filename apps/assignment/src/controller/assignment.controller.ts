import { HttpError, HttpStatus, ResultSuccess, error, success } from "app";
import { ClientSession } from "mongoose";
import { checkUserExits } from "../services/user.service";
import Assignment from "../models/assignment";

export async function createAssignment(params: {
    type: string;
    student: string;
    teacher: string;
    project: string;
    session: ClientSession;
}): Promise<ResultSuccess> {
    return success.ok({});
}

export async function getAssignmentByStudent(params: {
    student?: string;
    teacher?: string;
    project?: string;
}): Promise<ResultSuccess> {
    const ass = await Assignment.findOne({
        $or: [
            {
                student: {
                    $elemMatch: {
                        id: params.student,
                    },
                },
            },
            { teacher: params.teacher },
            {
                project: {
                    $elemMatch: {
                        id: params.project,
                    },
                },
            },
        ],
    });

    if (!ass) {
        throw new HttpError(
            error.invalidData({
                location: "body",
                param: "student or teacher or project",
                value: params.student || params.project || params.teacher,
                message: "the ass does not exist",
            })
        );
    }

    return success.ok(ass);
}
