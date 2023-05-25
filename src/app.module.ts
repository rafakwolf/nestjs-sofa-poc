import { Inject, Module, OnModuleInit } from '@nestjs/common';

import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { PostModule } from './posts/posts.module';
import { ApolloDriver } from '@nestjs/apollo';
import { HttpAdapterHost } from '@nestjs/core';
import { Application } from 'express';
import { useSofa } from 'sofa-api';

@Module({
  imports: [
    PostModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
    }),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(GraphQLSchemaHost) private readonly schemaHost: GraphQLSchemaHost,
    @Inject(HttpAdapterHost) private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  onModuleInit() {
    if (!this.httpAdapterHost) {
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const app: Application = httpAdapter.getInstance();
    const { schema } = this.schemaHost;

    app.use(
      '/api',
      useSofa({
        schema,
        basePath: '/',
        openAPI: {
          info: {
            title: 'Example API',
            version: '3.0.0',
          },
          endpoint: '/openapi.json',
        },
        swaggerUI: {
          endpoint: '/docs',
        },
      }),
    );
  }
}
