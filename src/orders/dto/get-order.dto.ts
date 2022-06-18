import { CoreOutput } from './../../common/dto/output.dto';
import { Order } from './../entities/order.entity';
import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";

@InputType()
export class GetOrderInput extends PickType(Order, ["id"]) {}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
    @Field(type => Order, { nullable: true })
    order?: Order;

}
