import { HttpError, HttpStatus, ResultSuccess, error, success } from "app";
import Project from "../models/project";
import { checkUserExits } from "../services/user.service";
import { IProject, IReport } from "../interfaces/models/project";
import { v1 } from "uuid";
import { FilterQuery, PipelineStage } from "mongoose";
import {
    ParseSyntaxError,
    parseQuery,
    parseSort,
} from "../../../../packages/mquery/build";
import {
    getInfoFileGoogleApi,
    getInfoFileInDB,
    getPublicURL,
    sendMailGoogleNewProject,
} from "../services";
import {
    checkResearchAreasExits,
    getResearchAreaByNumber,
} from "../services/research_area.service";
import { IUser } from "../interfaces/response/user.body";

export async function createdProject(params: {
    name: string;
    student_id: string;
    discription?: {
        content?: string;
        attach?: string;
    };
    research_area: string[];
    userId: string;
}): Promise<ResultSuccess> {
    const isUserExits = await Promise.all([
        checkUserExits({ userId: params.student_id }),
        checkUserExits({ userId: params.userId }),
    ]);

    if (isUserExits[0] && isUserExits[0].status) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This student was not exits",
                vi: "Sinh viên này không tồn tại",
            },
            errors: [
                {
                    param: "student_id",
                    location: "body",
                    value: params.student_id,
                },
            ],
        });
    }

    if (isUserExits[1] && isUserExits[1].status) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This teacher was not exits",
                vi: "Giáo viên này không tồn tại",
            },
            errors: [
                {
                    param: "teacher_instruct_id",
                    location: "body",
                    value: params.userId,
                },
            ],
        });
    }

    const check = await Project.findOne({
        student_id: params.student_id,
        is_active: true,
    });

    if (check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This student was already on another project",
                vi: "Sinh viên này đã trong một đồ án khác",
            },
            errors: [
                {
                    param: "student_id",
                    location: "body",
                    value: params.student_id,
                },
            ],
        });
    }

    if (params.research_area) {
        const checkRA = await checkResearchAreasExits({
            numbers: params.research_area,
        });

        if (checkRA.status !== HttpStatus.NO_CONTENT) {
            throw new HttpError(
                error.invalidData({
                    location: "body",
                    param: "research area",
                    value: params.research_area,
                    message: "the research_area does not exist",
                })
            );
        }
    }

    const count = await Project.count({
        teacher_instruct_id: params.userId,
    });

    const project = new Project({
        id: v1(),
        name: params.name,
        student_id: params.student_id,
        teacher_instruct_id: params.userId,
        discription: {
            content: params.discription?.content,
            attach: params.discription?.attach,
        },
        research_area: params.research_area,
        created_time: new Date(),
        created_by: params.userId,
    });

    let file;
    let url;

    if (params.discription && params.discription?.attach) {
        file = await getInfoFileInDB(params.discription.attach);
        url = await getPublicURL(params.discription.attach);
    }

    await project.save();
    console.log(
        "🚀 ~ file: project.controller.ts:35 ~ isUserExits[0]:",
        isUserExits[1]
    );

    await sendMailGoogleNewProject({
        teacher: isUserExits[1].body!.fullname,
        student: isUserExits[0].body!.fullname,
        project: params.name,
        fileName: file?.body?.name,
        fileType: file?.body?.type,
        fileUrl: url?.body?.webContentLink,
    });

    return success.ok(project);
}

export async function updateProject(params: {
    id: string;
    name: string;
    discription?: {
        content?: string;
        attach?: string;
    };
    research_area: String[];
    report?: string[];
    source_code?: string;
    rate?: {
        comment?: string;
        mark_mid?: string;
        mark_final?: string;
    };
    userId: string;
}): Promise<ResultSuccess> {
    const check = await Project.findOne({ id: params.id, is_active: true });

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This project was not exits",
                vi: "Đồ án không tồn tại",
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
    let report;
    if (params.report) {
        const checkGoogleApi = await Promise.all(
            params.report?.map((r) => {
                return getInfoFileGoogleApi(r);
            })
        );

        report = await Promise.all(
            checkGoogleApi.map((r) => {
                return getInfoFileInDB(r.body!.id);
            })
        );

        report = report.map((r) => {
            return r.body;
        });
    }

    const updateProject = await Project.findOneAndUpdate(
        { id: params.id, is_active: true },
        {
            $set: {
                name: params.name,
                "desciption.content": params.discription?.content,
                "desciption.attach": params.discription?.attach,
                research_area: params.research_area,
                report: report,
                source_code: params.source_code,
                "rate.comment": params.rate?.comment,
                "rate.mark_mid": params.rate?.mark_mid,
                "rate.mark_final": params.rate?.mark_final,
            },
        },
        { new: true, projection: { _id: 0 } }
    );

    return success.ok(updateProject);
}

