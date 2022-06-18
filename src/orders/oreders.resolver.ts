import { User } from './../users/entities/user.entity';
import { CreateOrderOutput, CreateOrderInput } from './dto/create-order.dto';
import { OrderService } from './orders.service';
import { Args, Mutation, Resolver } from "@nestjs/graphql";
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

}