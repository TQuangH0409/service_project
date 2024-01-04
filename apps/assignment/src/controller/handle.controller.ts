import { HttpError, HttpStatus, ResultSuccess, success } from "app";
import { ETYPE, IAssignment } from "../interfaces/models/assignment";
import { getAllProjects } from "../services/project.service";
import { getAllResearchAreas } from "../services/research_area.service";
import { getAllUserByPosition } from "../services/user.service";
import { v1 } from "uuid";
import { IProject } from "../interfaces/response/project.body";
import { IArray_Assignment } from "../interfaces/response/assignment.body";
import { IUser } from "../interfaces/response/user.body";
import Assignment from "../models/assignment";
import { sendMailGoogleInstruct } from "../services";

export async function handleReview(params: {
    semester: string;
    limit?: number;
    userId: string;
    type: string;
}): Promise<ResultSuccess> {
    const array: (number | string)[][] = [];
    const header: string[] = [];

    const teachers = await getAllUserByPosition({ position: "TEACHER" });
    const projects = await getAllProjects({ semester: params.semester });
    const listProject: IProject[] = [];

    const assignments: IAssignment[] = [];
    const arrayT_P: (number | string)[][] = (
        await getArrayTeacherProject({ semester: params.semester })
    ).data;

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

    const limit = params.limit
        ? params.limit
        : parseFloat((projects.body.length / teachers.body.length).toFixed()) +
          1;
    header.push("STT");
    teachers.body.forEach((t) => {
        header.push(t.fullname);
    });
    array.push(header);

    // tính tổng cột check số lượng đồ án mà giáo viên đã đk phân công
    function sumColumn(idx: number, a: (number | string)[][]): number {
        let sum = 0;
        a.forEach((r, i) => {
            if (i > 0) {
                if (Number.isInteger(r[idx])) {
                    const temp = r[idx] as number;
                    sum = sum + temp;
                }
            }
        });
        return sum;
    }
    // đánh đấu giáo viện đk phân công đồ án
    function createRow(
        fullname: string,
        idx: number,
        size: number,
        is?: boolean
    ): (number | string)[] {
        const rowProject: (number | string)[] = [];
        for (let i = 0; i < size; i++) {
            i === 0 ? rowProject.push(fullname) : rowProject.push(0);
        }
        if (!is) {
            rowProject[idx] = 1;
        }
        return rowProject;
    }

    // kiểm tra giáo viên đã đk phân công đồ án nào chưa
    function checkAssignment(
        ass: IAssignment[],
        teacher: string
    ): IAssignment | undefined {
        let result: IAssignment | undefined = undefined;
        ass.forEach((a) => {
            if (a.teacher.id === teacher) {
                result = a;
            }
        });
        return result;
    }

    function assignTheProjectToTheTeacher(
        project: number,
        teacher: string,
        size: number,
        limit: number,
        fullname: string
    ): (number | string)[] {
        let maxCompatibility = 0;
        let temp = 1;

        // lay ra cac giao vien co so do an < 3
        const teacherCheckSum: number[] = [];
        teachers.body!.forEach((t, idx) => {
            if (sumColumn(idx + 1, array) < limit && t.id !== teacher) {
                teacherCheckSum.push(idx + 1);
            }
        });

        if (teacherCheckSum.length === 0) {
            listProject.push(projects.body![project]);
            return createRow(fullname, temp, size, true);
        }

        // phan cong giao vien
        arrayT_P[project].forEach((a, idx) => {
            let compatibility = 0;
            if (teacherCheckSum.includes(idx) && idx > 0) {
                if (Number.isInteger(a)) {
                    const temp_a = a as number;
                    compatibility = temp_a;
                    if (compatibility >= maxCompatibility) {
                        maxCompatibility = compatibility;
                        temp = idx;
                    }
                }
            }
        });

        const decision = checkAssignment(
            assignments,
            teachers.body![temp - 1].id
        );

        if (decision === undefined) {
            const assignment: IAssignment = {
                semester: params.semester,
                limit: limit,
                teacher: { ...teachers.body![temp - 1] },
                project: [
                    {
                        ...projects.body![project],
                        coincidence: maxCompatibility || 0,
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
                ...projects.body![project],
                coincidence: maxCompatibility || 0,
            });
        }

        return createRow(fullname, temp, size);
    }

    projects.body.forEach((p: IProject, idx) => {
        const temp = assignTheProjectToTheTeacher(
            idx,
            p.teacher_instruct_id,
            header.length,
            limit,
            p.name
        );
        array.push(temp);
    });

    const sum: (number | string)[] = [];
    header.forEach((p, idx) => {
        const a = sumColumn(idx, array);
        sum.push(a);
    });

    array.push(sum);

    if (params.type !== "DRAFT") {
        await Assignment.create(assignments);
    }

    const result: IArray_Assignment = {
        array: array,
        assignment: assignments,
        listProject: listProject,
    };
    return success.ok(result);
}

export async function handleInstruct(params: {
    semester: string;
    limit?: number;
    userId: string;
    type: string;
}): Promise<ResultSuccess> {
    console.log(params);
    const array: (number | string)[][] = [];
    const header: string[] = [];
    const listStudent: IUser[] = [];

    const teachers = await getAllUserByPosition({ position: "TEACHER" });

    const students = await getAllUserByPosition({
        position: "STUDENT",
        semester: params.semester,
    });

    const assignments: IAssignment[] = [];
    const arrayT_S: (number | string)[][] = (
        await getArrayTeacherStudent({ semester: params.semester })
    ).data;

    if (!(students && students.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service student has an error",
                vi: "Service student có lỗi",
            },
            errors: [
                {
                    param: "service student",
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

    const limit = params.limit
        ? params.limit
        : parseFloat((students.body.length / teachers.body.length).toFixed()) +
          1;
    header.push("STT");
    teachers.body.forEach((t) => {
        header.push(t.fullname);
    });
    array.push(header);

    // tính tổng cột check số lượng đồ án mà giáo viên đã đk phân công
    function sumColumn(idx: number, a: (number | string)[][]): number {
        let sum = 0;
        a.forEach((r, i) => {
            if (i > 0) {
                if (Number.isInteger(r[idx])) {
                    const temp = r[idx] as number;
                    sum = sum + temp;
                }
            }
        });
        return sum;
    }
    // đánh đấu giáo viện đk phân công đồ án
    function createRow(
        fullname: string,
        idx: number,
        size: number,
        is?: boolean
    ): (number | string)[] {
        const rowProject: (number | string)[] = [];
        for (let i = 0; i < size; i++) {
            i === 0 ? rowProject.push(fullname) : rowProject.push(0);
        }
        if (!is) {
            rowProject[idx] = 1;
        }
        return rowProject;
    }

    // kiểm tra giáo viên đã đk phân công đồ án nào chưa
    function checkAssignment(
        ass: IAssignment[],
        teacher: string
    ): IAssignment | undefined {
        let result: IAssignment | undefined = undefined;
        ass.forEach((a) => {
            if (a.teacher.id === teacher) {
                result = a;
            }
        });
        return result;
    }

    function assignTheProjectToTheTeacher(
        project: number,
        // teacher: string,
        size: number,
        limit: number,
        fullname: string
    ): (number | string)[] {
        let maxCompatibility = 0;
        let temp = 1;

        // lay ra cac giao vien co so do an < 3
        const teacherCheckSum: number[] = [];
        teachers.body!.forEach((t, idx) => {
            if (
                sumColumn(idx + 1, array) < limit

                // && t.id !== teacher
            ) {
                teacherCheckSum.push(idx + 1);
            }
        });
        if (teacherCheckSum.length === 0) {
            listStudent.push(students.body![project]);
            return createRow(fullname, temp, size, true);
        }
        // phan cong giao vien
        arrayT_S[project].forEach((a, idx) => {
            let compatibility = 0;
            if (teacherCheckSum.includes(idx) && idx > 0) {
                if (Number.isInteger(a)) {
                    const temp_a = a as number;
                    compatibility = temp_a;
                    if (compatibility >= maxCompatibility) {
                        maxCompatibility = compatibility;
                        temp = idx;
                    }
                }
            }
        });

        const decision = checkAssignment(
            assignments,
            teachers.body![temp - 1].id
        );
        if (decision === undefined) {
            const assignment: IAssignment = {
                semester: params.semester,
                limit: limit,
                teacher: { ...teachers.body![temp - 1] },
                student: [
                    {
                        ...students.body![project],
                        coincidence: maxCompatibility || 0,
                    },
                ],
                id: v1(),
                type: ETYPE.INSTRUCT,
                project: [],
                created_time: new Date(),
                created_by: params.userId,
            };
            assignments.push(assignment);
        } else {
            decision.student.push({
                ...students.body![project],
                coincidence: maxCompatibility || 0,
            });
        }
        return createRow(fullname, temp, size);
    }

    students.body.forEach((s: IUser, idx) => {
        const temp = assignTheProjectToTheTeacher(
            idx,
            header.length,
            limit,
            s.fullname
        );
        array.push(temp);
    });

    const sum: (number | string)[] = [];
    header.forEach((p, idx) => {
        const a = sumColumn(idx, array);
        sum.push(a);
    });

    array.push(sum);

    if (params.type !== "DRAFT") {
        await Assignment.create(assignments);

        const dataMail: {
            teacher: {
                fullname: string;
                email: string;
            };
            student: {
                fullname: string;
                email: string;
            }[];
        }[] = assignments.map((ass) => {
            const student: {
                fullname: string;
                email: string;
            }[] = ass.student.map((s) => {
                return {
                    fullname: s.fullname,
                    email: s.email,
                };
            });
            return {
                teacher: {
                    fullname: ass.teacher.fullname,
                    email: ass.teacher.email,
                },
                student: student,
            };
        });

        await Promise.all(
            dataMail.map((d) => {
                return sendMailGoogleInstruct({
                    teacher: d.teacher,
                    student: [...d.student],
                });
            })
        );
    }

    const result: IArray_Assignment = {
        array: array,
        assignment: assignments,
        listStudent: listStudent,
    };
    return success.ok(result);
}

// thiết lập array project - specialize
export async function getArraySpecializeProject(params: {
    semester: string;
}): Promise<ResultSuccess> {
    const array: number[][] = [];
    const projects = await getAllProjects({ semester: params.semester });
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
            if (p.research_area.find((r) => r === s.number)) {
                row.push(1);
            } else {
                row.push(0);
            }
        });
        array.push(row);
    });

    return success.ok(array);
}

