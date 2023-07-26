import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot(process.env.MONGO_URI, {
      // agregamos el nombre de la base de datos con la que queremos trabajar
      dbName: process.env.MONGO_DB_NAME
    }),
    AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {

 

}
