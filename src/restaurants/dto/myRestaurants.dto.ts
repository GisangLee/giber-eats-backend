import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationOutput } from "src/common/dto/pagination.dto";
import { Restaurant } from "../entities/restaurant.entity";

@ObjectType()
export class MyRestaurantsOutput extends PaginationOutput {
    @Field(type => [Restaurant])
    restaurants?: Restaurant[]
}