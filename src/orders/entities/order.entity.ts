import { OrderItem } from './order-item.entity';
import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { IsEnum, IsNumber } from "class-validator";
import { Restaurant } from './../../restaurants/entities/restaurant.entity';
import { User } from './../../users/entities/user.entity';
import { CoreEntity } from './../../common/entities/core.entity';

export enum OrderStatus {
    Pending = "주문 확인 중",
    Cooking = "요리 중",
    PickedUp = "기사님 픽업",
    Delivered = "배달 완료",
};

registerEnumType(OrderStatus, { name:"OrderStatus" });


@InputType("OrderInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {

    @ManyToOne(type => User, user => user.orders, { onDelete: "SET NULL", nullable: true })
    @Field(type => User, { nullable: true })
    customer?: User;

    @ManyToOne(type => User, user => user.riders, { onDelete: "SET NULL", nullable: true })
    @Field(type => User, { nullable: true })
    driver?: User;

    @ManyToOne(type => Restaurant, restaurant => restaurant.orders, { onDelete: "SET NULL", nullable: true })
    @Field(type => Restaurant, { nullable: true })
    @Field(type => Restaurant)
    restaurant?: Restaurant;

    @ManyToMany(type => OrderItem)
    @JoinTable()
    @Field(type => [OrderItem])
    items: OrderItem[];

    @Column({ nullable: true })
    @Field(type => Float, { nullable: true })
    @IsNumber()
    total?: number;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Pending})
    @Field(type => OrderStatus)
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @RelationId((order: Order) => order.customer)
    customerId: number;

    @RelationId((order: Order) => order.driver)
    driverId: number;
}