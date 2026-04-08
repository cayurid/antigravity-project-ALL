import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToMany,
} from 'typeorm';
import { Task } from './Task';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 7, default: '#95a5a6' })
    color: string;

    @CreateDateColumn()
    createdAt: Date;

    // Relationships
    @ManyToMany(() => Task, (task) => task.tags)
    tasks: Task[];
}
