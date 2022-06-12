import { LoginInput } from './dto/login.dto';
import { CreateAccountInput, CreateAccountOutput } from './dto/create-account.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>
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
            await this.users.save(this.users.create(createAccountInput));

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

    async login(loginInput: LoginInput): Promise<{ ok:boolean, error?:string, token?:string }>{

        const { email, password } = loginInput;

        try {
            // find user with the email
            const foundUser = await this.users.findOne({
                where:{
                    email: email
                }
            });

            if (!foundUser){
                return {
                    ok: false,
                    error: "사용자를 찾을 수 없습니다.",
                }
            }

            // check the password is correct
            const isPwdCorrect = await foundUser.checkPwd(password);

            if (!isPwdCorrect){
                return {
                    ok: false,
                    error: "비밀번호가 일치하지 않습니다."
                }
            }

            return {
                ok: true,
                token: "lalalalala"
            }

            // create JWT
        } catch (error) {

        }

    }
}