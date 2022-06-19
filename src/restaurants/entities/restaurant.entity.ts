import { Payment } from './../../payments/entities/payment.entity';
import { Order } from './../../orders/entities/order.entity';
import { Dish } from './dish.entity.';
import { User } from './../../users/entities/user.entity';
import { Category } from './category.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";

@InputType("RestaurantInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {

    @Field(type => String) // Graphql
    @Column()  // Database
    @IsString() // DTO
    @Length(2, 10)  // DTO 
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    address: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => String, { defaultValue: false })
    @Column({ default: false })
    @IsBoolean()
    isDeleted: boolean;

    @Field(type => Category, { nullable: true })
    @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: "SET NULL"})
    category: Category;

    @ManyToOne(type => User, user => user.restaurants, { onDelete: "CASCADE" })
    @Field(type => User)
    owner: User;

    @OneToMany(type => Dish, dish => dish.restaurant)
    @Field(type => [Dish], { nullable: true })
    menu: Dish[];

    @OneToMany(type => Order, order => order.restaurant)
    @Field(type => [Order])
    orders: Order[];

    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number;
}