import { LoginInput, LoginOutput } from './dto/login.dto';
import { CreateAccountInput, CreateAccountOutput } from './dto/create-account.dto';
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dto/editProfile.dto';



@Resolver(of => User)
export class UsersResolver{
    constructor(
        private readonly usersService: UsersService
    ){}

    @Query(returns => Boolean)
    hi(){
        return true;
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput>{
        try {
            const { ok, error } = await this.usersService.createAccount(createAccountInput);

            return {
                ok,
                error
            }

        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput:LoginInput): Promise<LoginOutput>{
        
        try {
            const { ok, error, token } = await this.usersService.login(loginInput);
            
            return {
                ok,
                error,
                token
            }
            
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }

    @Query(returns => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User){
        return authUser;
    }   
    
    @UseGuards(AuthGuard)
    @Query(returns => UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput>{
        try {
            const user = await this.usersService.findById(userProfileInput.userId);
            
            if (!user){
                throw Error();
            }

            return {
                ok: Boolean(user),
                user
            };

        } catch (error) {
            return {
                error: "사용자를 찾을 수 없습니다.",
                ok: false
            };
        }
        
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User,
        @Args("input") editProfileInput: EditProfileInput
    ): Promise<EditProfileOutput>{
        try {
            await this.usersService.editProfile(authUser.id, editProfileInput);
            return {
                ok: true
            }
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }
    
}