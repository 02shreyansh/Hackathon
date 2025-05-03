import { Status } from "../dto/auth.dto";

export class Signup{
    constructor(
        public readonly email: string,
        public readonly password:string,
        public readonly  Company_Name:string,
        public readonly id?: number
    ){}
}

export class Signin{
    constructor(
        public readonly email: string,
        public readonly password:string,
        public readonly id?: number,
    ){}
}

export class AuthResponse{
    constructor(
        public readonly first_name: string,
        public readonly last_name: string,
        public readonly email: string,
        public readonly phone_number: string,
        public readonly Company_Name: string,
        public readonly id?: number,
    ){}
}