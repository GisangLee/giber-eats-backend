import { Order } from './../entities/order.entity';
import { CoreOutput } from './../../common/dto/output.dto';
import { InputType, ObjectType, PickType } from "@nestjs/graphql";

@InputType()
export class UpdateOrderInput extends PickType(Order, ["id"]) {}

@ObjectType()
export class UpdateOrderOutput extends CoreOutput {}