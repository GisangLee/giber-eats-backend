import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dto/delete-restaurant.dto';
import { EditRestaurantOutput, EditRestaurantInput } from './dto/edit-restaurant.dto';
import { User } from './../users/entities/user.entity';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateRestaurantInputType, CreateRestaurantOutputType } from "./dto/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";
import { Role } from 'src/auth/role.decorator';

@Resolver(of => Restaurant)
export class RestaurantResolver{

    constructor(private readonly restaurantService:RestaurantService){}

    @Role(["Owner"])
    @Mutation(returns => CreateRestaurantOutputType)
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args('input') createRestaurantInput: CreateRestaurantInputType
    ): Promise<CreateRestaurantOutputType>{
        return this.restaurantService.createRestaurant(authUser, createRestaurantInput);
    }

    @Role(["Owner"])
    @Mutation(returns => EditRestaurantOutput)
    editRestaurant(
        @AuthUser() owner: User,
        @Args("input") editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput);
    }

    @Role(["Owner"])
    @Mutation(returns => DeleteRestaurantOutput)
    deleteRestaurant(
        @AuthUser() owner: User,
        @Args("input") deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput);
    }
}