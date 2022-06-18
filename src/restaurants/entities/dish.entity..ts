import { Restaurant } from './restaurant.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { IsNumber, IsString, Length } from 'class-validator';

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

    @Field(type => String) // Graphql
    @Column()  // Database
    @IsString() // DTO
    photo: string;

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    @Length(5, 140)  // DTO 
    desc: string;

    @Field(type => Restaurant, { nullable: true })
    @ManyToOne(type => Restaurant, restaurant => restaurant.menu, { onDelete: "CASCADE"})
    restaurant: Restaurant;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId: number;
}