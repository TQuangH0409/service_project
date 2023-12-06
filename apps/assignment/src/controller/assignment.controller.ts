import { HttpError, HttpStatus, ResultSuccess } from "app";
import { ClientSession } from "mongoose";
import { checkUserExits } from "../services/user.service";

export async function createAssignment(params: {
    type: string,
    student: string,
    teacher: string,
    project: string,
    session: ClientSession
}): Promise<ResultSuccess> {


    
    
}

