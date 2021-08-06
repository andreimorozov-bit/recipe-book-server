import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(userData: SignUpUserDto) {
    const existinguser = await this.getUserByEmail(userData.email);
    if (existinguser) {
      throw new HttpException('email already in use', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    try {
      const newUser = this.usersRepository.create({
        ...userData,
        password: hashedPassword,
      });
      const user = await this.usersRepository.save(newUser);
      const payload: JwtPayload = { email: user.email };
      const accessToken: string = this.jwtService.sign(payload);

      return { accessToken };
    } catch (err) {
      throw new HttpException('server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signIn(userData: SignInUserDto) {
    try {
      const user = await this.getUserByEmail(userData.email);
      await this.verifyPassword(userData.password, user.password);
      const payload: JwtPayload = { email: user.email };
      const accessToken: string = this.jwtService.sign(payload);

      return { accessToken };
    } catch (err) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPassword(password: string, hashedPassword: string) {
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
  }

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    return user;
  }
}
