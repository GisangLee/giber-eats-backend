import { User } from './../../users/entities/user.entity';
import { Category } from './category.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";

@InputType("RestaurantInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {

    @Field(type => String) // Graphql
    @Column()  // Database
    @IsString() // DTO
    @Length(2, 10)  // DTO 
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    address: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => Category, { nullable: true })
    @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: "SET NULL"})
    category: Category;

    @ManyToOne(type => User, user => user.restaurants, { onDelete: "CASCADE" })
    @Field(type => User)
    owner: User;

    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number;
}