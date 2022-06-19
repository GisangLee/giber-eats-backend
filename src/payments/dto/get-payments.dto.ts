import { Payment } from './../entities/payment.entity';
import { CoreOutput } from './../../common/dto/output.dto';
import { Field, InputType, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class GetPaymentsOutput extends CoreOutput {
    @Field(type => [Payment], { nullable: true })
    payments?: Payment[];
}