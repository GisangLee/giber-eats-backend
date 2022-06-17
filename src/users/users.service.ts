import { JwtService } from './../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { CreateAccountInput } from './dto/create-account.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { User } from "./entities/user.entity";
import { EditProfileInput, EditProfileOutput } from './dto/editProfile.dto';
import { UserInputError } from 'apollo-server-express';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dto/verify-email.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { MailService } from 'src/mail/mail.service';



@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verification: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ){}

    async createAccount(createAccountInput: CreateAccountInput): Promise<{ok:boolean, error?:string}>{
        // check that email dose not exist

        try {
            const userExists = await this.users.findOne({
                where:{
                    email: createAccountInput.email
                }
            });

            if(userExists){
                // make error
                return {
                    ok: false,
                    error: "이미 존재하는 사용자입니다."
                };
            }

            // if new user, create user
            const user =await this.users.save(this.users.create(createAccountInput));

            // do email verification
            const verification = await this.verification.save(
                this.verification.create({
                    user
                }),
            );

            this.mailService.sendVerificationEmail(user.email, verification.code);

            return {
                ok: true
            };

        } catch (e) {
            // make error
            console.log(`createAccount error : ${e}`);
            return {
                ok: false,
                error: "계정을 생성할 수 없습니다."
            };
        }
    }

    async login(loginInput: LoginInput): Promise<LoginOutput>{

        const { email, password } = loginInput;

        try {
            // find user with the email
            const foundUser = await this.users.findOne({
                where:{
                    email: email
                },
                select: {
                    id: true,
                    password: true
                }
            });

            if (!foundUser){
                return {
                    ok: false,
                    error: "사용자를 찾을 수 없습니다.",
                };
            }

            // check the password is correct
            const isPwdCorrect = await foundUser.checkPwd(password);
            console.log(foundUser);

            if (!isPwdCorrect){
                return {
                    ok: false,
                    error: "비밀번호가 일치하지 않습니다."
                };
            }

            const expireAt = new Date().setDate(new Date().getDate() + 30);

            const token = this.jwtService.sign({id: foundUser.id, expireAt: expireAt })

            return {
                ok: true,
                token
            };

            // create JWT
        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async findById(id: number): Promise<UserProfileOutput>{

        try {
            const user = await this.users.findOneBy({ id });

            if(user){

                return {
                    ok: true,
                    user
                };
            }

        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }

    async editProfile(id: number, { email, password }: EditProfileInput): Promise<EditProfileOutput>{
        const user = await this.users.findOneBy({ id });

        try {
            if (email){
                user.email = email;
                user.verified = false;
                const verification = await this.verification.save(this.verification.create({ user }));

                this.mailService.sendVerificationEmail(email, verification.code);
            }
            if (password){
                user.password = password;
            }

            this.users.save(user);
            
            return {
                ok:true,
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }   

    async verifyEmail(code: string): Promise<VerifyEmailOutput>{

        try {
            const verification = await this.verification.findOne({ where: { code }, relations: ["user"]});

            if (verification) {
                verification.user.verified = true;
                await this.users.save(verification.user);
                await this.verification.delete(verification.id);
                return { ok: true };
            }
            
            return { ok: false, error: "Verrification not found" };
            
        } catch (error) {
            console.log(`verify email error : ${error}`);
            return { ok: false, error };
        }

    }
}