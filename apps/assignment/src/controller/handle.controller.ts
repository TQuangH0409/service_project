import { HttpError, HttpStatus, ResultSuccess, success } from "app";
import { ETYPE, IAssignment } from "../interfaces/models/assignment";
import { getAllProjects } from "../services/project.service";
import { getAllResearchAreas } from "../services/research_area.service";
import { getAllUserByPosition } from "../services/user.service";
import { v1 } from "uuid";
import { IProject } from "../interfaces/response/project.body";
import { IArray_Assignment } from "../interfaces/response/assignment.body";

export async function handle(params: { limit: number; type: ETYPE }) {}

export async function handleInstruct(params: {
    limit: number;
}): Promise<ResultSuccess> {
    return success.ok({});
}

export async function handleReview(params: {
    limit: number;
    userId: string;
}): Promise<ResultSuccess> {
    const array: number[][] = [];

    const teachers = await getAllUserByPosition({ position: "Teacher" });
    const projects = await getAllProjects();
    const assignments: IAssignment[] = [];
    const arrayT_P: number[][] = (await getArrayTeacherProject()).data;

    if (!(projects && projects.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service project has an error",
                vi: "Service project có lỗi",
            },
            errors: [
                {
                    param: "service project",
                    location: "internal router",
                },
            ],
        });
    }

    if (!(teachers && teachers.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service teacher has an error",
                vi: "Service teacher có lỗi",
            },
            errors: [
                {
                    param: "service teacher",
                    location: "internal router",
                },
            ],
        });
    }

    // tính tổng cột check số lượng đồ án mà giáo viên đã đk phân công
    function sumColumn(idx: number, a: number[][]): number {
        let sum = 0;
        a.forEach((r) => {
            if (Number.isInteger(r[idx])) {
                sum = sum + r[idx];
            }
        });
        return sum;
    }
    // đánh đấu giáo viện đk phân công đồ án
    function createRow(idx: number, size: number): number[] {
        const rowProject: number[] = [];
        for (let i = 0; i < size; i++) {
            rowProject.push(0);
        }
        rowProject[idx] = 1;
        return rowProject;
    }

    // kiểm tra giáo viên đã đk phân công đồ án nào chưa
    function checkAssignment(
        ass: IAssignment[],
        teacher: string
    ): IAssignment | undefined {
        let result: IAssignment | undefined = undefined;
        ass.forEach((a) => {
            if (a.teacher === teacher) {
                result = a;
            }
        });
        return result;
    }

    function assignTheProjectToTheTeacher(
        project: number,
        teacher: string,
        size: number,
        limit: number
    ): number[] {
        let maxCompatibility = 0;
        let temp = 0;

        // lay ra cac giao vien co so do an < 3
        const teacherCheckSum: number[] = [];
        teachers.body!.forEach((t, idx) => {
            if (sumColumn(idx, array) < limit && t.id !== teacher) {
                teacherCheckSum.push(idx);
            }
        });

        // phan cong giao vien
        arrayT_P[project].forEach((a, idx) => {
            let compatibility = 0;
            if (teacherCheckSum.includes(idx)) {
                compatibility = a;
                if (compatibility >= maxCompatibility) {
                    maxCompatibility = compatibility;
                    temp = idx;
                }
                return success.ok(array);
            }
        });

        const decision = checkAssignment(
            assignments,
            teachers.body![temp].email
        );

        if (decision === undefined) {
            const assignment: IAssignment = {
                teacher: teachers.body![temp].id,

                // teacher_name: teachers![temp].name,
                // teacher_phone: teachers![temp].phone,
                // teacher_email: teachers[temp].email,
                project: [
                    {
                        id: projects.body![project].id,
                        coincidence: maxCompatibility,
                    },
                ],
                id: v1(),
                type: ETYPE.REVIEW,
                student: [],
                created_time: new Date(),
                created_by: params.userId,
            };
            assignments.push(assignment);
        } else {
            decision.project.push({
                id: projects.body![project].id,
                coincidence: maxCompatibility,
            });
        }

        return createRow(temp, size);
    }

    projects.forEach((p: IProject, idx) => {
        const temp = assignTheProjectToTheTeacher(
            idx,
            p.teacher_instruct_id,
            teachers.body!.length,
            params.limit
        );
        array.push(temp);
    });

    const sum: number[] = [];
    teachers.forEach((p, idx) => {
        const a = sumColumn(idx, array);
        sum.push(a);
    });

    array.push(sum);

    const result: IArray_Assignment = {
        array: array,
        assignment: assignments,
    };
    return success.ok(result);
}

// thiết lập array project - specialize
export async function getArraySpecializeProject(): Promise<ResultSuccess> {
    const array: number[][] = [];
    const projects = await getAllProjects();
    const reseach_areas = await getAllResearchAreas();

    if (!(projects && projects.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service project has an error",
                vi: "Service project có lỗi",
            },
            errors: [
                {
                    param: "service project",
                    location: "internal router",
                },
            ],
        });
    }

    if (!(reseach_areas && reseach_areas.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service research-ares has an error",
                vi: "Service research-ares có lỗi",
            },
            errors: [
                {
                    param: "service research-ares",
                    location: "internal router",
                },
            ],
        });
    }

    projects.body!.map((p) => {
        const row: number[] = [];

        reseach_areas.body!.map((s) => {
            if (p.research_area.find((r) => r.number === s.number)) {
                row.push(1);
            } else {
                row.push(0);
            }
        });
        array.push(row);
    });

    return success.ok(array);
}

// thiết lập array project - specialize
export async function getArraySpecializeTeacher(): Promise<ResultSuccess> {
    const array: number[][] = [];
    const teachers = await getAllUserByPosition({ position: "Teacher" });
    const reseach_areas = await getAllResearchAreas();

    if (!(teachers && teachers.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service teacher has an error",
                vi: "Service teacher có lỗi",
            },
            errors: [
                {
                    param: "service teacher",
                    location: "internal router",
                },
            ],
        });
    }

    if (!(reseach_areas && reseach_areas.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service research-ares has an error",
                vi: "Service research-ares có lỗi",
            },
            errors: [
                {
                    param: "service research-ares",
                    location: "internal router",
                },
            ],
        });
    }

    teachers.body.map((t) => {
        const row: number[] = [];

        reseach_areas.body!.map((s) => {
            const temp = t.research_area.find((r) => r.number === s.number);
            if (temp) {
                row.push(temp.experience);
            } else {
                row.push(0);
            }
        });
        array.push(row);
    });

    return success.ok(array);
}

// thiet lap array teacher - project
export async function getArrayTeacherProject(): Promise<ResultSuccess> {
    const projects: number[][] = (await getArraySpecializeProject()).data;
    const teachers: number[][] = (await getArraySpecializeTeacher()).data;

    function sum(p: number[], t: number[]): number {
        let total = 0;

        p.forEach((_p, idx) => {
            total += _p * t[idx];
        });

        return total;
    }

    const array: number[][] = [];

    for (const p of projects) {
        const element: number[] = [];
        for (const t of teachers) {
            element.push(sum(p, t));
        }
        array.push(element);
    }

    return success.ok(array);
}
