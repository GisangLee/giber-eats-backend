import { CoreOutput } from 'src/common/dto/output.dto';
import { Restaurant } from './../entities/restaurant.entity';
import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";


@InputType()
export class DeleteRestaurantInput {
    @Field(type => Number)
    restaurantId: number;
};


@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {};