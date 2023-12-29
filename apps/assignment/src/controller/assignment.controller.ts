import { HttpError, HttpStatus, ResultSuccess, error, success } from "app";
import { ClientSession } from "mongoose";
import { checkUserExits } from "../services/user.service";
import Assignment from "../models/assignment";
import { getProjectByStudent } from "../services/project.service";
import { IUserAss } from "../interfaces/models/assignment";

export async function createAssignment(params: {
    type: string;
    student: string;
    teacher: string;
    project: string;
    session: ClientSession;
}): Promise<ResultSuccess> {
    return success.ok({});
}

export async function getAssignment(params: {
    student?: string;
    teacher?: string;
    project?: string;
    type: string;
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
            { "teacher.id": params.teacher },
            {
                project: {
                    $elemMatch: {
                        id: params.project,
                    },
                },
            },
        ],

        type: params.type,
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

    let temp = ass.toJSON();

    if (params.teacher && ass.student) {
        const project = ass.student.map((s) => {
            return getProjectByStudent(s.id);
        });

        const result = await Promise.all(project);

        const students = ass.toJSON().student.map((s, i) => {
            if (s.id === result[i].body?.student_id) {
                const p = result[i].body;
                return {
                    ...s,
                    project: p,
                };
            }
            return {
                ...s,
            };
        });

        temp = Object.assign(
            { ...temp },
            { students: students },
            { student: undefined }
        );
    }

    return success.ok(temp);
}
