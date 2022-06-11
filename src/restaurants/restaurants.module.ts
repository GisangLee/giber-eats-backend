import { RestaurantService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolvers';
import { Restaurant } from './entities/restaurant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant])],
    providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
