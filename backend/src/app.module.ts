import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HomesModule } from './homes/homes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProductBatchesModule } from './product-batches/product-batches.module';
import { CartModule } from './cart/cart.module';
import { InviteLinksModule } from './invite-links/invite-links.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables d'environnement accessibles partout
    }),
    UsersModule,
    AuthModule,
    HomesModule,
    PermissionsModule,
    CategoriesModule,
    ProductsModule,
    ProductBatchesModule,
    CartModule,
    InviteLinksModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
