import { CoreOutput } from './../../common/dto/output.dto';
import { Dish } from './../entities/dish.entity.';
import { Field, InputType, Int, ObjectType, PartialType, PickType } from "@nestjs/graphql";

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), ["name", "desc", "price", "options"]) {
    @Field(type => Int)
    dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}