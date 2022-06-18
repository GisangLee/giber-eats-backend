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
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { Role } from 'src/auth/role.decorator';



@Resolver(of => User)
export class UsersResolver{
    constructor(
        private readonly usersService: UsersService
    ){}

    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput>{
        return this.usersService.createAccount(createAccountInput);
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput:LoginInput): Promise<LoginOutput>{
        return this.usersService.login(loginInput);
    }

    @Role(["Any"])
    @Query(returns => User)
    me(@AuthUser() authUser: User){
        return authUser;
    }   
    
    @Role(["Any"])
    @Query(returns => UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput>{
        return this.usersService.findById(userProfileInput.userId);
        
    }

    @Role(["Any"])
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User,
        @Args("input") editProfileInput: EditProfileInput
    ): Promise<EditProfileOutput>{
        return this.usersService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation(returns => VerifyEmailOutput)
    verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput>{
        return this.usersService.verifyEmail(verifyEmailInput.code);
    }
}