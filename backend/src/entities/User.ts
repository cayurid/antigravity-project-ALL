import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Task } from './Task';
import { Project } from './Project';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50, default: 'user' })
    role: 'admin' | 'user';

    @Column({ type: 'boolean', default: false })
    emailVerified: boolean;

    @Column({ type: 'text', nullable: true })
    avatar: string;

    @Column({ type: 'varchar', length: 15, default: 'pt-BR' })
    language: string;

    @Column({ type: 'varchar', length: 50, default: 'light' })
    theme: 'light' | 'dark';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    // Relationships
    @OneToMany(() => Task, (task) => task.user, { cascade: true })
    tasks: Task[];

    @OneToMany(() => Project, (project) => project.owner, { cascade: true })
    projects: Project[];
}
