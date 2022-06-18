import { Category } from './../entities/category.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';


@ObjectType()
export class AllCategoriesOutput extends CoreOutput {

    @Field(type => [Category], { nullable: true })
    categories?: Category[];
}