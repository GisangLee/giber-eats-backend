import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt";
import { CoreEntity } from "src/common/entities/core.entity";
import { InternalServerErrorException } from "@nestjs/common";
import { IsEnum, IsString } from "class-validator";

enum UserRole {
    Owner,
    Client,
    Delivery,
}

registerEnumType(UserRole, { name:"UserRole" });

@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column()
    @Field(type => String)
    @IsString()
    email: string;

    @Column()
    @Field(type => String)
    @IsString()
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
    })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void>{
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch (error) {
            console.log(`hashing password error : ${error}`);
            throw new InternalServerErrorException();
        }
    }

    async checkPwd(givenPwd:string): Promise<boolean> {
        try {
            return await bcrypt.compare(givenPwd, this.password);
            
        } catch (error) {
            console.log(`check PWD error : ${error}`);
            throw new InternalServerErrorException();
        }
    }
}