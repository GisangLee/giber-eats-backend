import { GetPaymentsOutput } from './dto/get-payments.dto';
import { User } from './../users/entities/user.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dto/create-payment.dto';
import { PaymentService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Role } from 'src/auth/role.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';

@Resolver(of => Payment)
export class PaymentResolver {
    constructor (
        private readonly paymentService: PaymentService
    ) {}
    

    @Mutation(returns => CreatePaymentOutput)
    @Role(["Owner"])
    createPayment(
        @AuthUser() owner: User,
        @Args("input") createPaymentIput: CreatePaymentInput
    ): Promise<CreatePaymentOutput> {
        return this.paymentService.createPayment(owner, createPaymentIput);
    }

    @Query(returns => GetPaymentsOutput)
    @Role(["Owner"])
    getPayments(
        @AuthUser() owner: User
    ): Promise<GetPaymentsOutput> {
        return this.paymentService.getPayments(owner);
    }
}