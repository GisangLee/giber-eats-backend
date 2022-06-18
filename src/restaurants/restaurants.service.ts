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

    async getOrCreate(categoryName: string): Promise<Category> {
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

            const category = await this.getOrCreate(createRestaurantInputType.categoryName);

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
            const restaurant = await this.restaurants.findOne({ id: editRestaurantInput.restaurantId });

            if (!restaurant) {
                return {
                    ok: false,
                    error: "가게를 찾지 못했습니다."
                };
            }

            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "권한이 없습니다."
                };
            }

            let category: Category = null;

            if (editRestaurantInput.categoryName) {
                category = await this.getOrCreate(editRestaurantInput.categoryName);
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
}