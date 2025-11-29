import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Global() // makes the module available globally for other modules once imported in the app modules
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DataSource, // add the datasource as a provider
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // using the factory function to create the datasource instance
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: String(configService.get('DB_PASSWORD')),
            database: String(configService.get('DB_NAME')),
            synchronize: true,
            entities: [`${__dirname}/../**/**.entity{.ts,.js}`], // this will automatically load all entity file in the src folder
          });
          await dataSource.initialize(); // initialize the data source
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}