import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

// Creación de usuario 
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // 1. Encriptar la contraseña
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });

      await newUser.save();
      // Excluímos la contraseña del objeto para que no se muestre.
      const { password: _, ...user } = newUser.toJSON();

      return user;

      // 2. Guardar el usuario

      // 3. Generar el JWT
    } catch (error) {
      //Manejamos el error de forma controlada.
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something terrible happened!!!');
    }
  }

// Registro de usuario
  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const email = RegisterUserDto;
    // Lógica registro de usuario
    const user = await this.create(registerUserDto);
    const userEmail = await this.userModel.findOne({email});

    // Verificamos si ya existe el email en la base de datos.
    if(userEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    return {
      user: user,
      token: this.getJwtToken({id: user._id})
    }
    
  }

// Login 
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Extraemos la información que queremos
    const { email, password } = loginDto;

    // Verificamos si el usuario existe a través del email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    // Verificación de la contraseña
    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }




  findAll(): Promise<User[]> {
    return this.userModel.find()
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id)
    const {password, ...rest} = user.toJSON();
    return rest
  }


  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  // Obtenemos el token (JWT)
  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
