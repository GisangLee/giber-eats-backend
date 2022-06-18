import { Dish } from './../restaurants/entities/dish.entity.';
import { OrderItem } from './entities/order-item.entity';
import { RestaurantService } from './../restaurants/restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { OrderResolver } from './oreders.resolver';
import { OrderService } from './orders.service';
import { Order } from './entities/order.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
    providers: [OrderService, OrderResolver]
})
export class OrdersModule {}
