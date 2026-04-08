import { DataSource } from 'typeorm';
import {
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_USERNAME,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
} from '../config/database';
import { User } from './User';
import { Project } from './Project';
import { Task } from './Task';
import { Tag } from './Tag';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: MYSQL_HOST || 'mysql',
    port: MYSQL_PORT || 3306,
    username: MYSQL_USERNAME || 'task_user',
    password: MYSQL_PASSWORD || 'task_password',
    database: MYSQL_DATABASE || 'task_manager',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Project, Task, Tag],
    migrations: ['src/database/migrations/*.ts'],
    subscribers: [],
});
