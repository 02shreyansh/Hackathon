import { IsNotEmpty, IsString } from "class-validator";

export interface Status {
    role: 'user' | 'admin';
}
export class SignupRequest{
    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    password:string;

    @IsString()
    @IsNotEmpty()
    Company_Name:string;
}
export class SigninRequest{
    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    password:string;
}