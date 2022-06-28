import { CoreOutput } from './../../common/dto/output.dto';
import { Restaurant } from './../entities/restaurant.entity';
import { Field, InputType, Int, ObjectType, OmitType, PickType } from "@nestjs/graphql";
import { IsString } from 'class-validator';

@InputType()
export class CreateRestaurantInputType extends PickType(Restaurant, ["name", "address", "coverImg"]) {
    @Field(type => String)
    @IsString()
    categoryName: string;
}


@ObjectType()
export class CreateRestaurantOutputType extends CoreOutput {

    @Field(type => Int)
    restaurantId?: number;
}