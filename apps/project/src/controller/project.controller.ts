import { HttpError, HttpStatus, ResultSuccess, error, success } from "app";
import Project from "../models/project";
import { checkUserExits } from "../services/user.service";
import { IProject, IReport, IResearchArea } from "../interfaces/models/project";
import { v1 } from "uuid";
import { FilterQuery, PipelineStage } from "mongoose";
import {
    ParseSyntaxError,
    parseQuery,
    parseSort,
} from "../../../../packages/mquery/build";
import { getInfoFileGoogleApi, getInfoFileInDB } from "../services";

export async function createdProject(params: {
    name: string;
    student_id: string;
    discription?: {
        content?: string;
        attach?: string;
    };
    research_area: IResearchArea[];
    userId: string;
}): Promise<ResultSuccess> {
    const isUserExits = await Promise.all([
        checkUserExits({ userId: params.student_id }),
        checkUserExits({ userId: params.userId }),
    ]);

    if (!isUserExits[0]) {
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

    if (!isUserExits[1]) {
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

    const count = await Project.count({
        teacher_instruct_id: params.userId,
    });

    const project = new Project({
        id: v1(),
        name: params.name,
        student_id: params.student_id,
        teacher_instruct_id: params.userId,
        discription: {
            content: params.discription?.attach,
            attach: params.discription?.content,
        },
        research_area: params.research_area,
        created_time: new Date(),
        created_by: params.userId,
    });

    await project.save();

    return success.ok(project);
}

export async function updateProject(params: {
    id: string;
    name: string;
    discription?: {
        content?: string;
        attach?: string;
    };
    research_area: IResearchArea[];
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
