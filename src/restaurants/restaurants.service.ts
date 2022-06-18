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
        private readonly categories: Repository<Category>,
    ){}

    async createRestaurant(
        owner: User,
        createRestaurantInputType: CreateRestaurantInputType
    ): Promise<CreateRestaurantOutputType>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInputType);

            const cateogryName = createRestaurantInputType.categoryName.trim().toLowerCase();
            const categorySlug = cateogryName.replace(/ /g, "-");

            let category = await this.categories.findOneBy({ slug: categorySlug });

            if (!category) {
                category = await this.categories.save(
                    this.categories.create({
                        slug: categorySlug,
                        name: cateogryName
                    })
                );
            }

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
}