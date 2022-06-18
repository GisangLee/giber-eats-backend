import { Dish } from './../restaurants/entities/dish.entity.';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { RestaurantService } from './../restaurants/restaurants.service';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { User } from './../users/entities/user.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,

        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,

        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,

        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>

    ) {}

    async createOrder(customer: User, { items, restaurantId }: CreateOrderInput): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne({
                id: restaurantId,
                isDeleted: false
            });

            if (!restaurant) {
                return {
                    ok: false,
                    error: "가게를 찾을 수 없습니다."
                };
            }

            let orderFinalPrice = 0;

            const orderItems: OrderItem[] = [];
        
            for (const item of items) {
                const dish = await this.dishes.findOne({ id: item.dishId, isDeleted: false });

                if(!dish) {
                    
                    return {
                        ok: false,
                        error: "음식을 찾지 못했습니다."
                    };
                }

                let dishTotalPrice = dish.price;
                
                for (const itemOption of item.options) {
                    const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name);

                    if (dishOption) {
                        if (dishOption.extra){
                            dishTotalPrice += dishOption.extra;
                        }else{
                            const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice);

                            if (dishOptionChoice) {
                                if(dishOptionChoice.extra) {
                                    dishTotalPrice += dishOptionChoice.extra;
                                }
                            }
                        }
                    }

                }

                orderFinalPrice += dishTotalPrice;

                const orderItem = await this.orderItems.save(this.orderItems.create({
                    dish,
                    options: item.options
                }));

                orderItems.push(orderItem);
            }

            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderFinalPrice,
                items: orderItems,
            }));

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
}