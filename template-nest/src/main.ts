import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonExceptionFilter } from './core/filters/json-exception.filter';
import { ResponseInterceptor } from './core/interceptors/reponse.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new JsonExceptionFilter())

  await app.listen(3000);
}
bootstrap();
