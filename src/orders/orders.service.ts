import { TakeOrderInput, TakeOrderOutput } from './dto/take-order.dto';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER, NEW_ORDER_UPDATE } from './../common/common.constants';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Dish } from './../restaurants/entities/dish.entity.';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { User, UserRole } from './../users/entities/user.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';

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
        private readonly dishes: Repository<Dish>,

        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,

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

            await this.pubSub.publish(NEW_PENDING_ORDER, { pendingOrders: { order, ownerId: restaurant.ownerId }});

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

    async getAllOrders(user: User, { status, page }:GetOrdersInput): Promise<GetOrdersOutput> {
        try {

            let orders: Order[];

            if (user.role === UserRole.Client) {
                orders = await this.orders.find({
                    where: {
                        customer: user,
                        ...(status && { status })
                    },
                    take: 10,
                    skip: (page - 1) * 10
                });

            } else if (user.role === UserRole.Delivery) {
                orders = await this.orders.find({
                    where: {
                        driver: user,
                        ...(status && { status })
                    },
                    take: 10,
                    skip: (page - 1) * 10
                });

            } else if (user.role === UserRole.Owner) {

                const pageSize = 10;
                const limit = pageSize * page;
                const offset = limit - pageSize;

                const restaurants = await this.restaurants.find({
                    where: {
                        owner: user
                    },
                    relations: ["orders"]
                });

                orders = restaurants.map(restaurant => restaurant.orders).flat(1);
                orders = orders.slice(offset, limit);

                if (status) {
                    orders = orders.filter(order => order.status === status);
                }
            }

            return {
                ok: true,
                orders
            };
            
        } catch (error) {

            return {
                ok: false,
                error
            };
        }
    }

    notAllowed(user, order): boolean {
        let notAllowed: boolean = false;

        if (user.role === UserRole.Client && order.customerId !== user.id) {
            notAllowed = true;
        }

        if (user.role === UserRole.Delivery && order.driverId !== user.id) {
            notAllowed = true;
        }

        if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
            notAllowed = true;
        }
        return notAllowed;
    }

    async getOrderById(user: User, { id: orderId }: GetOrderInput): Promise<GetOrderOutput> {
        try {

            const order = await this.orders.findOne(
                { id: orderId },
                { relations: ["restaurant"]}
            );

            if (!order) {
                return {
                    ok: false,
                    error: "주문이 없습니다."
                };
            }

            if (this.notAllowed(user, order)) {
                return {
                    ok: false,
                    error: "권한이 없습니다."
                };
            }

            return {
                ok: true,
                order,
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async editOrder(user: User, { id: orderId, status }: EditOrderInput): Promise<EditOrderOutput> {
        try {

            const order = await this.orders.findOne({ id: orderId });

            if (!order) {
                return {
                    ok: false,
                    error: "주문을 찾을 수 없습니다."
                };
            }

            if (this.notAllowed(user, order)) {
                return {
                    ok: false,
                    error: "권한이 없습니다."
                };
            }

            let canEdit = true;

            if (user.role === UserRole.Owner) {
                if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
                    canEdit = false;
                }
            }

            if (user.role === UserRole.Delivery) {
                if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                    canEdit = false;
                }
            }

            if (!canEdit) {
                return {
                    ok: false,
                    error: "권한이 없습니다."
                };
            }

            await this.orders.save({
                id: orderId,
                status: status,
            });

            const newOrder = { ...order, status};

            if (user.role === UserRole.Owner) {
                if (status === OrderStatus.Cooked) {
                    await this.pubSub.publish(NEW_COOKED_ORDER, { cookedOrders:newOrder });
                }    
            }

            await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

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

    async takeOrder(driver: User, { id: orderId }: TakeOrderInput): Promise<TakeOrderOutput> {
        try {

            const order = await this.orders.findOne({ id: orderId });

            if (!order) {
                return {
                    ok: false,
                    error: "주문이 없습니다."
                };
            }

            if (order.driver) {
                return {
                    ok: false,
                    error: "기사님이 이미 배정된 주문입니다."
                };
            }

            await this.orders.save({
                id: orderId,
                driver,
            });

            await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: { ...order, driver } });

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