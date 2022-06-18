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


@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @ResolveField(type => Number)
    restaurantCount(@Parent() category: Category): Promise<Number> {
        return this.restaurantService.countRestaurants(category);
    }


    @Role(["Any"])
    @Query(type => AllCategoriesOutput)
    allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories();
    }

    @Role(["Any"])
    @Query(type => CategoryOutput)
    category(@Args() categoryInput: CategoryInput): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    }
}