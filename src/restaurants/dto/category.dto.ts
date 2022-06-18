
import { Category } from './../entities/category.entity';import { CoreOutput } from 'src/common/dto/output.dto';
import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { IsString } from 'class-validator';


@ArgsType()
export class CategoryInput {
    @Field(type => String)
    @IsString()
    slug: string;
}

@ObjectType()
export class CategoryOutput extends CoreOutput {

    @Field(type => Category, { nullable: true })
    category?: Category;

}