export async function getProjectById(params: {
    id: string;
}): Promise<ResultSuccess> {
    const check = await Project.findOne(
        { id: params.id, is_active: true },
        { _id: 0 }
    ).then(async (res) => {
        if (res) {
            const [student, teacher_instruct] = await Promise.all([
                checkUserExits({ userId: res.student_id }),
                checkUserExits({ userId: res.teacher_instruct_id }),
            ]);

            let teacher_review: { body?: IUser; status?: number; }  = {};
            if (res.teacher_review_id) {
                 teacher_review = await checkUserExits({
                    userId: res.teacher_review_id,
                });

                if (
                    teacher_review &&
                    teacher_review.body &&
                    teacher_review.body.research_area
                ) {
                    const research_area: {
                        [key: string]: string | number | undefined;
                    }[] = [];
                    const ra = teacher_review.body.research_area.map((r) =>
                        getResearchAreaByNumber(r.number)
                    );

                    const r = await Promise.all(ra);
                    r.forEach((e, idx) =>
                        research_area.push({
                            name: e.body!.name,
                            number: e.body!.number,
                            experience:
                                teacher_review.body!.research_area![idx]
                                    .experience,
                        })
                    );

                    Object.assign(teacher_review.body, {
                        research_area: research_area,
                    });
                }
            }

            if (student && student.body && student.body.research_area) {
                const research_area: {
                    [key: string]: string | number | undefined;
                }[] = [];
                const ra = student.body.research_area.map((r) =>
                    getResearchAreaByNumber(r.number)
                );

                const r = await Promise.all(ra);
                r.forEach((e, idx) =>
                    research_area.push({
                        name: e.body!.name,
                        number: e.body!.number,
                        experience:
                            student.body!.research_area![idx].experience,
                    })
                );

                Object.assign(student.body, {
                    research_area: research_area,
                });
            }

            if (
                teacher_instruct &&
                teacher_instruct.body &&
                teacher_instruct.body.research_area
            ) {
                const research_area: {
                    [key: string]: string | number | undefined;
                }[] = [];
                const ra = teacher_instruct.body.research_area.map((r) =>
                    getResearchAreaByNumber(r.number)
                );

                const r = await Promise.all(ra);
                r.forEach((e, idx) =>
                    research_area.push({
                        name: e.body!.name,
                        number: e.body!.number,
                        experience:
                            teacher_instruct.body!.research_area![idx]
                                .experience,
                    })
                );

                Object.assign(teacher_instruct.body, {
                    research_area: research_area,
                });
            }

            const result = {
                ...res.toJSON(),
                student_id: undefined,
                teacher_review_id: undefined,
                teacher_instruct_id: undefined,
            };

            const research_area: {
                [key: string]: string | number | undefined;
            }[] = [];
            const ra = res.research_area.map((r) =>
                getResearchAreaByNumber(r)
            );

            const r = await Promise.all(ra);
            r.forEach((e, idx) =>
                research_area.push({
                    name: e.body!.name,
                    number: e.body!.number
                })
            );

            Object.assign(result, {
                research_area: research_area,
            });

            Object.assign(result, {
                student: student.body,
                teacher_instruct: teacher_instruct.body,
                teacher_review: teacher_review
                    ? teacher_review.body
                    : undefined,
            });

            
            return result;
        }

        return res;
    });

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This project was not exits",
                vi: "Đồ án không tồn tại",
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

export async function findProject(params: {
    query?: string;
    sort?: string;
    size: number;
    page: number;
}): Promise<ResultSuccess> {
    console.log(params);
    let filter: FilterQuery<IProject> = {};
    let sort: undefined | Record<string, 1 | -1> = undefined;
    const facetData =
        params.size == -1
            ? []
            : [
                  { $skip: params.size * params.page },
                  { $limit: params.size * 1 },
              ];
    const facet = {
        meta: [{ $count: "total" }],
        data: facetData,
    };

    try {
        const RAFilter = params.query && parseQuery(params.query);
        RAFilter && (filter = { $and: [filter, RAFilter] });
        params.sort && (sort = parseSort(params.sort));
    } catch (e) {
        const err = e as unknown as ParseSyntaxError;
        const errorValue =
            err.message === params.sort ? params.sort : params.query;
        throw new HttpError(
            error.invalidData({
                location: "query",
                param: err.type,
                message: err.message,
                value: errorValue,
            })
        );
    }

    const pipeline: PipelineStage[] = [{ $match: filter }];
    sort && pipeline.push({ $sort: sort });
    pipeline.push({ $project: { _id: 0, activities: 0 } }, { $facet: facet });
    const result = await Project.aggregate(pipeline)
        .collation({ locale: "vi" })
        .then((res) => res[0])
        .then((res) => {
            const total = !(res.meta.length > 0) ? 0 : res.meta[0].total;
            let totalPage = Math.ceil(total / params.size);
            totalPage = totalPage > 0 ? totalPage : 1;
            return {
                page: Number(params.page),
                total: total,
                total_page: totalPage,
                data: res.data,
            };
        });

    return success.ok(result);
}

export async function deleteProject(params: {
    id: string;
}): Promise<ResultSuccess> {
    const check = await Project.findOneAndUpdate(
        { id: params.id, is_active: true },
        {
            $set: {
                is_active: false,
            },
        },
        { _id: 0, new: true }
    );

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This project was not exits",
                vi: "Đồ án không tồn tại",
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

    return success.ok({ message: "delete successful" });
}

export async function getProjectInstructByTeacher(params: {
    query?: string;
    sort?: string;
    size: number;
    page: number;
    teacher_instruct_id: string;
}): Promise<ResultSuccess> {
    console.log(params);
    let filter: FilterQuery<IProject> = {
        teacher_instruct_id: params.teacher_instruct_id,
    };
    let sort: undefined | Record<string, 1 | -1> = undefined;
    const facetData =
        params.size == -1
            ? []
            : [
                  { $skip: params.size * params.page },
                  { $limit: params.size * 1 },
              ];
    const facet = {
        meta: [{ $count: "total" }],
        data: facetData,
    };

    try {
        const RAFilter = params.query && parseQuery(params.query);
        RAFilter && (filter = { $and: [filter, RAFilter] });
        params.sort && (sort = parseSort(params.sort));
    } catch (e) {
        const err = e as unknown as ParseSyntaxError;
        const errorValue =
            err.message === params.sort ? params.sort : params.query;
        throw new HttpError(
            error.invalidData({
                location: "query",
                param: err.type,
                message: err.message,
                value: errorValue,
            })
        );
    }

    const pipeline: PipelineStage[] = [{ $match: filter }];
    sort && pipeline.push({ $sort: sort });
    pipeline.push({ $project: { _id: 0, activities: 0 } }, { $facet: facet });
    const result = await Project.aggregate(pipeline)
        .collation({ locale: "vi" })
        .then((res) => res[0])
        .then((res) => {
            const total = !(res.meta.length > 0) ? 0 : res.meta[0].total;
            let totalPage = Math.ceil(total / params.size);
            totalPage = totalPage > 0 ? totalPage : 1;
            return {
                page: Number(params.page),
                total: total,
                total_page: totalPage,
                data: res.data,
            };
        });

    return success.ok(result);
}

export async function getProjectReviewByTeacher(params: {
    query?: string;
    sort?: string;
    size: number;
    page: number;
    teacher_review_id: string;
}): Promise<ResultSuccess> {
    console.log(params);
    let filter: FilterQuery<IProject> = {
        teacher_instruct_id: params.teacher_review_id,
    };
    let sort: undefined | Record<string, 1 | -1> = undefined;
    const facetData =
        params.size == -1
            ? []
            : [
                  { $skip: params.size * params.page },
                  { $limit: params.size * 1 },
              ];
    const facet = {
        meta: [{ $count: "total" }],
        data: facetData,
    };

    try {
        const RAFilter = params.query && parseQuery(params.query);
        RAFilter && (filter = { $and: [filter, RAFilter] });
        params.sort && (sort = parseSort(params.sort));
    } catch (e) {
        const err = e as unknown as ParseSyntaxError;
        const errorValue =
            err.message === params.sort ? params.sort : params.query;
        throw new HttpError(
            error.invalidData({
                location: "query",
                param: err.type,
                message: err.message,
                value: errorValue,
            })
        );
    }

    const pipeline: PipelineStage[] = [{ $match: filter }];
    sort && pipeline.push({ $sort: sort });
    pipeline.push({ $project: { _id: 0, activities: 0 } }, { $facet: facet });
    const result = await Project.aggregate(pipeline)
        .collation({ locale: "vi" })
        .then((res) => res[0])
        .then((res) => {
            const total = !(res.meta.length > 0) ? 0 : res.meta[0].total;
            let totalPage = Math.ceil(total / params.size);
            totalPage = totalPage > 0 ? totalPage : 1;
            return {
                page: Number(params.page),
                total: total,
                total_page: totalPage,
                data: res.data,
            };
        });

    return success.ok(result);
}

export async function checkProjectExits(params: {
    id: string;
}): Promise<ResultSuccess> {
    const check = await Project.findOne(
        { id: params.id, is_active: true },
        { _id: 0 }
    );

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This project was not exits",
                vi: "Đồ án không tồn tại",
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

export async function getAllProjects(): Promise<ResultSuccess> {
    const projects = await Project.find(
        { is_active: true },
        {
            _id: 0,
            id: 1,
            name: 1,
            student_id: 1,
            teacher_instruct_id: 1,
            teacher_review_id: 1,
            research_area: 1,
        }
    ).lean();

    return success.ok(projects);
}

export async function getProjectByStudent(params: {
    student: string;
}): Promise<ResultSuccess> {
    const check = await Project.findOne(
        { student_id: params.student, is_active: true },
        {
            _id: 0,
            id: 1,
            name: 1,
            student_id: 1,
            teacher_instruct_id: 1,
            teacher_review_id: 1,
        }
    );

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "This project was not exits",
                vi: "Đồ án không tồn tại",
            },
            errors: [
                {
                    param: "student",
                    location: "query param",
                    value: params.student,
                },
            ],
        });
    }

    

    return success.ok(check);
}
