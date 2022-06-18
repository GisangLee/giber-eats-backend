import { Dish } from './../entities/dish.entity.';
import { CoreOutput } from './../../common/dto/output.dto';
import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";


@InputType()
export class CreateDishInput extends PickType(Dish, ["name", "price", "desc", "options"]) {
    @Field(type => Int)
    restaurantId: number;
}

@ObjectType()
export class CreateDishOuput extends CoreOutput {}