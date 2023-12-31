import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Configuración global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true, // Remueve todo lo que no está
                     // incluído en los DTOs.
    forbidNonWhitelisted: true, // Retorna 'bad request' si hay
                                // propiedades en el objeto no requeridas.
    })
   );

   const PORT = process.env.PORT ?? 3000

   console.log(`App corriendo en puero: ${PORT}`)

  await app.listen(PORT);
}
bootstrap();
