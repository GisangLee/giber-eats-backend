import { Restaurant } from './../entities/restaurant.entity';
import { PaginationInput, PaginationOutput } from './../../common/dto/pagination.dto';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";


@InputType()
export class RestaurantsIput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
    @Field(type => [Restaurant], { nullable: true })
    restaurants?: Restaurant[];

    @Field(type => Int, { nullable: true })
    totalResults?: number;
}