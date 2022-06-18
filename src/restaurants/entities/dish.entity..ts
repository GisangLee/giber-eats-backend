import { Restaurant } from './restaurant.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { IsNumber, IsString, Length } from 'class-validator';

@InputType("DishOptionInputType", { isAbstract: true })
@ObjectType()
class DishOption {
    @Field(type => String)
    name: string;

    @Field(type => [String], { nullable: true })
    choices?: string[];

    @Field(type => Int, { nullable: true })
    extra?: number;
}

@InputType("DishInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {

    @Field(type => String) // Graphql
    @Column()  // Database
    @IsString() // DTO
    @Length(2, 10)  // DTO 
    name: string;

    @Field(type => Int)
    @Column()
    @IsNumber()
    price: number;

    @Field(type => String, { nullable: true }) // Graphql
    @Column({ nullable: true })  // Database
    @IsString() // DTO
    photo: string;

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    @Length(5, 140)  // DTO 
    desc: string;

    @Field(type => [DishOption], { nullable: true })
    @Column({ type: "json", nullable: true })
    options?: DishOption[]

    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant, restaurant => restaurant.menu, { onDelete: "CASCADE", nullable: false })
    restaurant: Restaurant;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId: number;
}