import { IsEmail, IsIn, IsString, IsStrongPassword } from "class-validator";

export type role = "Bursar" | "Admin" | "Headmaster" | "Cashier" | "school-receptionist" | "Dos";
export class LoginDto{
    @IsEmail()
    email!: string;

    @IsStrongPassword()
    password!: string;

}
export interface LoginDtos{
    email: string;
    password: string;
}