import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantService {

    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>
    ){}

    getAll(): Promise<Restaurant[]>{
        return this.restaurants.find();
    }

    createRestaurant(createRestaurantDTO: CreateRestaurantDTO): Promise<Restaurant>{
        const newRestaurant = this.restaurants.create(createRestaurantDTO);
        return this.restaurants.save(newRestaurant);
    }

    updateRestaurant(updatereateRestaurantDTO: UpdateRestaurantDTO){
        return this.restaurants.update(
            updatereateRestaurantDTO.id,
            {...updatereateRestaurantDTO.data}
        )
    }
}