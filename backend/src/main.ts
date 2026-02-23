import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;

  // 🔥 QUAN TRỌNG: bind 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running at:`);
  console.log(`   ➜ Local:   http://localhost:${port}/api`);
  console.log(`   ➜ Network: http://192.168.1.103:${port}/api`);
}
bootstrap();