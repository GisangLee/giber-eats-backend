import { UpdateOrderInput } from './dto/order-updates.dto';
import { PubSub } from "graphql-subscriptions";
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER, NEW_ORDER_UPDATE } from './../common/common.constants';
import { EditOrderOutput, EditOrderInput } from './dto/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { GetOrdersOutput, GetOrdersInput } from './dto/get-orders.dto';
import { CreateOrderOutput, CreateOrderInput } from './dto/create-order.dto';
import { OrderService } from './orders.service';
import { User } from './../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { Inject } from '@nestjs/common';


@Resolver(of => Order)
export class OrderResolver {
    constructor(
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,

        private readonly orderService: OrderService,
    ) {}

    @Role(["Client"])
    @Mutation(returns => CreateOrderOutput)
    createOrder(
        @AuthUser() customer: User,
        @Args("input") createOrderIput: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        return this.orderService.createOrder(customer, createOrderIput);
    }

    @Role(["Any"])
    @Query(returns => GetOrdersOutput)
    allOrders(
        @AuthUser() user: User,
        @Args("input") getOrderInput: GetOrdersInput
    ): Promise<GetOrdersOutput> {
        return this.orderService.getAllOrders(user, getOrderInput);
    }

    @Role(["Any"])
    @Query(returns => GetOrderOutput)
    getOrder(
        @AuthUser() user: User,
        @Args("input") getOrderInput:GetOrderInput
    ): Promise<GetOrderOutput> {
        return this.orderService.getOrderById(user, getOrderInput);
    }

    @Role(["Delivery", "Owner"])
    @Mutation(returns => EditOrderOutput)
    editOrder(
        @AuthUser() user: User,
        @Args("input") editOrderInput: EditOrderInput
    ): Promise<EditOrderOutput> {
        return this.orderService.editOrder(user, editOrderInput);
    }

    @Subscription(returns => Order, {
        filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
            return ownerId === user.id;
        },
        resolve: ({ pendingOrders: { order }}) => order,
    })
    @Role(["Owner"])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
    }

    @Subscription(returns => Order)
    @Role(["Delivery", "Owner"])
    cookedOrders() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
    }

    @Subscription(returns => Order, {
        filter: (
            { orderUpdates: order }: { orderUpdates: Order },
            { input } : { input : UpdateOrderInput},
            { user } : { user : User }
        ) => {
            if (order.driverId !== user.id && order.customerId !== user.id && order.restaurant.ownerId !== user.id) {
                return false;
            } 
            return order.id === input.id;
        },
    })
    @Role(["Any"])
    orderUpdates(
        @Args("input") updateOrderInput: UpdateOrderInput
    ) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
    }
}