import { IAssignment } from "../models/assignment";
import { IProject } from "./project.body";
import { IUser } from "./user.body";

export interface IArray_Assignment {
    array?: (number | string)[][];
    assignment?: IAssignment[];
    listStudent?: IUser[]
    listProject?: IProject[]
}