import { CategoryOutput, CategoryInput } from './dto/category.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dto/delete-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { EditRestaurantInput, EditRestaurantOutput } from './dto/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { User } from './../users/entities/user.entity';
import { CreateRestaurantInputType, CreateRestaurantOutputType } from './dto/create-restaurant.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantService {

    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>
        //private readonly categories: CategoryRepository,
    ){}

    async getRestaurantById(id): Promise<Restaurant> {
        const restaurant = this.restaurants.findOne({ id, isDeleted: false });
        return restaurant;
    }

    async checkRestaurantExists(owner, restaurantInput): Promise<any>{

        const restaurant = await this.getRestaurantById(restaurantInput.restaurantId);
        console.log("res", restaurant);
        //const restaurant = await this.restaurants.findOne({ id: restaurantInput.restaurantId });

        if (!restaurant) {
            return {
                ok: false,
                error: "가게를 찾을 수 없습니다."
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

            if (!ok) {
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

    async countRestaurants(category: Category): Promise<Number> {
        return await this.restaurants.count({ category });
    }

    async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                { slug },
                { relations: ["restaurants"] }
            );

            if (!category) {
                return {
                    ok: false,
                    error: "카테고리를 찾을 수 없습니다."
                };
            }

            return {
                ok: true,
                category
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }
}