import { PaginationOutput, PaginationInput } from './../../common/dto/pagination.dto';
import { Restaurant } from './../entities/restaurant.entity';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";


@InputType()
export class SearchRestaurantInput extends PaginationInput {
    @Field(type => String)
    query: string;
}


@ObjectType()
export class SearchRestaurantOuput extends PaginationOutput {
    @Field(type => [Restaurant], { nullable: true })
    restaurants?: Restaurant[];

    @Field(type => Int, { nullable: true })
    totalResults?: number;
}
