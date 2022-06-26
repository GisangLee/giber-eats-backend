import { DeleteDishOuput, DeleteDishInput } from './dto/delete-dish.dto';
import { EditDishOutput, EditDishInput } from './dto/edit-dish.dto';
import { CreateDishOuput, CreateDishInput } from './dto/create-dish.dto';
import { Dish } from './entities/dish.entity.';
import { SearchRestaurantOuput, SearchRestaurantInput } from './dto/search-restaurant.dto';
import { RestaurantOuput, RestaurantInput } from './dto/restaurant.dto';
import { RestaurantsOutput, RestaurantsIput } from './dto/restaurants.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CreateRestaurantInputType, CreateRestaurantOutputType } from "./dto/create-restaurant.dto";
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dto/delete-restaurant.dto';
import { EditRestaurantOutput, EditRestaurantInput } from './dto/edit-restaurant.dto';
import { Role } from 'src/auth/role.decorator';
import { RestaurantService } from "./restaurants.service";
import { User } from './../users/entities/user.entity';
import { Category } from './entities/category.entity';
import { Restaurant } from "./entities/restaurant.entity";
import { MyRestaurantsOutput } from './dto/myRestaurants.dto';

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

    
    @Role(["Any"])
    @Query(returns => RestaurantsOutput)
    restaurants(@Args("input") restaurantsInput: RestaurantsIput): Promise<RestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantsInput);
    }
    
    @Role(["Any"])
    @Query(returns => RestaurantOuput)
    restaurant(@Args("input") restaurantInput: RestaurantInput): Promise<RestaurantOuput> {
        return this.restaurantService.getRestaurantById(restaurantInput.restaurantId);
    }

    @Role(["Any"])
    @Query(returns => SearchRestaurantOuput)
    searchRestaurant(@Args("input") searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOuput> {
        return this.restaurantService.searchRestaurant(searchRestaurantInput);
    }
}


@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @ResolveField(returns => Number)
    restaurantCount(@Parent() category: Category): Promise<Number> {
        return this.restaurantService.countRestaurants(category);
    }


    @Role(["Any"])
    @Query(returns => AllCategoriesOutput)
    allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories();
    }

    @Role(["Any"])
    @Query(returns => CategoryOutput)
    category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    }

}


@Resolver(of => Dish)
export class DishResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Role(["Owner"])
    @Mutation(returns => CreateDishOuput)
    createDish(
        @AuthUser() owner: User,
        @Args("input") createDishInput: CreateDishInput
    ): Promise<CreateDishOuput> {
        return this.restaurantService.createDish(owner, createDishInput);
    }

    @Role(["Owner"])
    @Mutation(returns => EditDishOutput)
    editDish(
        @AuthUser() owner: User,
        @Args("input") editDishInput: EditDishInput
    ): Promise<EditDishOutput> {
        return this.restaurantService.editDish(owner, editDishInput);

    }

    @Role(["Owner"])
    @Mutation(returns => DeleteDishOuput)
    deleteDish(
        @AuthUser() owner: User,
        @Args("input") deleteDishInput: DeleteDishInput
    ): Promise<DeleteDishOuput> {
        return this.restaurantService.deleteDish(owner, deleteDishInput);
    }

    @Role(["Owner"])
    @Mutation(returns => MyRestaurantsOutput)
    myRestaurants(
        @AuthUser() owner:User
    ): Promise<MyRestaurantsOutput> {
        return this.restaurantService.myRestaurants(owner);
    }
}