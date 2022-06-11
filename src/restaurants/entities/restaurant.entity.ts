import { Field, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn,  } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {

    @Field(type => Number)
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number;

    @Field(type => String)
    @Column()
    @IsString()
    @Length(2, 10)
    name: string;

    @Field(type => Boolean, { defaultValue: true }) // Graphql
    @Column({ default:true }) // Database
    @IsOptional() // DTO
    @IsBoolean() // DTO 
    isVegan: boolean;

    @Field(type => String)
    @Column()
    @IsString()
    address: string;

    @Field(type => String)
    @Column()
    @IsString()
    owner: string;

    @Field(type => String)
    @Column()
    @IsString()
    categoryName: string
}