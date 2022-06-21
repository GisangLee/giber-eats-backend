import { Restaurant } from './../entities/restaurant.entity';
import { PaginationInput, PaginationOutput } from './../../common/dto/pagination.dto';
import { Category } from './../entities/category.entity';import { CoreOutput } from 'src/common/dto/output.dto';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsString } from 'class-validator';


@InputType()
export class CategoryInput extends PaginationInput {
    @Field(type => String)
    @IsString()
    slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
    @Field(type => [Restaurant], { nullable: true })
    restaurants?: Restaurant[];

    @Field(type => Category, { nullable: true })
    category?: Category;

    @Field(type => Int, { nullable: true})
    totalResults?: number;

}