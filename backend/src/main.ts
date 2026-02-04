import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Activer CORS
  app.enableCors();

  // Servir les fichiers statiques (avatars, images)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/uploads/',
  });

  // Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api/v1');

  // Pipes globaux pour la validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Lance une erreur si propriétés non autorisées
      transform: true, // Transforme automatiquement les types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtres d'exceptions globaux
  app.useGlobalFilters(new AllExceptionsFilter());

  // Intercepteurs globaux
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('HomeStock API')
    .setDescription('API de gestion d\'inventaire alimentaire et ménager')
    .setVersion('1.0')
    .addTag('products', 'Gestion des produits')
    .addTag('categories', 'Gestion des catégories')
    .addTag('homes', 'Gestion des maisons')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('recipes', 'Gestion des recettes')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log('');
  console.log('🚀 Application is running on: http://localhost:' + port);
  console.log('📚 API Documentation: http://localhost:' + port + '/api/docs');
  console.log('🔗 API Base URL: http://localhost:' + port + '/api/v1');
  console.log('');
}
bootstrap();
