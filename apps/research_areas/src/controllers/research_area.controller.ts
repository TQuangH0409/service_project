import { HttpError, HttpStatus, ResultSuccess, error, success } from "app";
import ResearchArea from "../models/research_area";
import { v1 } from "uuid";
import { IResearchArea } from "../interfaces/models/research_areas";
import { FilterQuery, PipelineStage } from "mongoose";
import {
    ParseSyntaxError,
    parseQuery,
    parseSort,
} from "../../../../packages/mquery/build";

export async function createdResearchArea(params: {
    name: string;
    number: string;
    userId: string;
}): Promise<ResultSuccess> {
    const check = await ResearchArea.findOne({
        number: params.number,
        is_active: true,
    });

    if (check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Research area already exists",
                vi: "Lĩnh vực nghiên cứu này đã tồn tại",
            },
            errors: [
                {
                    param: "number",
                    location: "body",
                    value: params.number,
                },
            ],
        });
    }

    const research_area = new ResearchArea({
        id: v1(),
        name: params.name,
        number: params.number,
        created_by: params.userId,
        created_time: new Date(),
    });

    await research_area.save();

    return success.ok(research_area);
}

export async function updateResearchArea(params: {
    id: string;
    name?: string;
    number: string;
    userId: string;
}): Promise<ResultSuccess> {
    const check = await ResearchArea.findOne({
        number: params.number,
        is_active: true,
    });

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Research area already exists",
                vi: "Lĩnh vực nghiên cứu này đã tồn tại",
            },
            errors: [
                {
                    param: "number",
                    location: "body",
                    value: params.number,
                },
            ],
        });
    }
    const research_area = await ResearchArea.findOneAndUpdate(
        { id: params.id, is_active: true },
        {
            $set: {
                name: params.name,
                number: params.number,
            },
        },
        { new: true }
    );
    return success.ok(research_area);
}

export async function deleteResearchArea(params: {
    id: string;
    userId: string;
}): Promise<ResultSuccess> {
    const check = await ResearchArea.findOne({
        id: params.id,
        is_active: true,
    });

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Research area not already exists",
                vi: "Lĩnh vực nghiên cứu này không tồn tại",
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

    await ResearchArea.findOneAndUpdate(
        { id: params.id },
        {
            $set: {
                is_active: false,
            },
        },
        { new: true }
    );

    return success.ok({ message: "delete successful" });
}

export async function getResearchAreaById(params: {
    id: string;
}): Promise<ResultSuccess> {
    const check = await ResearchArea.findOne(
        {
            id: params.id,
            is_active: true,
        },
        {
            _id: 0,
        }
    );

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Research area not already exists",
                vi: "Lĩnh vực nghiên cứu này không tồn tại",
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

export async function findResearchArea(params: {
    query?: string;
    sort?: string;
    size: number;
    page: number;
}): Promise<ResultSuccess> {
    console.log(params);
    let filter: FilterQuery<IResearchArea> = {};
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
    const result = await ResearchArea.aggregate(pipeline)
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

export async function getAllResearchAreas(): Promise<ResultSuccess> {
    const projects = await ResearchArea.find(
        { is_active: true },
        {
            _id: 0,
            name: 1,
            number: 1,
            id: 1,
        }
    ).lean();

    return success.ok(projects);
}

export async function getResearchAreaByNumber(params: {
    number: string;
}): Promise<ResultSuccess> {
    const check = await ResearchArea.findOne(
        {
            number: params.number,
            is_active: true,
        },
        {
            _id: 0,
            name: 1,
            number: 1,
        }
    );

    if (!check) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Research area not already exists",
                vi: "Lĩnh vực nghiên cứu này không tồn tại",
            },
            errors: [
                {
                    param: "number",
                    location: "param",
                    value: params.number,
                },
            ],
        });
    }

    return success.ok(check);
}

export async function checkResearchAreasExits(params: {
    numbers: string[];
}): Promise<ResultSuccess> {
    const check = await ResearchArea.find(
        {
            number: {
                $in: params.numbers,
            },
            is_active: true,
        },
        {
            _id: 0,
            name: 1,
            number: 1,
        }
    );

    if (check.length < params.numbers.length) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Research area not already exists",
                vi: "Lĩnh vực nghiên cứu này không tồn tại",
            },
            errors: [
                {
                    param: "number",
                    location: "param",
                    value: params.numbers,
                },
            ],
        });
    }

    return success.noContent();
}
