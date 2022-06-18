import { Restaurant } from './../entities/restaurant.entity';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class RestaurantInput {
    @Field(type => Int)
    restaurantId: number;
}

@ObjectType()
export class RestaurantOuput extends CoreOutput {
    @Field(type => Restaurant, { nullable: true })
    restaurant?: Restaurant;
}