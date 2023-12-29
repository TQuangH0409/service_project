import { HttpError, HttpStatus, ResultSuccess, error, success } from "app";
import { ClientSession } from "mongoose";
import { _getUserById, checkUserExits } from "../services/user.service";
import Assignment from "../models/assignment";
import {
    getProjectById,
    getProjectByStudent,
} from "../services/project.service";
import { ETYPE, IUserAss } from "../interfaces/models/assignment";

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

    if (params.teacher && ass.student && params.type === ETYPE.INSTRUCT) {
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

    if (params.teacher && ass.project && params.type === ETYPE.REVIEW) {
        const project = ass.project.map((p) => {
            return getProjectById({ id: p.id });
        });

        const result = await Promise.all(project);

        let projects = ass.toJSON().project.map((p, i) => {
            const pT = result[i].body;
            return {
                ...pT,
                coincidence: p.coincidence,
            };
        });

        projects = await Promise.all(
            projects.map(async (p) => {
                const studentRes = await _getUserById({
                    userId: p.student_id || "",
                });
                const teacherRes = await _getUserById({
                    userId: p.teacher_instruct_id || "",
                });

                const student = studentRes.body;
                const teacher = teacherRes.body;

                return {
                    ...p,
                    coincidence: p.coincidence,
                    student: student,
                    teacher: teacher,
                    student_id: undefined,
                    teacher_instruct_id: undefined,
                };
            })
        );

        temp = Object.assign(
            { ...temp },
            { projects: projects },
            { project: undefined }
        );
    }

    return success.ok(temp);
}
