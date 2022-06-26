import { DeleteDishInput, DeleteDishOuput } from './dto/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import { Dish } from './entities/dish.entity.';
import { CreateDishInput, CreateDishOuput } from './dto/create-dish.dto';
import { SearchRestaurantInput, SearchRestaurantOuput } from './dto/search-restaurant.dto';
import { RestaurantOuput } from './dto/restaurant.dto';
import { RestaurantsIput, RestaurantsOutput } from './dto/restaurants.dto';
import { CategoryOutput, CategoryInput } from './dto/category.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dto/delete-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dto/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { User } from './../users/entities/user.entity';
import { CreateRestaurantInputType, CreateRestaurantOutputType } from './dto/create-restaurant.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Raw, Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { MyRestaurantsOutput } from './dto/myRestaurants.dto';

@Injectable()
export class RestaurantService {

    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>
    ){}

    async getRestaurantById(id: number): Promise<RestaurantOuput> {
        try {
            const restaurant = await this.restaurants.findOne(
                { id, isDeleted: false },
                { relations: ["menu"] }
            );

            if (!restaurant) {
                return {
                    ok: false,
                    error: "가게를 찾을 수 없습니다."
                };
            }

            return {
                ok: true,
                restaurant
            };
            
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }

    async checkDishExists(owner, dishInput): Promise<any> {
        const dish = await this.dishes.findOne(
            { isDeleted: false, id: dishInput.dishId },
            { relations: ["restaurant"] }
        );

        if (!dish) {
            return {
                ok: false,
                error: "음식을 찾을 수 없습니다."
            };
        }

        if (owner.id !== dish.restaurant.ownerId) {
            return {
                ok: false,
                error: "권한이 없습니다."
            };
        }

        return {
            ok: true,
            dish
        };
    }

    async checkRestaurantExists(owner, restaurantInput): Promise<any>{

        const { ok, error, restaurant } = await this.getRestaurantById(restaurantInput.restaurantId);
        console.log("res", restaurant);
        //const restaurant = await this.restaurants.findOne({ id: restaurantInput.restaurantId });

        if (!restaurant) {
            return {
                ok,
                error
            };
        }

        if (owner.id !== restaurant.ownerId) {
            return {
                ok: false,
                error: "권한이 없습니다."
            };
        }

        return {
            ok: true,
            restaurant
        };
    }

    async getOrCreateCategory(categoryName: string): Promise<Category> {
        const cateogryName = categoryName.trim().toLowerCase();
        const categorySlug = cateogryName.replace(/ /g, "-");

        let category = await this.categories.findOne({ slug: categorySlug });

        if (!category) {
            category = await this.categories.save(
                this.categories.create({
                    slug: categorySlug,
                    name: cateogryName
                })
            );
        }

        return category;
    }

    async createRestaurant(
        owner: User,
        createRestaurantInputType: CreateRestaurantInputType
    ): Promise<CreateRestaurantOutputType>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInputType);

            const category = await this.getOrCreateCategory(createRestaurantInputType.categoryName);

            newRestaurant.category = category;

            newRestaurant.owner = owner;

            await this.restaurants.save(newRestaurant);

            return {
                ok: true,
            };

        } catch(error){

            console.log(`create Restaurant error : ${error}`);

            return {
                ok: false,
                error
            };
        }
    }

    async editRestaurant(
        owner: User,
        editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {

        try {
            const { ok, error, restaurant } = await this.checkRestaurantExists(owner, editRestaurantInput);

            if (!ok || !restaurant) {
                return {
                    ok,
                    error
                };
            }

            let category: Category = null;

            if (editRestaurantInput.categoryName) {
                category = await this.getOrCreateCategory(editRestaurantInput.categoryName);
            }

            await this.restaurants.save([{
                id: editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                ...(category && { category })
            }]);

            return {
                ok: true,
            };
            
        } catch (error) {

            return {
                ok: false,
                error
            };
        }

    }

    async deleteRestaurant(owner: User, deleteRestaurantInput: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
        try {

            const { ok, error, restaurant } = await this.checkRestaurantExists(owner, deleteRestaurantInput);

            if (!ok) {
                return {
                    ok,
                    error
                 };
            }

            //this.restaurants.delete(restaurant.id);

            // 논리 삭제
            restaurant.isDeleted = true;
            this.restaurants.save(restaurant);

            return {
                ok: true
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async allCategories():Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return {
                ok: true,
                categories
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({ category });
    }

    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne({ slug });

            if (!category) {
                return {
                    ok: false,
                    error: "카테고리를 찾을 수 없습니다."
                };
            }

            // pagination
            const restaurants = await this.restaurants.find({
                where: {
                    category,
                    isDeleted: false,                    
                },
                take: 25,
                skip: ( page - 1) * 25,
                order: { isPromoted: "DESC" }
            });

            category.restaurants = restaurants;

            const totalResults = await this.countRestaurants(category);

            return {
                ok: true,
                category,
                restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async allRestaurants({ page }: RestaurantsIput): Promise<RestaurantsOutput> {
        try {

            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    isDeleted: false,       
                },
                take: 25,
                skip: (page - 1) * 25,
                order: { isPromoted: "DESC" }
            });

            const totalPages = Math.ceil(totalResults / 25);

            if (!restaurants) {
                return {
                    ok: false,
                    error: "가게가 없습니다.",
                    totalPages,
                    totalResults,
                };
            }

            return {
                ok: true,
                totalPages,
                restaurants,
                totalResults
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async searchRestaurant({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOuput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    name: Raw(name => `${name} ILIKE '%${query}%'`)
                },
                take: 25,
                skip: (page - 1) * 25,
                
            });

            if (!restaurants) {
                return {
                    ok: true,
                    error: "가게가 없습니다."
                };
            }

            const totalPages = Math.ceil(totalResults / 25);

            return {
                ok: true,
                totalPages,
                restaurants,
                totalResults
            }
            
        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOuput> {
        try {

            const { ok, error, restaurant } = await this.checkRestaurantExists(owner, createDishInput);

            if (!ok || !restaurant) {
                return {
                    ok,
                    error
                };
            }

            const dish = await this.dishes.save(
                this.dishes.create({ ...createDishInput, restaurant })
            );

            console.log("dish", dish);

            return {
                ok: true,
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async editDish(owner: User, editDishInput:EditDishInput): Promise<EditDishOutput> {
        try {
            const { ok, error, dish } = await this.checkDishExists(owner, editDishInput);

            if (!ok || !dish) {
                return {
                    ok,
                    error
                };
            }

            await this.dishes.save([
                {
                    id: editDishInput.dishId,
                    ...editDishInput
                }
            ]);

            return {
                ok: true
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async deleteDish(owner: User, deleteDishInput: DeleteDishInput): Promise<DeleteDishOuput> {
        try {

            const { ok, error, dish } = await this.checkDishExists(owner, deleteDishInput);

            if (!ok || !dish) {
                return {
                    ok,
                    error
                };
            }

            dish.isDeleted = true;
            await this.dishes.save(dish);

            return {
                ok: true
            };
            
        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async myRestaurants (owner: User): Promise<MyRestaurantsOutput> {

        try {

            const restaurants = await this.restaurants.find({ owner });

            return {
                ok: true,
                restaurants
            };

        } catch (error) {
            return {
                ok: false,
                error: "가게를 찾을 수 없습니다"
            };
        }
    }
}