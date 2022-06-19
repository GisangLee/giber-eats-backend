import { Payment } from './../entities/payment.entity';
import { CoreOutput } from './../../common/dto/output.dto';
import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";

@InputType()
export class CreatePaymentInput extends PickType(Payment, ["transactionId"]) {
    @Field(type => Int)
    restaurantId: number;
}


@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}