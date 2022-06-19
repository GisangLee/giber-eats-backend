import { UsersService } from './../users/users.service';
import { JwtService } from './../jwt/jwt.service';
import { User } from './../users/entities/user.entity';
import { AllowedRoles } from './role.decorator';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly userSerivce: UsersService,
    ){}

    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<AllowedRoles>("roles", context.getHandler());

        if (!roles) {
            return true;
        }

        const gqlContext = GqlExecutionContext.create(context).getContext();

        const token = gqlContext.token;
        
        if (token){
            
            const decodedJwt = this.jwtService.verify(token.toString());

            if (typeof(decodedJwt) === "object" && decodedJwt.hasOwnProperty("id") && decodedJwt.hasOwnProperty("expireAt")) {

                const { user } = await this.userSerivce.findById(decodedJwt.id);

                if (!user){
                    return false;
                }

                gqlContext["user"] = user;
        
                if (roles.includes("Any")){
                    return true;
                }
        
                return roles.includes(user.role);
            } else {
                return false;
            }
        }else {
            return false;
        }

    }
}