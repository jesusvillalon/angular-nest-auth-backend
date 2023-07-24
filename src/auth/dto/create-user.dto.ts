import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
 //Usamos decoradores para las validaciones.
    @IsEmail()
    email: string;

    @IsString()
    name: string;
    
    @MinLength(6)
    password: string;


}