// thiết lập array teacher - specialize
export async function getArraySpecializeTeacher(): Promise<ResultSuccess> {
    const array: number[][] = [];
    const array2: (number | string)[][] = [];
    const teachers = await getAllUserByPosition({ position: "TEACHER" });
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
    const header: string[] = [];
    header.push("STT");
    reseach_areas.body!.forEach((st) => header.push(st.number));
    array2.push(header);
    teachers.body.map((t) => {
        const row: number[] = [];
        const row2: (number | string)[] = [];
        row2.push(t.fullname);

        reseach_areas.body!.map((s) => {
            const temp = t.research_area.find((r) => r.number === s.number);
            if (temp && temp.experience) {
                row.push(temp.experience);
                row2.push(temp.experience);
            } else {
                row.push(0);
                row2.push(0);
            }
        });
        array.push(row);
        array2.push(row2);
    });

    return success.ok(array2);
}

// thiet lap array teacher - project
export async function getArrayTeacherProject(params: {
    semester: string;
}): Promise<ResultSuccess> {
    const projects: number[][] = (
        await getArraySpecializeProject({ semester: params.semester })
    ).data;
    const teachers: number[][] = (await getArraySpecializeTeacher()).data;

    function sum(p: number[], t: number[]): number {
        let total = 0;

        p.forEach((_p, idx) => {
            if (idx > 0) {
                if (typeof _p === "number" && typeof t[idx] === "number") {
                    const temp_t = t[idx] as number;
                    const temp_s = _p as number;
                    total += temp_s * temp_t;
                }
            }
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

// thiet lap array teacher - student
export async function getArrayTeacherStudent(params: {
    semester: string;
}): Promise<ResultSuccess> {
    const students: (number | string)[][] = (
        await getArraySpecializeStudent({ semester: params.semester })
    ).data;
    const teachers: (number | string)[][] = (await getArraySpecializeTeacher())
        .data;

    function sum(s: (number | string)[], t: (number | string)[]): number {
        let total = 0;

        s.forEach((_s, idx) => {
            if (idx > 0) {
                if (typeof _s === "number" && typeof t[idx] === "number") {
                    const temp_t = t[idx] as number;
                    const temp_s = _s as number;
                    total += temp_s * temp_t;
                }
            }
        });

        return total;
    }

    const header: string[] = [];
    const array2: (number | string)[][] = [];

    for (const t of teachers) {
        if (typeof t[0] === "string") {
            const temp = t[0] as string;
            header.push(temp);
        }
        continue;
    }
    array2.push(header);
    students.forEach((s, idx) => {
        if (idx > 0) {
            const element: (number | string)[] = [];
            element.push(s[0]);
            teachers.forEach((t, i) => {
                if (i > 0) {
                    element.push(sum(s, t));
                }
            });
            array2.push(element);
        }
    });

    return success.ok(array2);
}

// thiết lập array student - specialize
export async function getArraySpecializeStudent(params: {
    semester: string;
}): Promise<ResultSuccess> {
    const array: number[][] = [];
    const array2: (number | string)[][] = [];
    const students = await getAllUserByPosition({
        position: "STUDENT",
        semester: params.semester,
    });
    const reseach_areas = await getAllResearchAreas();

    if (!(students && students.body)) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Service student has an error",
                vi: "Service student có lỗi",
            },
            errors: [
                {
                    param: "service student",
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
    const header: string[] = [];
    header.push("STT");
    reseach_areas.body!.forEach((st) => header.push(st.number));
    array2.push(header);
    students.body!.map((st) => {
        const row: number[] = [];
        const row2: (number | string)[] = [];

        row2.push(st.fullname);
        reseach_areas.body!.map((s) => {
            if (st.research_area.find((r) => r.number === s.number)) {
                row.push(1);
                row2.push(1);
            } else {
                row.push(0);
                row2.push(0);
            }
        });
        array.push(row);
        array2.push(row2);
    });
    return success.ok(array2);
}
