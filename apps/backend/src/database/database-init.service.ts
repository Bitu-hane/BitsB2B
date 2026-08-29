import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Database');

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const dbName = process.env.DB_NAME || 'bitsb2b';
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 5432;

    try {
      if (this.dataSource.isInitialized) {
        this.logger.log(`=======================================================`);
        this.logger.log(`✅ PostgreSQL successfully connected to database "${dbName}" on ${host}:${port}`);
        this.logger.log(`=======================================================`);

        // Load schema DDL script
        const possiblePaths = [
          path.resolve(__dirname, 'schema.sql'),
          path.resolve(process.cwd(), 'src/database/schema.sql'),
          path.resolve(process.cwd(), 'backend/src/database/schema.sql'),
        ];
        const schemaPath = possiblePaths.find(p => fs.existsSync(p));

        if (schemaPath) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await this.dataSource.query(sql);
          this.logger.log(`🐘 PostgreSQL schema.sql (${path.basename(schemaPath)}) executed: all tables & indexes verified and ready.`);
        } else {
          this.logger.warn(`⚠️ schema.sql not found in search paths.`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`⚠️ PostgreSQL Database connection notice: ${err.message}`);
      this.logger.warn(`👉 Please verify PostgreSQL service is running on ${host}:${port}`);
    }
  }
}
