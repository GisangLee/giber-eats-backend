import { Dish } from './entities/dish.entity.';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RestaurantResolver, CategoryResolver, DishResolver } from './restaurants.resolvers';
import { Restaurant } from './entities/restaurant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
    providers: [RestaurantResolver, RestaurantService, CategoryResolver, DishResolver],
})
export class RestaurantsModule {}
