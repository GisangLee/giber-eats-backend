import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UsersService } from "src/users/users.service";
import { JwtService } from "./jwt.service";


@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService, private readonly userService: UsersService) {}
    
    async use(req:Request, res:Response, next:NextFunction) {
        
        if ("x-jwt" in req.headers){
            const token = req.headers["x-jwt"];
            const decodedJwt = this.jwtService.verify(token.toString());
            if (typeof(decodedJwt) === "object" && decodedJwt.hasOwnProperty("id") && decodedJwt.hasOwnProperty("expireAt")) {
                try {
                    const user = await this.userService.findById(decodedJwt.id);
                    req["user"] = user;
                } catch (error) {

                } 
            }
        }
        next();
    }
}