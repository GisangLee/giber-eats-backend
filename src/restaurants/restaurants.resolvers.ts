import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDTO } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDTO } from "./dto/update-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(of => Restaurant)
export class RestaurantResolver{

    constructor(private readonly restaurantService:RestaurantService){}

    @Query(() => [Restaurant])
    restaurants(): Promise<Restaurant[]>{
        return this.restaurantService.getAll();
    }

    @Mutation(returns => Boolean)
    async createRestaurant(@Args('input') createRestaurantInput: CreateRestaurantDTO): Promise<boolean>{
        try{
            await this.restaurantService.createRestaurant(createRestaurantInput);
            return true;
        } catch(e){
            console.log(`create Restaurant error : ${e}`);
            return false;
        }
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(@Args() updateRestaurantDTO: UpdateRestaurantDTO){
        try{
            await this.restaurantService.updateRestaurant(updateRestaurantDTO);
            return true;
        }catch(e){
            console.log(`update Restaurant Error : ${e}`)
            return false;
        }
    }

}