import { Restaurant } from './../../restaurants/entities/restaurant.entity';
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToMany } from "typeorm";
import * as bcrypt from "bcrypt";
import { CoreEntity } from "src/common/entities/core.entity";
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";

export enum UserRole {
    Owner = "Owner",
    Client = "Client",
    Delivery = "Delivery",
}

registerEnumType(UserRole, { name:"UserRole" });

@InputType("UserInputType", {isAbstract:true})
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column()
    @Field(type => String)
    @IsEmail()
    email: string;

    @Column({ select: false })
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

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @OneToMany(type => Restaurant, restaurant => restaurant.owner)
    @Field(type => [Restaurant])
    restaurants: Restaurant[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void>{
        if(this.password){
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch (error) {
                console.log(`hashing password error : ${error}`);
                throw new InternalServerErrorException();
            }
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