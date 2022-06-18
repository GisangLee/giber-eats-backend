import { CoreOutput } from 'src/common/dto/output.dto';
import { CreateRestaurantInputType } from './create-restaurant.dto';
import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { IsNumber } from 'class-validator';


@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInputType) {
    @Field(type => Number)
    @IsNumber()
    restaurantId: number;
}


@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}