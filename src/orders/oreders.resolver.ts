import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GetOrdersOutput, GetOrdersInput } from './dto/get-orders.dto';
import { CreateOrderOutput, CreateOrderInput } from './dto/create-order.dto';
import { OrderService } from './orders.service';
import { User } from './../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';

@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly orderService: OrderService
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
}